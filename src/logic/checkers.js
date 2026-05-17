/**
 * Русские шашки — полная игровая логика.
 *
 * Доска 8×8, координаты (row, col) — row 0 вверху.
 * Белые начинают снизу (ряды 5-7), чёрные — сверху (ряды 0-2).
 * Тёмные клетки — те, где (row + col) % 2 === 1.
 */

// ────────────────────── Constants ──────────────────────
export const EMPTY = 0;
export const WHITE = 1;
export const BLACK = 2;
export const WHITE_KING = 3;
export const BLACK_KING = 4;

export const BOARD_SIZE = 8;

// ────────────────────── Helpers ──────────────────────
export const isWhite = (p) => p === WHITE || p === WHITE_KING;
export const isBlack = (p) => p === BLACK || p === BLACK_KING;
export const isKing = (p) => p === WHITE_KING || p === BLACK_KING;
export const owner = (p) => {
  if (isWhite(p)) return 'white';
  if (isBlack(p)) return 'black';
  return null;
};

export const enemyOf = (piece) => {
  if (isWhite(piece)) return (p) => isBlack(p);
  if (isBlack(piece)) return (p) => isWhite(p);
  return () => false;
};

const inBounds = (r, c) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;

// ────────────────────── Initial board ──────────────────────
export function createInitialBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 1) {
        if (r <= 2) board[r][c] = BLACK;
        if (r >= 5) board[r][c] = WHITE;
      }
    }
  }
  return board;
}

// ────────────────────── Deep clone ──────────────────────
export function cloneBoard(board) {
  return board.map((row) => [...row]);
}

// ────────────────────── Promotion ──────────────────────
function maybePromote(board, r, c) {
  if (board[r][c] === WHITE && r === 0) board[r][c] = WHITE_KING;
  if (board[r][c] === BLACK && r === 7) board[r][c] = BLACK_KING;
}

// ────────────────────── Move types ──────────────────────
/**
 * Move object:
 *  { from: [r,c], to: [r,c], captures: [[r,c], …], isPromotion: bool }
 */

// ────────────────────── Simple (non-capture) moves ──────────────────────
function getSimpleMoves(board, r, c) {
  const piece = board[r][c];
  if (piece === EMPTY) return [];

  const moves = [];

  if (isKing(piece)) {
    // Дамка ходит на любое расстояние по диагонали (русские правила)
    const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of dirs) {
      let nr = r + dr;
      let nc = c + dc;
      while (inBounds(nr, nc) && board[nr][nc] === EMPTY) {
        moves.push({ from: [r, c], to: [nr, nc], captures: [], isPromotion: false });
        nr += dr;
        nc += dc;
      }
    }
  } else {
    // Обычная шашка — одна клетка вперёд по диагонали
    const direction = isWhite(piece) ? -1 : 1;
    for (const dc of [-1, 1]) {
      const nr = r + direction;
      const nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc] === EMPTY) {
        const isPromotion = (isWhite(piece) && nr === 0) || (isBlack(piece) && nr === 7);
        moves.push({ from: [r, c], to: [nr, nc], captures: [], isPromotion });
      }
    }
  }

  return moves;
}

// ────────────────────── Captures ──────────────────────
/**
 * Рекурсивно находим все возможные цепочки взятий для фигуры.
 * Русские правила:
 *   — обычная шашка бьёт вперёд и назад
 *   — дамка бьёт на любое расстояние, может приземлиться на любую клетку за побитой
 *   — побитые фигуры снимаются после завершения всей цепочки, но через них нельзя прыгать дважды
 *   — если шашка становится дамкой во время цепочки — она продолжает бить как дамка
 */
