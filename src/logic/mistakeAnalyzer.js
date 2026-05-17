import { supabase } from '../lib/supabase';

export async function analyzeAndSaveMistake(userId, moveHistory, boardState) {
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  if (!API_KEY || API_KEY === 'your_api_key_here' || !userId) return;

  const systemPrompt = `Ты суровый 8-битный тренер по шашкам: коротко, по делу, указывая на конкретные ошибки (например, "Зевнул шашку на B4, надо было бить"). Никакой воды, только сухой анализ ходов. ОБЯЗАТЕЛЬНО верни ответ в формате JSON.`;
  
  const prompt = `Найди самый плохой ход белых в этой партии.

История ходов: ${JSON.stringify(moveHistory)}
Финальная позиция: ${JSON.stringify(boardState)}

Ответь ТОЛЬКО в валидном JSON (без markdown-оберток):
{
  "worstMove": "e3-f4",
  "boardBefore": [[...8x8...]],
  "correctMove": "e3-d4", 
  "explanation": "Зевнул шашку. Этот ход открыл фланг и позволил сопернику взять 2 фигуры. Надо было..."
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API Error (${response.status}): ${errorText}`);
      return;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return;

    const parsed = JSON.parse(text);
    const newMistake = {
      id: crypto.randomUUID(),
      user_id: userId || 'local_user',
      board_state: parsed.boardBefore,
      wrong_move: parsed.worstMove,
      correct_move: parsed.correctMove,
      explanation: parsed.explanation,
      created_at: new Date().toISOString(),
      next_review: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      resolved: false
    };

    // Save to supabase
    const { error } = await supabase.from('mistakes').insert(newMistake);
    
    // Fallback to localStorage if Supabase is not configured
    if (error && error.message.includes('Supabase не настроен')) {
      const localMistakes = JSON.parse(localStorage.getItem('duels_mistakes') || '[]');
      localMistakes.push(newMistake);
      localStorage.setItem('duels_mistakes', JSON.stringify(localMistakes));
    }

  } catch (err) {
    console.error('Failed to analyze mistake:', err);
  }
}
