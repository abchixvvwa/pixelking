import useGameStore from '../store/gameStore';
import { useNavigate } from 'react-router-dom';

// Pixel art SVG avatars (16x16 grid, each cell = 1 unit)
const NoviceAvatar = () => (
  <svg width="48" height="48" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
    {/* Body - green slime bot */}
    <rect x="4" y="2" width="8" height="7" fill="#4cc9f0"/>
    <rect x="3" y="3" width="10" height="5" fill="#4cc9f0"/>
    {/* Eyes */}
    <rect x="5" y="4" width="2" height="2" fill="#fff"/>
    <rect x="9" y="4" width="2" height="2" fill="#fff"/>
    <rect x="6" y="4" width="1" height="1" fill="#1a1c2c"/>
    <rect x="10" y="4" width="1" height="1" fill="#1a1c2c"/>
    {/* Smile */}
    <rect x="5" y="7" width="1" height="1" fill="#1a1c2c"/>
    <rect x="6" y="8" width="4" height="1" fill="#1a1c2c"/>
    <rect x="10" y="7" width="1" height="1" fill="#1a1c2c"/>
    {/* Legs */}
    <rect x="4" y="9" width="3" height="4" fill="#4cc9f0"/>
    <rect x="9" y="9" width="3" height="4" fill="#4cc9f0"/>
    <rect x="3" y="11" width="4" height="2" fill="#4cc9f0"/>
    <rect x="9" y="11" width="4" height="2" fill="#4cc9f0"/>
    {/* Antenna */}
    <rect x="7" y="0" width="2" height="2" fill="#4cc9f0"/>
    <rect x="7" y="1" width="2" height="1" fill="#fff"/>
  </svg>
);

const TacticianAvatar = () => (
  <svg width="48" height="48" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
    {/* Body - yellow warrior */}
    <rect x="4" y="1" width="8" height="7" fill="#f7c948"/>
    <rect x="3" y="2" width="10" height="5" fill="#f7c948"/>
    {/* Helmet */}
    <rect x="3" y="1" width="10" height="2" fill="#e0a800"/>
    <rect x="2" y="2" width="12" height="1" fill="#e0a800"/>
    {/* Eyes - determined look */}
    <rect x="4" y="4" width="3" height="1" fill="#1a1c2c"/>
    <rect x="9" y="4" width="3" height="1" fill="#1a1c2c"/>
    <rect x="5" y="5" width="2" height="1" fill="#1a1c2c"/>
    <rect x="9" y="5" width="2" height="1" fill="#1a1c2c"/>
    {/* Mouth - stern */}
    <rect x="5" y="7" width="6" height="1" fill="#1a1c2c"/>
    {/* Body armor */}
    <rect x="4" y="8" width="8" height="5" fill="#e0a800"/>
    <rect x="3" y="9" width="10" height="3" fill="#e0a800"/>
    <rect x="5" y="9" width="6" height="2" fill="#f7c948"/>
    {/* Legs */}
    <rect x="4" y="13" width="3" height="3" fill="#e0a800"/>
    <rect x="9" y="13" width="3" height="3" fill="#e0a800"/>
  </svg>
);

