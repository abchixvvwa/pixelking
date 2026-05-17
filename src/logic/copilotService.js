const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export async function askCopilot(boardState, type) {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return 'SYSTEM ERROR: GROQ_API_KEY OFFLINE';
  }

  let prompt = '';
  if (type === 'BEST_MOVE') {
    prompt = `Проанализируй доску и подскажи лучший ход для белых. Ответь максимально коротко в кибер-стиле (максимум 2 предложения).`;
  } else if (type === 'THREATS') {
    prompt = `Оцени угрозы со стороны черных. Какая фигура под боем? Ответь коротко и сухо (кибер-терминал).`;
  } else if (type === 'EVALUATION') {
    prompt = `Сделай оценку позиции. У кого преимущество? Ответь коротко, холодно и математически точно.`;
  }

  const systemPrompt = `Ты — IN-GAME AI COPILOT для игры в русские шашки (8x8).
Текущая матрица доски (0=пусто, 1=твоя белая, 2=враг черная, 3=твоя дамка, 4=вражеская дамка):
${JSON.stringify(boardState)}

Твоя задача — давать короткие, технические советы. Никаких приветствий и воды. Формат: "[ АНАЛИЗ ] ...текст..."`;

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
        ]
      })
    });

    if (!response.ok) return 'ERROR: API REJECTED REQUEST';

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || 'NO DATA';
    
    // Strip markdown bold/italic just in case
    return text.replace(/[*_~`#]/g, '').trim();

  } catch (e) {
    console.error(e);
    return 'FATAL EXCEPTION: CONNECTION LOST';
  }
}
