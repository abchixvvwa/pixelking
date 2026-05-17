/**
 * AI для русских шашек — Minimax с Alpha-Beta pruning.
 *
 * AI играет за чёрных.
 * Три уровня сложности:
 *   - novice:  глубина 2, 30% случайных ходов
 *   - tactician: глубина 4
 *   - master:  глубина 6
 */

import {
  BOARD_SIZE,
  WHITE, BLACK, WHITE_KING, BLACK_KING, EMPTY,
  isWhite, isBlack, isKing,
  getValidMoves,
  applyMove,
  cloneBoard,
} from './checkers';

// ────────────────────── Difficulty configs ──────────────────────
export const AI_LEVELS = {
  novice: { depth: 2, randomness: 0.3, label: 'Новичок' },
  tactician: { depth: 4, randomness: 0, label: 'Тактик' },
  master: { depth: 6, randomness: 0, label: 'Мастер' },
};

// ────────────────────── Position evaluation ──────────────────────
/**
 * Оценка позиции с точки зрения чёрных (AI).
 *
 *  +1 за каждую свою шашку (чёрную)
 *  +3 за дамку
 *  +0.1 за шашки ближе к центру
 *  -1 за каждую белую шашку
 *  -3 за белую дамку
 */
function evaluateBoard(board) {
  let score = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece === EMPTY) continue;

      // Расстояние от центра (0-3, меньше = ближе)
      const centerDist = Math.abs(3.5 - r) + Math.abs(3.5 - c);
      const centerBonus = (7 - centerDist) * 0.1; // макс ~0.7 за центр

      if (piece === BLACK) {
        score += 1 + centerBonus;
        // Бонус за продвижение к превращению
        score += r * 0.05;
      } else if (piece === BLACK_KING) {
        score += 3 + centerBonus;
      } else if (piece === WHITE) {
        score -= 1 + centerBonus;
        // Бонус за продвижение
        score -= (7 - r) * 0.05;
      } else if (piece === WHITE_KING) {
        score -= 3 + centerBonus;
      }
    }
  }

  return score;
}

// ────────────────────── Minimax + Alpha-Beta ──────────────────────
/**
 * @param {number[][]} board
 * @param {number} depth - оставшаяся глубина поиска
 * @param {number} alpha
 * @param {number} beta
 * @param {boolean} isMaximizing - true = чёрные (AI), false = белые
 * @returns {{ score: number, move: object|null }}
 */
function minimax(board, depth, alpha, beta, isMaximizing) {
  const currentPlayer = isMaximizing ? 'black' : 'white';
  const moves = getValidMoves(board, currentPlayer);

  // Терминальное состояние
  if (moves.length === 0) {
    // Текущий игрок не может ходить — проигрывает
    return { score: isMaximizing ? -1000 - depth : 1000 + depth, move: null };
  }

  if (depth === 0) {
    return { score: evaluateBoard(board), move: null };
  }

  let bestMove = null;

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move);
      const result = minimax(newBoard, depth - 1, alpha, beta, false);
      if (result.score > maxScore) {
        maxScore = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, maxScore);
      if (beta <= alpha) break; // pruning
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move);
      const result = minimax(newBoard, depth - 1, alpha, beta, true);
      if (result.score < minScore) {
        minScore = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, minScore);
      if (beta <= alpha) break; // pruning
    }
    return { score: minScore, move: bestMove };
  }
}

// ────────────────────── Public API ──────────────────────

/**
 * Вычисляет лучший ход для AI (чёрных).
 *
 * @param {number[][]} board
 * @param {'novice'|'tactician'|'master'} difficulty
 * @returns {object} move
 */
export function getAIMove(board, difficulty = 'tactician') {
  const config = AI_LEVELS[difficulty];
  const moves = getValidMoves(board, 'black');

  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  // Новичок: 30% шанс сделать случайный ход
  if (config.randomness > 0 && Math.random() < config.randomness) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const result = minimax(board, config.depth, -Infinity, Infinity, true);
  return result.move || moves[0];
}
