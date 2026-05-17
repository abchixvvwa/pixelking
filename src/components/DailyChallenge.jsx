import { useEffect, useState } from 'react';
import useDailyStore from '../store/dailyStore';
import DailyBoard from './DailyBoard';
import SolutionReplay from './SolutionReplay';
import { PixelStar } from './icons/PixelIcons';

// ──── Timer display ────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ──── Stars display ────
function Stars({ count }) {
  return (
    <div className="flex gap-2 justify-center mb-6">
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className={`text-4xl animate-fade-in filter drop-shadow-[4px_4px_0_rgba(0,0,0,1)]`}
          style={{ 
            animationDelay: `${i * 200}ms`,
            opacity: i <= count ? 1 : 0.2,
            filter: i <= count ? 'grayscale(0%) drop-shadow(4px 4px 0 rgba(0,0,0,1))' : 'grayscale(100%)',
          }}
        >
          <PixelStar size={36} color="#f7c948" />
        </span>
      ))}
    </div>
  );
}

// ──── Result Screen ────
function DailyResult({ result, challenge, onBack }) {
  const [copied, setCopied] = useState(false);
  const [showReplay, setShowReplay] = useState(false);

  const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const today = new Date();
  const dateStr = `${today.getDate()} ${monthNames[today.getMonth()]}`;

  const handleShare = () => {
    const starStr = '★'.repeat(result.stars);
    const text = `PIXELKING Daily Quest ${dateStr} ${starStr} — solved in ${result.moves} moves and ${result.time} sec!`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col items-center animate-fade-in bg-[var(--bg-card)] p-6 pixel-border pixel-shadow w-full max-w-sm mt-8">
      {/* Stars */}
      <Stars count={result.stars} />

      <h2 className="arcade-text text-xl mb-4 text-center" style={{ color: result.won ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>
        {result.won ? 'QUEST CLEARED!' : 'GAME OVER'}
      </h2>
      
      {/* Stats */}
      <div className="flex flex-col gap-4 font-mono text-sm w-full mb-6">
        <div className="flex justify-between">
          <span className="text-[var(--color-dim)]">MOVES</span>
          <span className="text-[var(--color-light)]">{result.moves.toString().padStart(3, '0')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-dim)]">TIME</span>
          <span className="text-[var(--color-light)]">{formatTime(result.time)}</span>
        </div>
      </div>

      {/* Solution Replay Button */}
      <button
        onClick={() => setShowReplay(true)}
        className="mb-4 text-xs font-mono text-[var(--color-dim)] hover:text-[var(--accent-yellow)] cursor-pointer"
      >
        ▶ SHOW SOLUTION
      </button>

      {/* Solution Replay Modal */}
      {showReplay && (
        <SolutionReplay challenge={challenge} onClose={() => setShowReplay(false)} />
      )}

      {/* Actions */}
      <div className="flex flex-col gap-4 w-full">
        <button
          onClick={handleShare}
          className="pixel-button py-4 text-[10px]"
          style={{ borderColor: copied ? 'var(--accent-green)' : 'var(--accent-yellow)' }}
        >
          {copied ? 'COPIED!' : 'SHARE SCORE'}
        </button>
        <button
          onClick={onBack}
          className="py-4 text-[10px] arcade-text text-[var(--color-dim)] hover:text-[var(--color-light)] border-2 border-[var(--color-dim)] bg-transparent pixel-shadow"
        >
          MAIN MENU
        </button>
      </div>
    </div>
  );
}

// ──── Main Daily Challenge Screen ────
export default function DailyChallenge({ onBack }) {
  const challenge = useDailyStore(s => s.challenge);
  const board = useDailyStore(s => s.board);
  const completed = useDailyStore(s => s.completed);
  const result = useDailyStore(s => s.result);
  const elapsedSeconds = useDailyStore(s => s.elapsedSeconds);
  const moveCount = useDailyStore(s => s.moveCount);
  const currentPlayer = useDailyStore(s => s.currentPlayer);
  const aiThinking = useDailyStore(s => s.aiThinking);
  const winner = useDailyStore(s => s.winner);
  const initDaily = useDailyStore(s => s.initDaily);
  const tickTimer = useDailyStore(s => s.tickTimer);

  // Init on mount
  useEffect(() => {
    initDaily();
  }, []);

  // Timer tick
  useEffect(() => {
    if (completed) return;
    const iv = setInterval(tickTimer, 1000);
    return () => clearInterval(iv);
  }, [completed]);

  if (!challenge || !board) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="mb-6 text-center relative w-full max-w-[calc(min(95vw,600px))] mt-4">
        <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 arcade-text text-[10px] md:text-xs text-[var(--color-dim)] hover:text-[var(--accent-yellow)] transition-colors cursor-pointer"
        >
          &lt; BACK
        </button>

        <h1 className="text-xl md:text-3xl arcade-text text-[var(--color-light)] mb-2" style={{ textShadow: '4px 4px 0 #000' }}>
          DAILY QUEST
        </h1>
      </header>

      {/* Challenge info */}
      {!completed && (
        <div className="mb-6 text-center animate-fade-in w-full max-w-[calc(min(95vw,600px))] bg-[var(--bg-card)] p-4 pixel-border pixel-shadow">
          <h2 className="arcade-text text-sm text-[var(--accent-yellow)] mb-2">{challenge.title.toUpperCase()}</h2>
          <p className="font-mono text-[10px] text-[var(--color-light)] leading-relaxed">{challenge.description}</p>
        </div>
      )}

      {/* Timer + Move counter */}
      {!completed && (
        <div className="flex justify-between w-full max-w-[calc(min(95vw,600px))] mb-6">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[var(--color-dim)] mb-1">TIME</span>
            <span className="arcade-text text-[10px] text-[var(--color-light)] tabular-nums">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] text-[var(--color-dim)] mb-1">MOVES</span>
            <span className="arcade-text text-[10px] text-[var(--color-light)]">{moveCount.toString().padStart(3, '0')}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] text-[var(--color-dim)] mb-1">PAR</span>
            <span className="arcade-text text-[10px] text-[var(--accent-green)]">{challenge.parMoves.toString().padStart(3, '0')}</span>
          </div>
        </div>
      )}

      {/* Board or Result */}
      {completed && result ? (
        <DailyResult result={result} challenge={challenge} onBack={onBack} />
      ) : (
        <div className="mt-2 relative">
          <DailyBoard />
          {aiThinking && (
             <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                <span className="arcade-text text-[var(--accent-yellow)] animate-blink">AI THINKING...</span>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
