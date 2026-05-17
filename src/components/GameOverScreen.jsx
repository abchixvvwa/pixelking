import { useState, useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';
import { supabase, getUser } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { analyzeAndSaveMistake } from '../logic/mistakeAnalyzer';

import { LightningAvatar, FoxAvatar, WolfAvatar, IceAvatar, KingAvatar, PixelTrophy } from './icons/PixelIcons';

// ──── Psychotype logic ────
function getPsychotype(metrics) {
  const { avgThinkTime, sacrifices, capturesChosen, totalMoves } = metrics;

  if (avgThinkTime < 3 && sacrifices > 1)
    return { id: 'lightning', name: 'Молния', desc: 'Действуешь быстро и рискованно', Avatar: LightningAvatar };
  if (avgThinkTime > 8 && sacrifices === 0)
    return { id: 'ice', name: 'Хладнокровный', desc: 'Методичен и осторожен', Avatar: IceAvatar };
  if (sacrifices > 2)
    return { id: 'fox', name: 'Лис', desc: 'Жертвуешь фигурами ради позиции', Avatar: FoxAvatar };
  if (totalMoves > 0 && capturesChosen > totalMoves * 0.7)
    return { id: 'wolf', name: 'Волк', desc: 'Агрессивен, всегда атакует', Avatar: WolfAvatar };
  return { id: 'king', name: 'Король', desc: 'Сбалансированная игра', Avatar: KingAvatar };
}

// ──── Groq streaming ────
async function streamCoachAnalysis(params, onChunk, onDone, onError) {
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    onChunk('⚠️ Groq API ключ не задан. Играйте дальше, но тренер пока отдыхает.');
    onDone();
    return;
  }

  const { winner, gameMode, difficulty, totalMoves, avgThinkTime,
          capturedByWhite, capturedByBlack, sacrifices, moveSpeed } = params;

  const systemPrompt = `Ты суровый 8-битный тренер: коротко, по делу, указывая на конкретные ошибки (например, "Зевнул шашку на B4, надо было бить"). Никакой воды, только сухой анализ ходов.`;

  const prompt = `Проанализируй партию:

Результат: ${winner === 'white' ? 'Белые победили' : 'Чёрные победили'}
Режим: ${gameMode} (${difficulty || 'локальная игра'})
Всего ходов: ${totalMoves}
Среднее время на ход: ${avgThinkTime}с
Взято фигур белыми: ${capturedByWhite}
Взято фигур чёрными: ${capturedByBlack}
Жертвы: ${sacrifices}
Скорость ходов: ${moveSpeed.join(', ')}с

Дай короткий разбор:
1. Общая оценка
2. Что хорошо
3. Ошибки
4. Один совет`;

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
        stream: true
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Groq API Error (${response.status}) in stream: ${err}`);
      onChunk(`⚠️ Ошибка тренера (${response.status}). Видимо, ушел на перекур.`);
      onDone();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        if (line === 'data: [DONE]') continue;
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data.choices[0]?.delta?.content || '';
            if (text) onChunk(text);
          } catch (e) {
            // skip malformed JSON chunks
          }
        }
      }
    }
    onDone();
  } catch (err) {
    console.error('Groq fetch error:', err);
    onChunk('⚠️ Связь с тренером потеряна (ошибка сети).');
    onDone();
    // Don't call onError to avoid complete UI failure, we already showed fallback text
  }
}

// ──── Skeleton loader ────
function SkeletonLoader() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-white/[0.06] rounded-lg w-full" />
      <div className="h-4 bg-white/[0.06] rounded-lg w-[90%]" />
      <div className="h-4 bg-white/[0.06] rounded-lg w-[95%]" />
      <div className="h-4 bg-white/[0.06] rounded-lg w-[60%]" />
      <div className="h-4 bg-white/[0.06] rounded-lg w-full mt-4" />
      <div className="h-4 bg-white/[0.06] rounded-lg w-[85%]" />
      <div className="h-4 bg-white/[0.06] rounded-lg w-[75%]" />
    </div>
  );
}

// ──── Stat card ────
function StatCard({ label, value, icon }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span className="text-lg mb-1">{icon}</span>
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

// ──── Main component ────
export default function GameOverScreen() {
  const winner = useGameStore((s) => s.winner);
  const resetGame = useGameStore((s) => s.resetGame);
  const navigate = useNavigate();
  const gameMode = useGameStore((s) => s.gameMode);
  const aiDifficulty = useGameStore((s) => s.aiDifficulty);
  const capturedWhite = useGameStore((s) => s.capturedWhite);
  const capturedBlack = useGameStore((s) => s.capturedBlack);
  const moveHistory = useGameStore((s) => s.moveHistory);
  const moveSpeed = useGameStore((s) => s.moveSpeed);
  const capturesChosen = useGameStore((s) => s.capturesChosen);
  const sacrifices = useGameStore((s) => s.sacrifices);
  const board = useGameStore((s) => s.board);

  const [coachText, setCoachText] = useState('');
  const [coachDone, setCoachDone] = useState(false);
  const [coachError, setCoachError] = useState(false);
  const [copied, setCopied] = useState(false);
  const coachRef = useRef(null);
  const streamStarted = useRef(false);

  // Leaderboard state
  const [showModal, setShowModal] = useState(true);
  const [username, setUsername] = useState(localStorage.getItem('duels_username') || '');
  const [city, setCity] = useState(localStorage.getItem('duels_city') || '');
  const [submitting, setSubmitting] = useState(false);

  const totalMoves = moveHistory.length;
  const avgThinkTime = moveSpeed.length > 0
    ? (moveSpeed.reduce((a, b) => a + b, 0) / moveSpeed.length).toFixed(1)
    : '0';

  const isVictory = winner === 'white' || (gameMode === 'local' && winner);
  const resultTitle = gameMode === 'ai'
    ? (winner === 'white' ? 'VICTORY!' : 'GAME OVER')
    : (winner === 'white' ? 'WHITE WINS' : 'BLACK WINS');
  const resultColor = (winner === 'white' || isVictory) ? '#f7c948' : '#ff0044';

  const diffLabel = aiDifficulty === 'novice' ? 'Новичок'
    : aiDifficulty === 'tactician' ? 'Тактик'
    : aiDifficulty === 'master' ? 'Мастер' : null;

  const metrics = {
    avgThinkTime: parseFloat(avgThinkTime),
    sacrifices,
    capturesChosen,
    totalMoves,
  };
  const psychotype = getPsychotype(metrics);

  const handleSubmitScore = async () => {
    if (!username.trim()) return;
    setSubmitting(true);
    localStorage.setItem('duels_username', username);
    localStorage.setItem('duels_city', city);

    // Fetch existing user to update wins/losses
    const { data: existingUser } = await supabase
      .from('leaderboard')
      .select('id, wins, losses, total_games')
      .eq('username', username)
      .single();

    const isWin = isVictory;
    let newWins = isWin ? 1 : 0;
    let newLosses = !isWin ? 1 : 0;
    let newTotal = 1;

    if (existingUser) {
      newWins += existingUser.wins;
      newLosses += existingUser.losses;
      newTotal += existingUser.total_games;
    }

    await supabase.from('leaderboard').upsert({
      ...(existingUser ? { id: existingUser.id } : {}),
      username,
      city: city.trim() || 'Неизвестно',
      wins: newWins,
      losses: newLosses,
      total_games: newTotal,
      best_archetype: `${psychotype.emoji} ${psychotype.name}`,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'username' }); // upsert by default matches id or PK, if we want to match username it's better to ensure PK or handle manually. Wait, if id is provided it updates. If not, it inserts. This works correctly.

    setSubmitting(false);
    setShowModal(false);
  };

  // Start streaming on mount
  useEffect(() => {
    if (streamStarted.current) return;
    streamStarted.current = true;

    // Trigger background mistake analysis and save match history
    getUser().then(({ data: { user } }) => {
      if (user) {
        if (moveHistory.length > 2) {
          analyzeAndSaveMistake(user.id, moveHistory, board);
        }
        if (!username) {
          const defaultName = localStorage.getItem('duels_player_name') || user.user_metadata?.full_name || user.email?.split('@')[0] || '';
          setUsername(defaultName);
        }

        const opponentName = gameMode === 'ai' ? `AI (${diffLabel || 'Локальный'})` : 'PVP';
        const resultString = isVictory ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ';
        
        supabase.from('match_history').insert({
          user_id: user.id,
          opponent: opponentName,
          result: resultString,
          moves: totalMoves,
          archetype: `${psychotype.emoji} ${psychotype.name}`
        }).then(({ error }) => {
          if (error) console.error('Error saving match history:', error);
        });

      } else {
        const opponentName = gameMode === 'ai' ? `AI (${diffLabel || 'Локальный'})` : 'PVP';
        const resultString = isVictory ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ';
        localStorage.setItem('duels_last_game', JSON.stringify({
          opponent: opponentName,
          result: resultString,
          moves: totalMoves,
          psychotype: `${psychotype.emoji} ${psychotype.name}`
        }));
      }
    });

    streamCoachAnalysis(
      {
        winner,
        gameMode,
        difficulty: diffLabel,
        totalMoves,
        avgThinkTime,
        capturedByWhite: capturedBlack,
        capturedByBlack: capturedWhite,
        sacrifices,
        moveSpeed,
      },
      (chunk) => {
        setCoachText((prev) => prev + chunk);
      },
      () => setCoachDone(true),
      (err) => {
        console.error('Coach error:', err);
        setCoachText((prev) => prev + '\n\n⚠️ Ошибка при загрузке разбора.');
        setCoachError(true);
        setCoachDone(true);
      }
    );
  }, []);

  // Auto-scroll coach text
  useEffect(() => {
    if (coachRef.current) {
      coachRef.current.scrollTop = coachRef.current.scrollHeight;
    }
  }, [coachText]);

  const handleShare = () => {
    const text = `Я сыграл в PIXELKING и мой психотип — ${psychotype.emoji} ${psychotype.name}! pixelking.app`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 overflow-y-auto bg-[var(--bg-primary)]">
      {/* ──── Result header ──── */}
      <div className="text-center mb-10 mt-6 animate-fade-in">
        <h1 className="text-4xl md:text-5xl arcade-text mb-4 tracking-tight animate-blink" style={{ color: resultColor, textShadow: '4px 4px 0 #000' }}>
          {resultTitle}
        </h1>
        {gameMode === 'ai' && diffLabel && (
          <p className="arcade-text text-[10px] text-[var(--color-dim)]">
            VS AI · {diffLabel.toUpperCase()}
          </p>
        )}
      </div>

      {/* ──── Stats grid ──── */}
      <div className="w-full max-w-sm mb-10 animate-fade-in bg-[var(--bg-card)] p-6 pixel-border" style={{ boxShadow: '6px 6px 0 #000' }}>
        <h2 className="arcade-text text-sm text-[var(--color-light)] mb-6 text-center">STATISTICS</h2>
        <div className="flex flex-col gap-4 font-mono text-sm">
          <div className="flex justify-between items-center">
            <span className="text-[#4cc9f0]">SCORE</span>
            <span className="text-[var(--accent-yellow)] text-lg">{(totalMoves * 10 + capturedBlack * 50).toString().padStart(6, '0')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#4cc9f0]">MOVES</span>
            <span className="text-[var(--accent-yellow)] text-lg">{totalMoves.toString().padStart(3, '0')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#4cc9f0]">AVG TIME</span>
            <span className="text-[var(--accent-yellow)] text-lg">{avgThinkTime.toString().padStart(4, '0')}s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#4cc9f0]">CAPTURES</span>
            <span className="text-[var(--accent-yellow)] text-lg">{capturedBlack.toString().padStart(3, '0')}</span>
          </div>
        </div>
      </div>

      {/* ──── AI Coach ──── */}
      <div
        className="w-full max-w-lg mb-8 animate-fade-in"
        style={{ animationDelay: '0.3s' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider arcade-text text-sm">РАЗБОР ПАРТИИ</h2>
          {!coachDone && (
            <div className="flex gap-1 ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        <div
          ref={coachRef}
          className="rounded-2xl p-5 max-h-72 overflow-y-auto"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            scrollbarWidth: 'thin',
          }}
        >
          {coachText ? (
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {coachText}
              {!coachDone && (
                <span className="inline-block w-2 h-4 ml-0.5 bg-[#6C63FF] animate-pulse rounded-sm align-text-bottom" />
              )}
            </p>
          ) : (
            <SkeletonLoader />
          )}
        </div>
      </div>

      {/* ──── Psychotype (only after coach is done) ──── */}
      {coachDone && (
        <div
          className="w-full max-w-lg mb-10 animate-fade-in"
        >
          <div
            className="p-6 text-center bg-[var(--bg-card)] pixel-border flex flex-col items-center"
            style={{ boxShadow: '6px 6px 0 #000' }}
          >
            <div className="text-xs text-[var(--color-dim)] font-mono tracking-widest mb-4 uppercase">
              ТВОЙ СТИЛЬ ИГРЫ
            </div>
            <div className="mb-4">
              <psychotype.Avatar size={64} />
            </div>
            <div className="text-xl arcade-text text-[var(--color-light)] mb-2">
              {psychotype.name.toUpperCase()}
            </div>
            <div className="text-sm font-sans text-[var(--color-dim)] mb-6 font-bold">
              {psychotype.desc}
            </div>
            <button
              onClick={handleShare}
              className="pixel-button w-full py-4 text-xs"
            >
              {copied ? 'СКОПИРОВАНО!' : 'ПОДЕЛИТЬСЯ'}
            </button>
          </div>
        </div>
      )}

      {/* ──── Actions ──── */}
      <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-in" style={{ animationDelay: '0.45s' }}>
        <button
          onClick={resetGame}
          className="w-full pixel-button py-4 text-sm"
        >
          PLAY AGAIN
        </button>
        <button
          onClick={() => navigate('/play')}
          className="w-full py-4 text-sm arcade-text text-[var(--color-dim)] hover:text-[var(--color-light)] border-2 border-[var(--color-dim)] bg-transparent pixel-shadow"
        >
          MAIN MENU
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center">
        <p className="text-[10px] text-gray-700 tracking-wider">NFAC · 2026</p>
      </footer>

      {/* Leaderboard Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(5px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 animate-fade-in" style={{ background: '#12121A', border: '1px solid rgba(108, 99, 255, 0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <h3 className="text-xl font-bold text-white mb-2 text-center flex items-center justify-center gap-2"><PixelTrophy size={24}/> Добавить результат?</h3>
            <p className="text-xs text-gray-400 mb-6 text-center">Запиши себя в глобальный лидерборд PIXELKING</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Имя в игре</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Твой никнейм"
                  className="w-full px-4 py-2 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all placeholder-gray-600"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Город</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Алматы"
                  className="w-full px-4 py-2 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all placeholder-gray-600"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-gray-400 bg-white/[0.04] hover:bg-white/[0.07] transition-all"
              >
                Пропустить
              </button>
              <button
                onClick={handleSubmitScore}
                disabled={submitting || !username.trim()}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white transition-all ${submitting || !username.trim() ? 'opacity-50 cursor-not-allowed bg-[#6C63FF]/50' : 'bg-[#6C63FF] hover:bg-[#5B54E6] shadow-lg shadow-[#6C63FF]/20'}`}
              >
                {submitting ? 'Сохранение...' : 'Отправить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
