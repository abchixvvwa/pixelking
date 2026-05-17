import { useState, useEffect, useCallback, useRef } from 'react';
import Piece from './Piece';
import { getSkin } from '../data/skins';
import useGameStore from '../store/gameStore';
import {
  EMPTY, isWhite, isBlack,
  getValidMoves, applyMove, cloneBoard,
} from '../logic/checkers';

/**
 * Visual solution replay modal.
 * Shows a mini board and animates the solution moves step by step.
 */
export default function SolutionReplay({ challenge, onClose }) {
  const activeSkinState = useGameStore(s => s.activeSkinState);
  const skin = getSkin(activeSkinState);

  const initialBoard = challenge.board.map(r => [...r]);
  const solutionMoves = challenge.solution || [];

  const [board, setBoard] = useState(initialBoard);
  const [step, setStep] = useState(-1); // -1 = initial, 0..N = after move N
  const [playing, setPlaying] = useState(false);
  const [highlight, setHighlight] = useState(null); // {from, to}
  const timerRef = useRef(null);

  // Find the actual move object from valid moves
  const findMove = useCallback((b, solMove, player) => {
    const valid = getValidMoves(b, player);
    return valid.find(m =>
      m.from[0] === solMove.from[0] && m.from[1] === solMove.from[1] &&
      m.to[0] === solMove.to[0] && m.to[1] === solMove.to[1]
    );
  }, []);

  // Play through all solution steps
  const playAll = useCallback(() => {
    setBoard(initialBoard);
    setStep(-1);
    setHighlight(null);
    setPlaying(true);

    let currentBoard = initialBoard.map(r => [...r]);
    let currentStep = 0;
    let currentPlayer = 'white';

    const doStep = () => {
      if (currentStep >= solutionMoves.length) {
        setPlaying(false);
        return;
      }

      const solMove = solutionMoves[currentStep];
      const move = findMove(currentBoard, solMove, currentPlayer);

      if (!move) {
        setPlaying(false);
        return;
      }

      // Highlight the move
      setHighlight({ from: move.from, to: move.to });

      // After a brief pause, apply the move
      timerRef.current = setTimeout(() => {
        const newBoard = applyMove(currentBoard, move);
        currentBoard = newBoard;
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        setBoard(newBoard.map(r => [...r]));
        setStep(currentStep);
        setHighlight(null);

        // If there's an AI response needed, play it
        if (currentStep < solutionMoves.length - 1 && currentPlayer === 'black') {
          timerRef.current = setTimeout(() => {
            const aiMoves = getValidMoves(currentBoard, 'black');
            if (aiMoves.length > 0) {
              const aiMove = aiMoves[0];
              setHighlight({ from: aiMove.from, to: aiMove.to });

              timerRef.current = setTimeout(() => {
                const afterAI = applyMove(currentBoard, aiMove);
                currentBoard = afterAI;
                currentPlayer = 'white';
                setBoard(afterAI.map(r => [...r]));
                setHighlight(null);

                currentStep++;
                timerRef.current = setTimeout(doStep, 400);
              }, 500);
            } else {
              currentStep++;
              timerRef.current = setTimeout(doStep, 400);
            }
          }, 300);
        } else {
          currentStep++;
          timerRef.current = setTimeout(doStep, 600);
        }
      }, 600);
    };

    timerRef.current = setTimeout(doStep, 500);
  }, [initialBoard, solutionMoves, findMove]);

  // Auto-play on mount
  useEffect(() => {
    playAll();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setBoard(initialBoard);
    setStep(-1);
    setHighlight(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-[var(--bg-card)] pixel-border pixel-shadow p-4 md:p-6 w-[95vw] max-w-[420px] animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="arcade-text text-sm text-[var(--accent-yellow)]">SOLUTION</h3>
          <button
            onClick={onClose}
            className="arcade-text text-xs text-[var(--color-dim)] hover:text-[var(--accent-red)]"
          >
            ✕
          </button>
        </div>

        {/* Mini Board */}
        <div className="w-full aspect-square pixel-border bg-[var(--bg-primary)] p-1 mb-4">
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isDark = (r + c) % 2 === 1;
                const hasPiece = cell !== EMPTY;
                const isFrom = highlight && highlight.from[0] === r && highlight.from[1] === c;
                const isTo = highlight && highlight.to[0] === r && highlight.to[1] === c;

                return (
                  <div
                    key={`${r}-${c}`}
                    className="relative flex items-center justify-center"
                    style={{
                      backgroundColor: isDark ? skin.darkCell : skin.lightCell,
                      border: '1px solid var(--bg-primary)',
                    }}
                  >
                    {/* Move highlight */}
                    {isFrom && (
                      <div className="absolute inset-0 bg-[var(--accent-yellow)] opacity-30 pointer-events-none" />
                    )}
                    {isTo && (
                      <div className="absolute inset-0 border-2 border-[var(--accent-yellow)] opacity-80 pointer-events-none" />
                    )}

                    {/* Piece */}
                    {hasPiece && (
                      <div className="w-[80%] h-[80%] flex items-center justify-center">
                        <Piece type={cell} isSelected={false} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { reset(); setTimeout(playAll, 100); }}
            className="pixel-button py-3 px-6 text-[9px]"
            disabled={playing}
          >
            {playing ? '▶ PLAYING...' : '↻ REPLAY'}
          </button>
          <button
            onClick={onClose}
            className="py-3 px-6 text-[9px] arcade-text text-[var(--color-dim)] border-2 border-[var(--color-dim)] bg-transparent pixel-shadow hover:text-[var(--color-light)]"
          >
            CLOSE
          </button>
        </div>

        {/* Step indicator */}
        <div className="mt-3 text-center">
          <span className="font-mono text-[9px] text-[var(--color-dim)]">
            {step === -1 ? 'READY' : `MOVE ${step + 1} / ${solutionMoves.length}`}
          </span>
        </div>
      </div>
    </div>
  );
}
