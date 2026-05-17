import { WHITE, BLACK, WHITE_KING, BLACK_KING } from '../logic/checkers';
import { getSkin } from '../data/skins';
import useGameStore from '../store/gameStore';

export default function Piece({ type, isSelected, isRemoving, skinOverride }) {
  if (!type || type === 0) return null;

  const isWhite = type === WHITE || type === WHITE_KING;
  const isKing = type === WHITE_KING || type === BLACK_KING;

  const activeSkinState = useGameStore((s) => s.activeSkinState);
  const skin = skinOverride || getSkin(activeSkinState);
  const baseColor = isWhite ? skin.whitePiece : skin.blackPiece;
  const crownColor = skin.accent || '#f7c948'; // Default gold if no accent

  let wrapperClass = `relative w-[80%] h-[80%] flex items-center justify-center transition-transform `;
  
  if (isRemoving) {
    wrapperClass += ' animate-blink ';
  } else if (isSelected) {
    wrapperClass += ' pixel-border-yellow animate-blink bg-transparent ';
  } else {
    wrapperClass += ' hover:-translate-y-1 cursor-pointer ';
  }

  return (
    <div className={wrapperClass}>
      <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" shapeRendering="crispEdges">
        {/* Base Circle */}
        <rect x="4" y="0" width="8" height="2" fill={baseColor} />
        <rect x="2" y="2" width="12" height="2" fill={baseColor} />
        <rect x="0" y="4" width="16" height="8" fill={baseColor} />
        <rect x="2" y="12" width="12" height="2" fill={baseColor} />
        <rect x="4" y="14" width="8" height="2" fill={baseColor} />
        
        {/* Highlight */}
        <rect x="4" y="2" width="4" height="2" fill="#ffffff" opacity="0.4" />
        <rect x="2" y="4" width="2" height="2" fill="#ffffff" opacity="0.4" />

        {/* Shadow */}
        <rect x="10" y="12" width="4" height="2" fill="#000000" opacity="0.3" />
        <rect x="12" y="10" width="2" height="2" fill="#000000" opacity="0.3" />

        {/* King Crown */}
        {isKing && (
          <g transform="translate(0, -1)">
            <rect x="4" y="4" width="2" height="3" fill={crownColor} />
            <rect x="7" y="3" width="2" height="4" fill={crownColor} />
            <rect x="10" y="4" width="2" height="3" fill={crownColor} />
            <rect x="3" y="7" width="10" height="2" fill={crownColor} />
            <rect x="4" y="9" width="8" height="1" fill="#000" opacity="0.3" />
          </g>
        )}
      </svg>
    </div>
  );
}
