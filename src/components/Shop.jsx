import { useState } from 'react';
import useGameStore from '../store/gameStore';
import { SKINS, getActiveSkin, setActiveSkin } from '../data/skins';
import Piece from './Piece';
import { WHITE, BLACK } from '../logic/checkers';
import { PixelLock } from './icons/PixelIcons';
import PaywallModal from './PaywallModal';

function MiniBoardPreview({ skin }) {
  const cells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const isDark = (r + c) % 2 === 1;
      cells.push({ r, c, isDark });
    }
  }

  return (
    <div className="w-full aspect-square pixel-border shadow-inner grid grid-cols-4 bg-[var(--bg-primary)]">
      {cells.map(({ r, c, isDark }) => (
        <div
          key={`${r}-${c}`}
          className="relative flex items-center justify-center border-[0.5px] border-[var(--bg-primary)]"
          style={{ backgroundColor: isDark ? skin.darkCell : skin.lightCell }}
        >
          {isDark && r < 1 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-1">
              <Piece type={BLACK} skinOverride={skin} />
            </div>
          )}
          {isDark && r > 2 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-1">
              <Piece type={WHITE} skinOverride={skin} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Shop({ onBack }) {
  const [active, setActive] = useState(getActiveSkin().id);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const handleSelect = (skin) => {
    if (!skin.free) {
      setPaywallOpen(true);
      return;
    }
    setActiveSkin(skin.id);
    setActive(skin.id);
    useGameStore.getState().setActiveSkinState(skin.id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 overflow-y-auto bg-[var(--bg-primary)]">
      <header className="mb-8 text-center relative w-full max-w-2xl mt-4">
        <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 arcade-text text-[10px] md:text-xs text-[var(--color-dim)] hover:text-[var(--accent-yellow)] transition-colors cursor-pointer"
        >
          &lt; BACK
        </button>

        <h1 className="text-xl md:text-3xl arcade-text text-[var(--color-light)] mb-2" style={{ textShadow: '3px 3px 0 #000' }}>
          SELECT SKIN
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-12 animate-fade-in">
        {SKINS.map((skin) => {
          const isActive = skin.id === active;
          const isLocked = !skin.free;

          return (
            <div
              key={skin.id}
              onClick={() => handleSelect(skin)}
              className={`
                relative flex flex-col p-3 bg-[var(--bg-card)] cursor-pointer
                ${isLocked ? 'opacity-70' : ''}
                ${isActive && !isLocked ? 'pixel-border-yellow pixel-shadow-active translate-y-[2px] translate-x-[2px]' : 'pixel-border pixel-shadow hover:translate-y-[-2px] hover:translate-x-[-2px]'}
              `}
              style={{ transition: 'transform 0.1s, box-shadow 0.1s' }}
            >
              {isActive && !isLocked && (
                <div className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center text-sm z-10 bg-[var(--accent-yellow)] text-black pixel-border">
                  ✓
                </div>
              )}

              {isLocked && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 pointer-events-none">
                  <PixelLock size={32} color="var(--accent-yellow)" />
                </div>
              )}

              <div className="mb-4">
                <MiniBoardPreview skin={skin} />
              </div>

              <div className="text-center mt-auto flex flex-col h-full justify-between">
                <h3 className="text-[10px] md:text-xs arcade-text text-[var(--color-light)] mb-3">
                  {skin.name}
                </h3>
                <button
                  type="button"
                  className={`w-full py-2 arcade-text text-[8px] md:text-[10px] flex items-center justify-center gap-1
                    ${isActive && !isLocked
                      ? 'bg-transparent text-[var(--accent-yellow)]'
                      : skin.free
                        ? 'bg-[var(--accent-green)] text-black border-2 border-black'
                        : 'bg-black text-[var(--color-light)] border-2 border-[var(--color-dim)]'}
                  `}
                >
                  {isActive && !isLocked ? (
                    'SELECTED'
                  ) : skin.free ? (
                    'EQUIP'
                  ) : (
                    <>
                      <PixelLock size={10} color="var(--accent-yellow)" />
                      PRO
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="w-full max-w-2xl p-6 relative overflow-hidden animate-fade-in text-center cursor-pointer pixel-button"
        onClick={() => setPaywallOpen(true)}
      >
        <h3 className="text-sm md:text-lg arcade-text text-[var(--accent-yellow)] mb-4 animate-blink">
          РАЗБЛОКИРУЙ PIXELKING PRO
        </h3>
        <p className="arcade-text text-[9px] text-[var(--color-light)] mb-2">ВСЕ ЭКСКЛЮЗИВНЫЕ СКИНЫ</p>
        <p className="arcade-text text-[9px] text-[var(--color-light)] mb-6">+ AI COACH БЕЗ ЛИМИТОВ</p>
        <div className="arcade-text text-xs text-[var(--accent-green)]">$4.99 / МЕСЯЦ</div>
      </div>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
}
