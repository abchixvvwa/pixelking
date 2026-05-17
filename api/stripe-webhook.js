import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable body parsing for webhook to verify signature properly
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf.toString(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier || 'pro'; // default to pro if not specified

    if (userId) {
      try {
        const { error } = await supabase
          .from('profiles') // Adjust if your table is named differently
          .update({ subscriptionTier: tier })
          .eq('id', userId);

        if (error) {
          console.error('Supabase update error:', error);
          return res.status(500).json({ error: 'Database update failed' });
        }
        console.log(`Successfully upgraded user ${userId} to ${tier}`);
      } catch (err) {
        console.error('Webhook processing error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  res.status(200).json({ received: true });
}
