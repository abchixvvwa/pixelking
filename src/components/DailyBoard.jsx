import { useMemo, useState, useEffect, useRef } from 'react';
import useDailyStore from '../store/dailyStore';
import Piece from './Piece';
import { BOARD_SIZE, EMPTY, isWhite, isBlack } from '../logic/checkers';
import { getSkin } from '../data/skins';
import useGameStore from '../store/gameStore';

export default function DailyBoard() {
  const board = useDailyStore((s) => s.board);
  const selectedPiece = useDailyStore((s) => s.selectedPiece);
  const validMoves = useDailyStore((s) => s.validMoves);
  const handleCellClick = useDailyStore((s) => s.handleCellClick);
  const currentPlayer = useDailyStore((s) => s.currentPlayer);
  const animatingMove = useDailyStore((s) => s.animatingMove);
  const lastMove = useDailyStore((s) => s.lastMove);
  const aiThinking = useDailyStore((s) => s.aiThinking);
  const removingPieces = useDailyStore((s) => s.removingPieces);
  const activeSkinState = useGameStore((s) => s.activeSkinState);

  const skin = getSkin(activeSkinState);

  // ── Sliding animation state ──
  const [slidePhase, setSlidePhase] = useState('idle');
  const rafRef = useRef(null);

  useEffect(() => {
    if (animatingMove) {
      setSlidePhase('ready');
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setSlidePhase('sliding');
        });
      });
    } else {
      setSlidePhase('idle');
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animatingMove]);

  const validTargets = useMemo(() => {
    const set = new Set();
    validMoves.forEach((m) => set.add(`${m.to[0]}-${m.to[1]}`));
    return set;
  }, [validMoves]);

  const capturedCells = useMemo(() => {
    const set = new Set();
    validMoves.forEach((m) => {
      m.captures.forEach(([r, c]) => set.add(`${r}-${c}`));
    });
    return set;
  }, [validMoves]);

  const isLastMoveCell = (r, c) => {
    if (!lastMove) return false;
    return (
      (lastMove.from[0] === r && lastMove.from[1] === c) ||
      (lastMove.to[0] === r && lastMove.to[1] === c)
    );
  };

  const slideStyle = animatingMove ? (() => {
    const dr = animatingMove.to[0] - animatingMove.from[0];
    const dc = animatingMove.to[1] - animatingMove.from[1];
    return {
      position: 'absolute',
      left: `${animatingMove.from[1] * 12.5}%`,
      top:  `${animatingMove.from[0] * 12.5}%`,
      width:  '12.5%',
      height: '12.5%',
      transform: slidePhase === 'sliding'
        ? `translate(${dc * 100}%, ${dr * 100}%)`
        : 'translate(0%, 0%)',
      transition: slidePhase === 'sliding'
        ? 'transform 0.24s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        : 'none',
      zIndex: 30,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  })() : null;

  if (!board) return null;

  return (
    <div className={`relative select-none w-full flex justify-center ${aiThinking ? 'opacity-80 pointer-events-none' : ''}`}>
      <div className="w-full max-w-[calc(min(95vw,600px))] mx-auto select-none">
        <div className="w-full aspect-square relative pixel-border bg-[var(--bg-primary)] pixel-shadow flex flex-col justify-between p-2 md:p-3">
          <div className="relative grid grid-cols-8 grid-rows-8 aspect-square border-4 border-[var(--bg-primary)] flex-1 w-full h-full">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isDark = (r + c) % 2 === 1;
                const isSelected = selectedPiece && selectedPiece[0] === r && selectedPiece[1] === c;
                const isValidTarget = validTargets.has(`${r}-${c}`);
                const isThreatened = capturedCells.has(`${r}-${c}`);
                const isLast = isLastMoveCell(r, c);
                const hasPiece = cell !== EMPTY;
                const isAnimFrom = animatingMove && animatingMove.from[0] === r && animatingMove.from[1] === c;
                const removingPiece = removingPieces.find(p => p.r === r && p.c === c);

                let bgColor = isDark ? skin.darkCell : skin.lightCell;

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => isDark && handleCellClick(r, c)}
                    className="relative flex items-center justify-center border border-[var(--bg-primary)]"
                    style={{ backgroundColor: bgColor }}
                  >
                    {/* Selected highlight overlay */}
                    {isSelected && isDark && (
                      <div className="absolute inset-0 bg-white/20 pointer-events-none" />
                    )}

                    {isLast && isDark && (
                      <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                    )}
                    
                    {isValidTarget && !hasPiece && (
                      <div className="absolute inset-1 pixel-border-yellow animate-blink z-10 pointer-events-none" />
                    )}
                    
                    {isValidTarget && hasPiece && (
                      <div className="absolute inset-1 border-[3px] border-[var(--accent-red)] animate-blink z-10 pointer-events-none" />
                    )}
                    
                    {isThreatened && hasPiece && !isSelected && (
                      <div className="absolute inset-1 border-[3px] border-[var(--accent-red)] opacity-50 z-10 pointer-events-none" />
                    )}
                    
                    {/* Piece — hidden while it's the sliding ghost */}
                    {hasPiece && !isAnimFrom && (
                      <div className="flex items-center justify-center w-full h-full z-10">
                        <Piece type={cell} isSelected={isSelected} />
                      </div>
                    )}
                    
                    {/* Removing Piece — capture animation */}
                    {removingPiece && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center animate-capture">
                        <Piece type={removingPiece.type} isSelected={false} />
                      </div>
                    )}

                    {/* Coordinates */}
                    {c === 0 && (
                      <span className="absolute left-1 top-1 text-[8px] opacity-50 arcade-text pointer-events-none" style={{ color: skin.lightCell }}>
                        {8 - r}
                      </span>
                    )}
                    {r === 7 && (
                      <span className="absolute right-1 bottom-1 text-[8px] opacity-50 arcade-text pointer-events-none" style={{ color: skin.lightCell }}>
                        {String.fromCharCode(97 + c).toUpperCase()}
                      </span>
                    )}
                  </div>
                );
              })
            )}

            {/* ── Sliding ghost piece (animates from → to) ── */}
            {animatingMove && slideStyle && (
              <div style={slideStyle}>
                <Piece type={animatingMove.pieceType} isSelected={false} />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