const MasterAvatar = () => (
  <svg width="48" height="48" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
    {/* Body - red demon */}
    <rect x="4" y="2" width="8" height="7" fill="#e63946"/>
    <rect x="3" y="3" width="10" height="5" fill="#e63946"/>
    {/* Horns */}
    <rect x="3" y="0" width="2" height="3" fill="#c0392b"/>
    <rect x="11" y="0" width="2" height="3" fill="#c0392b"/>
    <rect x="2" y="1" width="2" height="2" fill="#c0392b"/>
    <rect x="12" y="1" width="2" height="2" fill="#c0392b"/>
    {/* Eyes - glowing */}
    <rect x="4" y="4" width="3" height="2" fill="#fff"/>
    <rect x="9" y="4" width="3" height="2" fill="#fff"/>
    <rect x="5" y="4" width="2" height="2" fill="#f7c948"/>
    <rect x="9" y="4" width="2" height="2" fill="#f7c948"/>
    <rect x="6" y="4" width="1" height="1" fill="#1a1c2c"/>
    <rect x="10" y="4" width="1" height="1" fill="#1a1c2c"/>
    {/* Evil grin */}
    <rect x="4" y="7" width="1" height="1" fill="#1a1c2c"/>
    <rect x="5" y="8" width="1" height="1" fill="#1a1c2c"/>
    <rect x="6" y="7" width="1" height="1" fill="#1a1c2c"/>
    <rect x="7" y="8" width="2" height="1" fill="#1a1c2c"/>
    <rect x="9" y="7" width="1" height="1" fill="#1a1c2c"/>
    <rect x="10" y="8" width="1" height="1" fill="#1a1c2c"/>
    <rect x="11" y="7" width="1" height="1" fill="#1a1c2c"/>
    {/* Cape / body */}
    <rect x="3" y="9" width="10" height="5" fill="#c0392b"/>
    <rect x="2" y="10" width="12" height="3" fill="#c0392b"/>
    {/* Legs */}
    <rect x="4" y="14" width="3" height="2" fill="#c0392b"/>
    <rect x="9" y="14" width="3" height="2" fill="#c0392b"/>
  </svg>
);

const difficulties = [
  {
    id: 'novice',
    Avatar: NoviceAvatar,
    title: 'GLITCHBOT-1',
    desc: 'LVL 01 · ROOKIE CPU',
    sub: 'Insert coin to practice',
    color: 'var(--accent-green)',
  },
  {
    id: 'tactician',
    Avatar: TacticianAvatar,
    title: 'VANGUARD-X',
    desc: 'LVL 02 · BATTLE CPU',
    sub: 'Calculating moves...',
    color: 'var(--accent-yellow)',
  },
  {
    id: 'master',
    Avatar: MasterAvatar,
    title: 'DREADLORD-Z',
    desc: 'LVL 03 · FINAL BOSS',
    sub: '>>> DANGER ZONE <<<',
    color: 'var(--accent-red)',
  },
];

export default function DifficultySelect() {
  const startAIGame = useGameStore((s) => s.startAIGame);
  const navigate = useNavigate();

  const handleSelect = (id) => {
    startAIGame(id);
    navigate('/play/vs-ai-game');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--bg-primary)]">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 arcade-text text-[10px] md:text-xs text-[var(--color-dim)] hover:text-[var(--accent-yellow)] transition-colors cursor-pointer"
      >
        &lt; BACK
      </button>

      {/* Title */}
      <div className="mb-10 text-center animate-fade-in">
        <h2 className="text-xl md:text-3xl arcade-text text-[var(--color-light)] mb-2" style={{ textShadow: '4px 4px 0 #000' }}>
          SELECT OPPONENT
        </h2>
        <p className="arcade-text text-[8px] text-[var(--color-dim)]">CHOOSE YOUR ENEMY</p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-in">
        {difficulties.map((diff) => (
          <button
            key={diff.id}
            onClick={() => handleSelect(diff.id)}
            className="group relative flex items-center justify-between px-5 py-4 bg-[var(--bg-card)] pixel-border pixel-shadow-interactive pixel-shadow-active cursor-pointer transition-all"
          >
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 border-[3px]" style={{ borderColor: diff.color, animation: 'blink 0.5s step-end infinite' }} />
            
            <div className="flex items-center gap-4 relative z-10">
              {/* Pixel avatar */}
              <div className="flex-shrink-0 p-1 border-2" style={{ borderColor: diff.color }}>
                <diff.Avatar />
              </div>
              <div className="text-left">
                <div className="arcade-text text-[10px] md:text-xs text-[var(--color-light)] mb-1" style={{ textShadow: '2px 2px 0 #000' }}>
                  {diff.title}
                </div>
                <div className="arcade-text text-[8px] mb-1" style={{ color: diff.color }}>
                  {diff.desc}
                </div>
                <div className="font-mono text-[7px] text-[var(--color-dim)]">
                  {diff.sub}
                </div>
              </div>
            </div>
            
            <div className="relative z-10 text-[var(--color-dim)] group-hover:text-[var(--color-light)] arcade-text text-xs">
              &gt;
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
