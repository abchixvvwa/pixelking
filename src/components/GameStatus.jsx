import { WHITE, BLACK, WHITE_KING, BLACK_KING } from '../logic/checkers';
import { getSkin } from '../data/skins';
import useGameStore from '../store/gameStore';
import { useNavigate } from 'react-router-dom';

// Bot configs by difficulty
const BOT_CONFIG = {
  novice: {
    name: 'GLITCHBOT-1',
    color: 'var(--accent-green)',
    Avatar: () => (
      <svg width="24" height="24" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="8" height="7" fill="#4cc9f0"/>
        <rect x="3" y="3" width="10" height="5" fill="#4cc9f0"/>
        <rect x="5" y="4" width="2" height="2" fill="#fff"/>
        <rect x="9" y="4" width="2" height="2" fill="#fff"/>
        <rect x="6" y="4" width="1" height="1" fill="#1a1c2c"/>
        <rect x="10" y="4" width="1" height="1" fill="#1a1c2c"/>
        <rect x="5" y="7" width="1" height="1" fill="#1a1c2c"/>
        <rect x="6" y="8" width="4" height="1" fill="#1a1c2c"/>
        <rect x="10" y="7" width="1" height="1" fill="#1a1c2c"/>
        <rect x="4" y="9" width="3" height="4" fill="#4cc9f0"/>
        <rect x="9" y="9" width="3" height="4" fill="#4cc9f0"/>
        <rect x="7" y="0" width="2" height="2" fill="#4cc9f0"/>
        <rect x="7" y="1" width="2" height="1" fill="#fff"/>
      </svg>
    ),
  },
  tactician: {
    name: 'VANGUARD-X',
    color: 'var(--accent-yellow)',
    Avatar: () => (
      <svg width="24" height="24" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="1" width="8" height="7" fill="#f7c948"/>
        <rect x="3" y="2" width="10" height="5" fill="#f7c948"/>
        <rect x="3" y="1" width="10" height="2" fill="#e0a800"/>
        <rect x="2" y="2" width="12" height="1" fill="#e0a800"/>
        <rect x="4" y="4" width="3" height="1" fill="#1a1c2c"/>
        <rect x="9" y="4" width="3" height="1" fill="#1a1c2c"/>
        <rect x="5" y="5" width="2" height="1" fill="#1a1c2c"/>
        <rect x="9" y="5" width="2" height="1" fill="#1a1c2c"/>
        <rect x="5" y="7" width="6" height="1" fill="#1a1c2c"/>
        <rect x="4" y="8" width="8" height="5" fill="#e0a800"/>
        <rect x="5" y="9" width="6" height="2" fill="#f7c948"/>
        <rect x="4" y="13" width="3" height="3" fill="#e0a800"/>
        <rect x="9" y="13" width="3" height="3" fill="#e0a800"/>
      </svg>
    ),
  },
  master: {
    name: 'DREADLORD-Z',
    color: 'var(--accent-red)',
    Avatar: () => (
      <svg width="24" height="24" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="8" height="7" fill="#e63946"/>
        <rect x="3" y="3" width="10" height="5" fill="#e63946"/>
        <rect x="3" y="0" width="2" height="3" fill="#c0392b"/>
        <rect x="11" y="0" width="2" height="3" fill="#c0392b"/>
        <rect x="2" y="1" width="2" height="2" fill="#c0392b"/>
        <rect x="12" y="1" width="2" height="2" fill="#c0392b"/>
        <rect x="4" y="4" width="3" height="2" fill="#fff"/>
        <rect x="9" y="4" width="3" height="2" fill="#fff"/>
        <rect x="5" y="4" width="2" height="2" fill="#f7c948"/>
        <rect x="9" y="4" width="2" height="2" fill="#f7c948"/>
        <rect x="6" y="4" width="1" height="1" fill="#1a1c2c"/>
        <rect x="10" y="4" width="1" height="1" fill="#1a1c2c"/>
        <rect x="4" y="7" width="1" height="1" fill="#1a1c2c"/>
        <rect x="5" y="8" width="1" height="1" fill="#1a1c2c"/>
        <rect x="6" y="7" width="1" height="1" fill="#1a1c2c"/>
        <rect x="7" y="8" width="2" height="1" fill="#1a1c2c"/>
        <rect x="9" y="7" width="1" height="1" fill="#1a1c2c"/>
        <rect x="10" y="8" width="1" height="1" fill="#1a1c2c"/>
        <rect x="11" y="7" width="1" height="1" fill="#1a1c2c"/>
        <rect x="3" y="9" width="10" height="5" fill="#c0392b"/>
        <rect x="4" y="14" width="3" height="2" fill="#c0392b"/>
        <rect x="9" y="14" width="3" height="2" fill="#c0392b"/>
      </svg>
    ),
  },
};

