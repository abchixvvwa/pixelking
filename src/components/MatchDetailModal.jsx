import { useState, useEffect } from 'react';
import { PixelMedal, PixelLightningBolt, FoxAvatar, WolfAvatar, IceAvatar, LightningAvatar, KingAvatar } from './icons/PixelIcons';

const psychotypeMap = {
  'wolf': WolfAvatar,
  'fox': FoxAvatar,
  'lightning': LightningAvatar,
  'ice': IceAvatar,
  'king': KingAvatar,
};

function getAvatarForArchetype(archetypeName) {
  if (!archetypeName) return <PixelMedal size={48} rank={1} />;
  const name = archetypeName.toLowerCase();
  if (name.includes('волк')) return <WolfAvatar size={48} />;
  if (name.includes('лис')) return <FoxAvatar size={48} />;
  if (name.includes('хладнокровный') || name.includes('ice')) return <IceAvatar size={48} />;
  if (name.includes('молния')) return <LightningAvatar size={48} />;
  if (name.includes('король')) return <KingAvatar size={48} />;
  return <PixelMedal size={48} rank={2} />;
}

// Convert coordinates like [5,2] to algebraic like "c3"
function toAlgebraic(r, c) {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return `${letters[c]}${8 - r}`;
}

export default function MatchDetailModal({ match, onClose, isProMax }) {
  const [moves, setMoves] = useState([]);
  
  useEffect(() => {
    // Attempt to load full move data if available
    let loadedMoves = match.move_data;
    if (!loadedMoves) {
      // Mock moves if not found
      loadedMoves = Array.from({ length: match.moves || 12 }).map((_, i) => ({
        move: `${['a','c','e','g'][Math.floor(Math.random()*4)]}${Math.floor(Math.random()*3)+3}-${['b','d','f','h'][Math.floor(Math.random()*4)]}${Math.floor(Math.random()*3)+4}`,
        player: i % 2 === 0 ? 'ВЫ' : match.opponent,
        comment: i % 2 === 0 
          ? ['Отличный контроль центра.', 'Слишком агрессивно, подставляешь шашку.', 'Хороший ход.', 'Нужно было развивать левый фланг.'][Math.floor(Math.random()*4)]
          : ['Соперник отвечает уверенно.', 'Он готовит ловушку.', 'Ошибочный ход.', 'Стандартный размен.'][Math.floor(Math.random()*4)]
      }));
    } else {
      loadedMoves = loadedMoves.map((m, i) => ({
        move: m.from && m.to ? `${toAlgebraic(m.from[0], m.from[1])}-${toAlgebraic(m.to[0], m.to[1])}` : m.move,
        player: i % 2 === 0 ? 'ВЫ' : match.opponent,
        comment: m.comment || ['Хороший контроль доски.', 'Можно было сыграть точнее.', 'Критическая ошибка.', 'Отличный тактический маневр.'][Math.floor(Math.random()*4)]
      }));
    }
    setMoves(loadedMoves);
  }, [match]);

  const isWin = match.result === 'ПОБЕДА';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[var(--bg-card)] pixel-border pixel-shadow w-full max-w-2xl mt-auto mb-auto relative flex flex-col max-h-[90vh]">
        
        {/* Header Button */}
        <button 
          onClick={onClose}
          className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-[var(--accent-red)] text-white w-10 h-10 border-4 border-white flex items-center justify-center arcade-text hover:-translate-y-1 hover:translate-x-[calc(50%+2px)] transition-transform z-10 shadow-[4px_4px_0_#000]"
        >
          X
        </button>

        {/* 2. Базовая статистика */}
        <div className="p-6 border-b-4 border-white/5 flex-shrink-0 relative">
          <div className="text-center mb-6">
            <h2 className="arcade-text text-xl text-[var(--color-dim)] tracking-widest mb-3">MATCH REVIEW</h2>
            <div className={`arcade-text text-4xl tracking-widest ${isWin ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
              {match.result}
            </div>
          </div>

          <div className="flex items-center justify-center gap-12 mb-6">
            {/* Player */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-[var(--bg-primary)] border-2 border-white flex items-center justify-center p-2">
                {getAvatarForArchetype(match.archetype)}
              </div>
              <span className="arcade-text text-sm text-white">ВЫ</span>
            </div>
            
            {/* Stats */}
            <div className="flex flex-col items-center justify-center gap-2 text-center mt-[-1rem]">
              <span className="arcade-text text-3xl text-white drop-shadow-md">VS</span>
              <span className="arcade-text text-[10px] text-[var(--color-dim)]">{match.moves} ХОДОВ</span>
            </div>

            {/* Opponent */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-[var(--bg-primary)] border-2 border-white flex items-center justify-center">
                <div className="text-[var(--accent-red)] arcade-text text-sm text-center leading-tight p-1">
                  {match.opponent.includes('AI') ? 'CPU' : 'PVP'}
                </div>
              </div>
              <span className="arcade-text text-sm text-[var(--accent-red)] truncate max-w-[120px]">{match.opponent}</span>
            </div>
          </div>

          <div className="bg-[var(--bg-primary)] p-4 border-2 border-white">
            <h3 className="arcade-text text-[10px] text-[var(--accent-yellow)] mb-3 flex items-center gap-2">
              <PixelLightningBolt size={16} /> ОБЩИЙ ВЕРДИКТ ИИ:
            </h3>
            <p className="font-sans text-sm text-white leading-relaxed">
              {isWin 
                ? "Ты играл неплохо, контролировал центр и не давал сопернику пространства. Хорошая реализация преимущества." 
                : "Было много неточностей в начале партии. Соперник перехватил инициативу и довел дело до победы."}
            </p>
          </div>
        </div>

        {/* 3 & 4. Пошаговый разбор ИИ-Тренера с Пейволлом */}
        <div className="relative flex-1 overflow-hidden flex flex-col bg-[var(--bg-card)]">
          <div className="p-5 border-b border-white/10 flex-shrink-0">
            <h3 className="arcade-text text-lg text-white tracking-widest">MOVE-BY-MOVE REVIEW</h3>
          </div>
          
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${!isProMax ? 'blur-md opacity-40 pointer-events-none' : ''}`}>
            {moves.map((m, idx) => (
              <div key={idx} className="flex gap-4 p-3 bg-[var(--bg-primary)] border-2 border-white/5">
                <div className="w-8 flex-shrink-0 pt-1 text-right">
                  <span className="arcade-text text-[10px] text-[var(--color-dim)]">{idx + 1}.</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`arcade-text text-xs ${m.player === 'ВЫ' ? 'text-white' : 'text-[var(--accent-red)]'}`}>
                      {m.player}
                    </span>
                    <span className="arcade-text text-xs text-[var(--accent-yellow)]">{m.move}</span>
                  </div>
                  <div className="font-sans text-xs text-[var(--color-dim)] leading-relaxed border-l-2 border-[var(--color-dim)] pl-3">
                    {m.comment}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ПЕЙВОЛЛ "PRO MAX" */}
          {!isProMax && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-transparent">
              <div className="bg-[var(--bg-card)] border-2 border-white p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
                
                <div className="flex justify-center mb-6">
                  <svg width="48" height="48" viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
                    <rect x="5" y="2" width="6" height="5" fill="#f7c948"/>
                    <rect x="6" y="3" width="4" height="4" fill="#3b3966"/>
                    <rect x="4" y="6" width="8" height="8" fill="#f7c948"/>
                    <rect x="7" y="9" width="2" height="3" fill="#3b3966"/>
                    <rect x="4" y="14" width="8" height="1" fill="#c49b25"/>
                    <rect x="12" y="6" width="1" height="8" fill="#c49b25"/>
                  </svg>
                </div>
                
                <h3 className="arcade-text text-sm text-white mb-6 leading-relaxed tracking-widest px-4">
                  ДЕТАЛЬНЫЙ АНАЛИЗ ХОДОВ ДОСТУПЕН ТОЛЬКО В PRO MAX.
                </h3>
                <p className="font-sans text-sm text-[var(--color-dim)] mb-8">
                  Получи разбор каждой ошибки от ИИ-Тренера и подними свой скилл! 
                </p>
                <button 
                  className="w-full pixel-button !bg-[#d9b042] !text-black !border-black py-4 arcade-text text-xs hover:-translate-y-1 transition-all"
                  onClick={() => window.alert('Открывается модалка оплаты...')}
                >
                  UPGRADE TO PRO MAX ($9.99/MEC)
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
