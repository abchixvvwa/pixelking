import { createInitialBoard } from './checkers';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

/**
 * Common fetch logic for Groq API
 */
async function fetchFromGroq(systemPrompt, userPrompt) {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('Groq API Key is missing. Setup required.');
  }

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
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');

  return JSON.parse(text);
}

/**
 * Generate a "Daily Bug Bounty" scenario.
 * The AI generates a 2D array board state where white is losing or has made a mistake, 
 * and specifies the single correct move to save the game.
 */
export async function generateBugBounty() {
  const sys = `Ты — генератор задач по русским шашкам (8x8).
Выведи валидный JSON. Шашки: 0=пусто, 1=белая, 2=черная, 3=белая дамка, 4=черная дамка.
Сгенерируй позицию, где белые должны сделать единственный правильный ход (hotfix), чтобы спасти игру или победить.`;

  const user = `Верни JSON в таком формате:
{
  "board": [[... 8x8 массив ...]],
  "correctMove": "e3-f4",
  "explanation": "Этот ход закрывает диагональ и спасает от двойного взятия."
}`;

  return await fetchFromGroq(sys, user);
}

/**
 * Glitch Levels: AI generates a game board with special synthetic constraints.
 */
export async function generateGlitchLevel() {
  const sys = `Ты — генератор безумных уровней по шашкам. Выведи валидный JSON.`;
  const constraints = [
    "Никаких дамок",
    "Победа только по черным диагоналям",
    "Королевская битва: У всех только дамки",
    "Заминированный центр: Нельзя вставать на центральные клетки"
  ];
  const randomConstraint = constraints[Math.floor(Math.random() * constraints.length)];

  const user = `Создай сложную позицию для белых с правилом: "${randomConstraint}".
Формат JSON:
{
  "board": [[... 8x8 массив ...]],
  "constraint": "${randomConstraint}",
  "story": "Краткое кибер-описание уровня"
}`;

  return await fetchFromGroq(sys, user);
}

/**
 * Trap Architect validation.
 * Evaluate if the player's custom arrangement successfully traps the AI.
 */
export async function evaluateTrapPlacement(boardState) {
  const sys = `Ты — Test Runner. Анализируешь расстановку шашек на доске. Задача: белые расставили 3 свои и 5 черных шашек, чтобы заставить черных сделать вынужденное взятие и попасть в ловушку. Выведи JSON.`;
  
  const user = `Оцени эту доску: ${JSON.stringify(boardState)}.
Является ли позиция выигрышной ловушкой для белых (черные обязаны бить и проигрывают)?
Формат JSON:
{
  "isSuccess": true/false,
  "verdict": "Твоя стратегия упала на 4-м ходу из-за неучтенного Edge Case... или Успех!"
}`;

  return await fetchFromGroq(sys, user);
}