// Mini pixel piece for graveyard
function MiniPiece({ type, index, skinId }) {
  const skin = getSkin(skinId);
  const isWhitePiece = type === WHITE || type === WHITE_KING;
  const isKing = type === WHITE_KING || type === BLACK_KING;
  const color = isWhitePiece ? skin.whitePiece : skin.blackPiece;
  const crown = skin.accent || '#f7c948';

  return (
    <div
      className="animate-graveyard-pop"
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
    >
      <svg
        width="14" height="14"
        viewBox="0 0 16 16"
        style={{ imageRendering: 'pixelated', display: 'block' }}
        shapeRendering="crispEdges"
      >
        <rect x="4" y="0" width="8" height="2" fill={color}/>
        <rect x="2" y="2" width="12" height="2" fill={color}/>
        <rect x="0" y="4" width="16" height="8" fill={color}/>
        <rect x="2" y="12" width="12" height="2" fill={color}/>
        <rect x="4" y="14" width="8" height="2" fill={color}/>
        <rect x="4" y="2" width="4" height="2" fill="#ffffff" opacity="0.35"/>
        <rect x="2" y="4" width="2" height="2" fill="#ffffff" opacity="0.35"/>
        {isKing && (
          <>
            <rect x="5" y="5" width="2" height="3" fill={crown}/>
            <rect x="7" y="4" width="2" height="4" fill={crown}/>
            <rect x="9" y="5" width="2" height="3" fill={crown}/>
            <rect x="4" y="8" width="8" height="2" fill={crown}/>
          </>
        )}
      </svg>
    </div>
  );
}

// Graveyard row — mini captured pieces
function Graveyard({ pieces, skinId }) {
  if (!pieces || pieces.length === 0) return <div style={{ height: '18px' }} />;
  return (
    <div className="flex flex-wrap gap-[2px] mt-1" style={{ minHeight: '18px' }}>
      {pieces.map((type, i) => (
        <MiniPiece key={i} type={type} index={i} skinId={skinId} />
      ))}
    </div>
  );
}

