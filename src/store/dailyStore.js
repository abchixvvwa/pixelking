import { create } from 'zustand';
import {
  getValidMoves,
  applyMove,
  checkWinner,
  countPieces,
  isWhite,
  isBlack,
  EMPTY,
} from '../logic/checkers';
import { getAIMove } from '../logic/ai';
import { getTodayChallenge } from '../data/dailyChallenges';

const LS_KEY = 'duels_daily_result';

function getSavedResult() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (data.date === today) return data;
    return null;
  } catch { return null; }
}

function saveResult(result) {
  localStorage.setItem(LS_KEY, JSON.stringify(result));
}

function boardFromPieces(pieces) {
  return pieces.map(row => [...row]);
}

function calcStars(moves, parMoves) {
  if (moves <= parMoves) return 3;
  if (moves <= parMoves * 2) return 2;
  return 1;
}

const useDailyStore = create((set, get) => ({
  // State
  challenge: null,
  board: null,
  currentPlayer: 'white',
  selectedPiece: null,
  validMoves: [],
  winner: null,
  moveCount: 0,
  animatingMove: null,
  lastMove: null,
  aiThinking: false,
  removingPieces: [],

  // Timer
  timerStart: null,
  elapsedSeconds: 0,

  // Result
  completed: false,
  result: null, // { date, stars, moves, time }

  // Init
  initDaily: () => {
    const challenge = getTodayChallenge();
    const saved = getSavedResult();
    if (saved) {
      set({
        challenge,
        board: boardFromPieces(challenge.board),
        completed: true,
        result: saved,
        currentPlayer: 'white',
        selectedPiece: null,
        validMoves: [],
        winner: null,
        moveCount: 0,
        animatingMove: null,
        lastMove: null,
        aiThinking: false,
        timerStart: null,
        elapsedSeconds: 0,
      });
    } else {
      set({
        challenge,
        board: boardFromPieces(challenge.board),
        currentPlayer: 'white',
        selectedPiece: null,
        validMoves: [],
        winner: null,
        moveCount: 0,
        animatingMove: null,
        lastMove: null,
        aiThinking: false,
        completed: false,
        result: null,
        timerStart: Date.now(),
        elapsedSeconds: 0,
      });
    }
  },

  tickTimer: () => {
    const { timerStart, completed } = get();
    if (!timerStart || completed) return;
    set({ elapsedSeconds: Math.floor((Date.now() - timerStart) / 1000) });
  },

  // Game logic (mirrors gameStore but for daily)
  handleCellClick: (row, col) => {
    const { selectedPiece, validMoves, board, currentPlayer, winner, aiThinking, completed } = get();
    if (winner || aiThinking || completed) return;
    if (currentPlayer === 'black') return;

    if (selectedPiece) {
      const move = validMoves.find(m => m.to[0] === row && m.to[1] === col);
      if (move) {
        get().makeMove(move);
        return;
      }
    }

    const allMoves = getValidMoves(board, currentPlayer);
    const pieceMoves = allMoves.filter(m => m.from[0] === row && m.from[1] === col);
    if (pieceMoves.length > 0) {
      set({ selectedPiece: [row, col], validMoves: pieceMoves });
    } else {
      set({ selectedPiece: null, validMoves: [] });
    }
  },

  makeMove: (move) => {
    const { board, currentPlayer, moveCount } = get();

    const path = move.path || [move.from, move.to];
    const origPieceType = board[move.from[0]][move.from[1]];

    // ── Finalize: apply real move result ──
    const finalize = () => {
      const newBoard = applyMove(board, move);
      const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
      const winner = checkWinner(newBoard, nextPlayer);
      const newMoveCount = currentPlayer === 'white' ? moveCount + 1 : moveCount;

      set({
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedPiece: null,
        validMoves: [],
        winner,
        moveCount: newMoveCount,
        animatingMove: null,
        lastMove: move,
        removingPieces: [],
      });

      if (winner) {
        const { challenge, timerStart } = get();
        const finalTime = Math.floor((Date.now() - timerStart) / 1000);
        const stars = winner === 'white'
          ? calcStars(newMoveCount, challenge.parMoves)
          : 0;
        const result = {
          date: new Date().toISOString().slice(0, 10),
          stars,
          moves: newMoveCount,
          time: finalTime,
          won: winner === 'white',
        };
        saveResult(result);
        setTimeout(() => {
          set({ completed: true, result, elapsedSeconds: finalTime });
        }, 1000);
        return;
      }

      if (nextPlayer === 'black') {
        get()._triggerAI();
      }
    };

    // ── Single hop (simple move or single capture) ──
    if (path.length <= 2) {
      set({ animatingMove: { from: move.from, to: move.to, pieceType: origPieceType } });
      setTimeout(() => {
        finalize();
        if (move.captures.length === 1) {
          const [cr, cc] = move.captures[0];
          set({ removingPieces: [{ r: cr, c: cc, type: board[cr][cc] }] });
          setTimeout(() => set({ removingPieces: [] }), 350);
        }
      }, 260);
      return;
    }

    // ── Multi-hop chain capture: animate step by step ──
    let pieceType = origPieceType;

    const animateStep = (stepIndex, stepBoard) => {
      if (stepIndex >= path.length - 1) {
        finalize();
        return;
      }

      const from = path[stepIndex];
      const to = path[stepIndex + 1];
      const captured = move.captures[stepIndex];
      const capturedType = stepBoard[captured[0]][captured[1]];

      set({ animatingMove: { from, to, pieceType } });

      setTimeout(() => {
        const nextBoard = stepBoard.map(row => [...row]);
        nextBoard[from[0]][from[1]] = 0;
        if (pieceType === 1 && to[0] === 0) pieceType = 3;
        if (pieceType === 2 && to[0] === 7) pieceType = 4;
        nextBoard[to[0]][to[1]] = pieceType;
        nextBoard[captured[0]][captured[1]] = 0;

        set({
          board: nextBoard,
          animatingMove: null,
          removingPieces: [{ r: captured[0], c: captured[1], type: capturedType }],
        });

        setTimeout(() => {
          set({ removingPieces: [] });
          animateStep(stepIndex + 1, nextBoard);
        }, 180);
      }, 250);
    };

    animateStep(0, board);
  },

  _triggerAI: () => {
    const { board, winner } = get();
    if (winner) return;
    set({ aiThinking: true });

    setTimeout(() => {
      const { board: currentBoard, winner: w } = get();
      if (w) { set({ aiThinking: false }); return; }

      const aiMove = getAIMove(currentBoard, 'master');
      if (!aiMove) { set({ aiThinking: false }); return; }

      set({ aiThinking: false });
      get().makeMove(aiMove);
    }, 600);
  },
}));

export default useDailyStore;
