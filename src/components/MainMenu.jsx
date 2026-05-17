import { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { PixelKingLogo } from './icons/PixelIcons';

function getCountdown() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  const diff = tomorrow - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}ч ${m}м`;
}

function hasDailyResult() {
  try {
    const raw = localStorage.getItem('duels_daily_result');
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data.date === new Date().toISOString().slice(0, 10);
  } catch { return false; }
}

const IconPVP = () => (
  <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor" shapeRendering="crispEdges">
    <rect x="2" y="4" width="4" height="4" />
    <rect x="1" y="8" width="6" height="6" />
    <rect x="10" y="4" width="4" height="4" fill="var(--accent-red)" />
    <rect x="9" y="8" width="6" height="6" fill="var(--accent-red)" />
  </svg>
);

const IconRobot = () => (
  <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor" shapeRendering="crispEdges">
    <rect x="7" y="1" width="2" height="2" />
    <rect x="5" y="3" width="6" height="8" />
    <rect x="3" y="6" width="2" height="4" />
    <rect x="11" y="6" width="2" height="4" />
    <rect x="6" y="5" width="1" height="1" fill="var(--bg-primary)" />
    <rect x="9" y="5" width="1" height="1" fill="var(--bg-primary)" />
    <rect x="6" y="8" width="4" height="1" fill="var(--bg-primary)" />
  </svg>
);

const IconTrophy = () => (
  <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor" shapeRendering="crispEdges">
    <rect x="4" y="2" width="8" height="6" fill="var(--accent-yellow)" />
    <rect x="2" y="3" width="2" height="3" fill="var(--accent-yellow)" />
    <rect x="12" y="3" width="2" height="3" fill="var(--accent-yellow)" />
    <rect x="6" y="8" width="4" height="2" fill="var(--accent-yellow)" />
    <rect x="4" y="10" width="8" height="2" fill="var(--accent-yellow)" />
  </svg>
);

const IconTable = () => (
  <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor" shapeRendering="crispEdges">
    <rect x="2" y="2" width="12" height="2" />
    <rect x="2" y="6" width="12" height="2" />
    <rect x="2" y="10" width="12" height="2" />
    <rect x="4" y="4" width="8" height="2" fill="var(--accent-yellow)" />
  </svg>
);

const IconPalette = () => (
  <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor" shapeRendering="crispEdges">
    <rect x="2" y="2" width="10" height="12" />
    <rect x="12" y="4" width="2" height="8" />
    <rect x="4" y="4" width="2" height="2" fill="var(--accent-red)" />
    <rect x="8" y="4" width="2" height="2" fill="var(--accent-green)" />
    <rect x="4" y="8" width="2" height="2" fill="var(--accent-yellow)" />
    <rect x="8" y="8" width="2" height="2" fill="var(--bg-primary)" />
  </svg>
);

export default function MainMenu() {
  const startLocalGame = useGameStore((s) => s.startLocalGame);
  const goToDifficulty = useGameStore((s) => s.goToDifficulty);
  const goToDaily = useGameStore((s) => s.goToDaily);
  const [countdown, setCountdown] = useState(getCountdown());
  const [played, setPlayed] = useState(hasDailyResult());

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(getCountdown());
      setPlayed(hasDailyResult());
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  const modes = [
    {
      id: 'local',
      icon: <IconPVP />,
      title: 'VS PLAYER',
      desc: 'Local Multiplayer',
      available: true,
      onClick: startLocalGame,
    },
    {
      id: 'ai',
      icon: <IconRobot />,
      title: 'VS AI',
      desc: 'Play against Computer',
      available: true,
      onClick: goToDifficulty,
    },
    {
      id: 'daily',
      icon: <IconTrophy />,
      title: 'DAILY QUEST',
      desc: played ? `DONE · NEXT: ${countdown}` : 'Daily Tactical Puzzle',
      available: true,
      onClick: goToDaily,
    },
    {
      id: 'leaderboard',
      icon: <IconTable />,
      title: 'HIGH SCORES',
      desc: 'Global Rankings',
      available: true,
      onClick: useGameStore((s) => s.goToLeaderboard),
    },
    {
      id: 'shop',
      icon: <IconPalette />,
      title: 'SELECT SKIN',
      desc: 'Customize your board',
      available: true,
      onClick: useGameStore((s) => s.goToShop),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--bg-primary)] overflow-hidden relative">
      
      {/* Header */}
      <div className="mb-10 text-center animate-fade-in mt-10">
        <div className="mb-2 relative flex justify-center" style={{ filter: 'drop-shadow(4px 4px 0px #000)' }}>
          <PixelKingLogo size={100} />
        </div>
        <p className="arcade-text text-[var(--accent-yellow)] text-sm animate-blink">
          PRESS START
        </p>
      </div>

      {/* Mode cards */}
      <div className="flex flex-col gap-4 w-full max-w-md animate-fade-in z-10 mb-16">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={mode.available ? mode.onClick : undefined}
            disabled={!mode.available}
            className={`
              pixel-button relative w-full text-left px-4 py-4 flex items-center gap-4
              ${!mode.available ? 'opacity-50 grayscale' : ''}
            `}
          >
            <div className="text-[var(--color-light)]">
              {mode.icon}
            </div>
            <div>
              <div className="arcade-text text-[10px] md:text-xs text-[var(--color-light)] mb-2" style={{ textShadow: '2px 2px 0 #000' }}>{mode.title}</div>
              <div className="font-mono text-[10px] md:text-xs text-[var(--color-dim)]">{mode.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Marquee Footer */}
      <div className="absolute bottom-0 left-0 w-full bg-[var(--bg-card)] border-t-[3px] border-[var(--color-light)] overflow-hidden h-10 flex items-center">
        <div className="animate-marquee arcade-text text-[10px] text-[var(--accent-yellow)]">
          ★ PIXELKING v1.0 ★ РУССКИЕ ШАШКИ ★ PLAY NOW ★ HIGH SCORE ★ NO COINS NEEDED ★
        </div>
      </div>
    </div>
  );
}