export default function GameStatus() {
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const winner = useGameStore((s) => s.winner);
  const resetGame = useGameStore((s) => s.resetGame);
  const navigate = useNavigate();
  const capturedWhite = useGameStore((s) => s.capturedWhite);
  const capturedBlack = useGameStore((s) => s.capturedBlack);
  const capturedWhitePieces = useGameStore((s) => s.capturedWhitePieces || []);
  const capturedBlackPieces = useGameStore((s) => s.capturedBlackPieces || []);
  const moveHistory = useGameStore((s) => s.moveHistory);
  const gameMode = useGameStore((s) => s.gameMode);
  const aiDifficulty = useGameStore((s) => s.aiDifficulty);
  const activeSkinState = useGameStore((s) => s.activeSkinState);

  const bot = aiDifficulty ? BOT_CONFIG[aiDifficulty] : null;
  const onlineRole = useGameStore((s) => s.onlineRole);
  const whiteLabel = gameMode === 'online'
    ? (onlineRole === 'white' ? 'ВЫ (БЕЛЫЕ)' : 'СОПЕРНИК')
    : 'PLAYER 1';
  const blackLabel = gameMode === 'ai'
    ? (bot?.name ?? 'CPU')
    : gameMode === 'online'
      ? (onlineRole === 'black' ? 'ВЫ (ЧЁРНЫЕ)' : 'СОПЕРНИК')
      : 'PLAYER 2';
  const playerName = (p) => (p === 'white' ? whiteLabel : blackLabel);

  return (
    <div className="w-full max-w-[calc(min(95vw,600px))] mx-auto mt-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/play')}
          className="arcade-text text-[10px] text-[var(--color-dim)] hover:text-[var(--accent-yellow)] cursor-pointer"
        >
          &lt; QUIT
        </button>
        {gameMode !== 'online' && (
          <button
            onClick={resetGame}
            className="arcade-text text-[10px] text-[var(--color-dim)] hover:text-[var(--accent-yellow)] cursor-pointer"
          >
            RESTART
          </button>
        )}
        {gameMode === 'online' && <span className="arcade-text text-[8px] text-[var(--color-dim)]">ONLINE</span>}
      </div>

      {/* Player indicators */}
      <div className="flex items-stretch justify-between gap-3">

        {/* ── White player ── */}
        <div
          className={`
            player-card flex flex-col px-3 py-2 bg-[var(--bg-card)] pixel-border flex-1
            ${currentPlayer === 'white' && !winner ? 'border-[var(--accent-yellow)]' : ''}
          `}
          style={{
            transform: currentPlayer === 'white' && !winner
              ? 'scale(1.05) rotate(1.5deg)'
              : 'scale(1) rotate(0deg)',
            zIndex: currentPlayer === 'white' ? 2 : 1,
            boxShadow: currentPlayer === 'white' && !winner ? '4px 4px 0 #000' : 'none',
          }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-6 h-6 bg-[var(--color-light)] border-[3px] border-[var(--bg-primary)] flex-shrink-0" />
            <div>
              <div className="arcade-text text-[10px] text-[var(--color-light)]">{whiteLabel}</div>
              <div className="font-mono text-[9px] text-[var(--color-dim)]">PTS: {capturedBlack * 100}</div>
            </div>
          </div>
          {/* Graveyard — black pieces captured by white */}
          <Graveyard pieces={capturedBlackPieces} skinId={activeSkinState} />
        </div>

        {/* ── Turn counter ── */}
        <div className="flex flex-col items-center justify-center px-2">
          <div className="arcade-text text-[9px] text-[var(--color-dim)] mb-1">TURN</div>
          <div className="arcade-text text-lg text-[var(--accent-yellow)]">
            {Math.floor(moveHistory.length / 2) + 1}
          </div>
        </div>

        {/* ── Black player / AI ── */}
        <div
          className={`
            player-card flex flex-col px-3 py-2 bg-[var(--bg-card)] pixel-border flex-1 items-end
            ${currentPlayer === 'black' && !winner ? 'border-[var(--accent-yellow)]' : ''}
          `}
          style={{
            transform: currentPlayer === 'black' && !winner
              ? 'scale(1.05) rotate(-1.5deg)'
              : 'scale(1) rotate(0deg)',
            zIndex: currentPlayer === 'black' ? 2 : 1,
            boxShadow: currentPlayer === 'black' && !winner ? '4px 4px 0 #000' : 'none',
          }}
        >
          <div className="flex items-center gap-3 mb-1 flex-row-reverse">
            {gameMode === 'ai' && bot ? (
              <div className="flex-shrink-0 border-2" style={{ borderColor: bot.color }}>
                <bot.Avatar />
              </div>
            ) : (
              <div className="w-6 h-6 bg-[var(--accent-red)] border-[3px] border-[var(--bg-primary)] flex-shrink-0" />
            )}
            <div className="text-right">
              <div className="arcade-text text-[8px] text-[var(--color-light)]">{blackLabel}</div>
              {gameMode === 'ai' && bot && (
                <div className="arcade-text text-[7px]" style={{ color: bot.color }}>
                  {aiDifficulty.toUpperCase()}
                </div>
              )}
              <div className="font-mono text-[9px] text-[var(--color-dim)]">PTS: {capturedWhite * 100}</div>
            </div>
          </div>
          {/* Graveyard — white pieces captured by black */}
          <div className="flex flex-wrap-reverse gap-[2px] justify-end mt-1" style={{ minHeight: '18px' }}>
            {capturedWhitePieces.map((type, i) => (
              <MiniPiece key={i} type={type} index={i} skinId={activeSkinState} />
            ))}
          </div>
        </div>

      </div>

      {/* Winner overlay */}
      {winner && (
        <div className="text-center mt-6 p-4 border-[3px] border-[var(--accent-yellow)] bg-[var(--bg-primary)] pixel-shadow animate-fade-in absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <h2 className="arcade-text text-xl mb-2 text-[var(--color-light)] animate-blink">
            <span style={{ color: winner === 'white' ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>
              {winner === 'draw' ? 'DRAW!' : `${playerName(winner)} WINS!`}
            </span>
          </h2>
        </div>
      )}
    </div>
  );
}