function getCaptureSequences(board, r, c, alreadyCaptured = []) {
  const piece = board[r][c];
  if (piece === EMPTY) return [];

  const isEnemy = enemyOf(piece);
  const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const sequences = [];

  if (isKing(piece)) {
    // Дамка — летит по диагонали, находит вражескую фигуру, бьёт
    for (const [dr, dc] of dirs) {
      let er = r + dr;
      let ec = c + dc;
      // Ищем первую фигуру на диагонали
      while (inBounds(er, ec) && board[er][ec] === EMPTY) {
        er += dr;
        ec += dc;
      }
      // Нашли вражескую?
      if (!inBounds(er, ec)) continue;
      if (!isEnemy(board[er][ec])) continue;
      // Проверяем, не бита ли уже
      if (alreadyCaptured.some(([cr, cc]) => cr === er && cc === ec)) continue;

      // Все клетки за побитой — возможные приземления
      let lr = er + dr;
      let lc = ec + dc;
      while (inBounds(lr, lc) && (board[lr][lc] === EMPTY || (lr === r && lc === c))) {
        if (board[lr][lc] !== EMPTY && !(lr === r && lc === c)) break;
        const newCaptured = [...alreadyCaptured, [er, ec]];
        // Определяем, станет ли дамкой (дамка уже дамка)
        const newBoard = cloneBoard(board);
        newBoard[r][c] = EMPTY;
        newBoard[er][ec] = EMPTY; // временно убираем побитую для рекурсии
        newBoard[lr][lc] = piece;

        const further = getCaptureSequences(newBoard, lr, lc, newCaptured);
        if (further.length > 0) {
          for (const seq of further) {
            sequences.push({
              from: [r, c],
              to: seq.to,
              captures: [[er, ec], ...seq.captures],
              path: [[r, c], [lr, lc], ...(seq.path || []).slice(1)],
              isPromotion: seq.isPromotion,
            });
          }
        } else {
          sequences.push({
            from: [r, c],
            to: [lr, lc],
            captures: [[er, ec]],
            path: [[r, c], [lr, lc]],
            isPromotion: false,
          });
        }

        lr += dr;
        lc += dc;
      }
    }
  } else {
    // Обычная шашка бьёт в 4 направлениях на 1 клетку
    for (const [dr, dc] of dirs) {
      const er = r + dr;
      const ec = c + dc;
      const lr = r + 2 * dr;
      const lc = c + 2 * dc;

      if (!inBounds(lr, lc)) continue;
      if (!isEnemy(board[er][ec])) continue;
      if (board[lr][lc] !== EMPTY && !(lr === r && lc === c)) continue;
      if (alreadyCaptured.some(([cr, cc]) => cr === er && cc === ec)) continue;

      const newCaptured = [...alreadyCaptured, [er, ec]];

      // Проверяем превращение в дамку
      const willPromote =
        (isWhite(piece) && lr === 0) || (isBlack(piece) && lr === 7);
      const promotedPiece = willPromote
        ? (isWhite(piece) ? WHITE_KING : BLACK_KING)
        : piece;

      const newBoard = cloneBoard(board);
      newBoard[r][c] = EMPTY;
      newBoard[er][ec] = EMPTY;
      newBoard[lr][lc] = promotedPiece;

      // В русских шашках: если шашка стала дамкой — она ПРОДОЛЖАЕТ бить как дамка
      const further = getCaptureSequences(newBoard, lr, lc, newCaptured);

      if (further.length > 0) {
        for (const seq of further) {
          sequences.push({
            from: [r, c],
            to: seq.to,
            captures: [[er, ec], ...seq.captures],
            path: [[r, c], [lr, lc], ...(seq.path || []).slice(1)],
            isPromotion: willPromote || seq.isPromotion,
          });
        }
      } else {
        sequences.push({
          from: [r, c],
          to: [lr, lc],
          captures: [[er, ec]],
          path: [[r, c], [lr, lc]],
          isPromotion: willPromote,
        });
      }
    }
  }

  return sequences;
}

// ────────────────────── Public API ──────────────────────

/**
 * Все допустимые ходы для данного игрока.
 * Если есть хотя бы одно взятие — возвращаются ТОЛЬКО взятия (обязательное взятие).
 * Из взятий возвращаются только максимальные по количеству побитых (правило большинства — опционально, но стандартно для русских шашек).
 */
export function getValidMoves(board, currentPlayer) {
  const isPiece = currentPlayer === 'white' ? isWhite : isBlack;
  let allCaptures = [];
  let allSimple = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!isPiece(board[r][c])) continue;
      const captures = getCaptureSequences(board, r, c);
      allCaptures.push(...captures);
      const simple = getSimpleMoves(board, r, c);
      allSimple.push(...simple);
    }
  }

  // Обязательное взятие
  if (allCaptures.length > 0) {
    // Правило большинства: выбираем ходы с максимальным числом взятий
    const maxCaptures = Math.max(...allCaptures.map((m) => m.captures.length));
    return allCaptures.filter((m) => m.captures.length === maxCaptures);
  }

  return allSimple;
}

/**
 * Ходы для конкретной фигуры (подсветка при клике).
 */
export function getMovesForPiece(board, r, c, currentPlayer) {
  const piece = board[r][c];
  if (piece === EMPTY) return [];
  if (currentPlayer === 'white' && !isWhite(piece)) return [];
  if (currentPlayer === 'black' && !isBlack(piece)) return [];

  const allValid = getValidMoves(board, currentPlayer);
  return allValid.filter((m) => m.from[0] === r && m.from[1] === c);
}

/**
 * Применяет ход к доске, возвращает новую доску.
 */
export function applyMove(board, move) {
  const newBoard = cloneBoard(board);
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = newBoard[fr][fc];

  newBoard[fr][fc] = EMPTY;
  newBoard[tr][tc] = piece;

  // Убираем побитые фигуры
  for (const [cr, cc] of move.captures) {
    newBoard[cr][cc] = EMPTY;
  }

  // Превращение в дамку
  maybePromote(newBoard, tr, tc);

  return newBoard;
}

/**
 * Определяет победителя или ничью.
 * Возвращает: 'white' | 'black' | 'draw' | null (игра продолжается)
 */
export function checkWinner(board, currentPlayer) {
  const validMoves = getValidMoves(board, currentPlayer);

  if (validMoves.length === 0) {
    // Текущий игрок не может ходить — проигрывает
    return currentPlayer === 'white' ? 'black' : 'white';
  }

  // Проверяем, есть ли фигуры у обоих игроков
  let hasWhite = false;
  let hasBlack = false;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isWhite(board[r][c])) hasWhite = true;
      if (isBlack(board[r][c])) hasBlack = true;
    }
  }

  if (!hasWhite) return 'black';
  if (!hasBlack) return 'white';

  return null;
}

/**
 * Подсчитывает фигуры каждого игрока.
 */
export function countPieces(board) {
  let white = 0, black = 0, whiteKings = 0, blackKings = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p === WHITE) white++;
      if (p === BLACK) black++;
      if (p === WHITE_KING) whiteKings++;
      if (p === BLACK_KING) blackKings++;
    }
  }
  return { white: white + whiteKings, black: black + blackKings, whiteKings, blackKings };
}
