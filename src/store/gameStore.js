import { create } from 'zustand';
import {
  createInitialBoard,
  getMovesForPiece,
  getValidMoves,
  applyMove,
  checkWinner,
  countPieces,
  isWhite,
  isBlack,
} from '../logic/checkers';
import { getAIMove } from '../logic/ai';

const useGameStore = create((set, get) => ({
  // ──── Screen state ────
  screen: 'menu',            // 'menu' | 'difficulty' | 'game' | 'gameover' | 'daily' | 'leaderboard' | 'shop'
  gameMode: null,             // 'local' | 'ai' | 'online'
  aiDifficulty: null,         // 'novice' | 'tactician' | 'master'
  activeSkinState: 'classic', // initialized later or from getActiveSkin()
  onlineRole: null,           // 'white' | 'black' when gameMode === 'online'
  onlineChannel: null,        // Supabase Realtime channel ref

  // ──── Game state ────
  board: createInitialBoard(),
  currentPlayer: 'white',
  selectedPiece: null,        // [row, col] or null
  validMoves: [],             // moves for selected piece
  winner: null,               // 'white' | 'black' | null
  moveHistory: [],
  animatingMove: null,        // { from, to } — for animation
  capturedWhite: 0,
  capturedBlack: 0,
  lastMove: null,
  aiThinking: false,          // показывать индикатор "AI думает"
  removingPieces: [],

  // ──── Psychotype metrics ────
  moveTimestamps: [],         // timestamp начала каждого хода
  moveSpeed: [],              // время каждого хода в секундах (только для белых / игрока)
  capturesChosen: 0,          // сколько раз выбрал взятие при наличии нескольких вариантов
  sacrifices: 0,              // сколько раз пошёл на позицию где могут съесть
  lastMoveStartTime: null,    // время начала текущего хода

  // ──── Navigation actions ────
  goToMenu: () => {
    set({
      screen: 'menu',
      gameMode: null,
      aiDifficulty: null,
      winner: null,
    });
  },

  goToDaily: () => {
    set({ screen: 'daily' });
  },

  goToLeaderboard: () => {
    set({ screen: 'leaderboard' });
  },

  goToShop: () => {
    set({ screen: 'shop' });
  },

  setActiveSkinState: (skinId) => {
    set({ activeSkinState: skinId });
  },

  goToGameOver: () => {
    set({ screen: 'gameover' });
  },

  startLocalGame: () => {
    const freshState = getInitialGameState();
    set({
      ...freshState,
      screen: 'game',
      gameMode: 'local',
      aiDifficulty: null,
      onlineRole: null,
      onlineChannel: null,
    });
  },

  goToDifficulty: () => {
    set({ screen: 'difficulty' });
  },

  startAIGame: (difficulty) => {
    const freshState = getInitialGameState();
    set({
      ...freshState,
      screen: 'game',
      gameMode: 'ai',
      aiDifficulty: difficulty,
      onlineRole: null,
      onlineChannel: null,
    });
  },

  startOnlineGame: (role) => {
    const freshState = getInitialGameState();
    set({
      ...freshState,
      screen: 'game',
      gameMode: 'online',
      aiDifficulty: null,
      onlineRole: role,
    });
  },

  setOnlineChannel: (channel) => {
    set({ onlineChannel: channel });
  },

  clearOnlineSession: () => {
    const { onlineChannel } = get();
    if (onlineChannel) {
      onlineChannel.unsubscribe();
    }
    set({
      ...getInitialGameState(),
      screen: 'menu',
      gameMode: null,
      onlineRole: null,
      onlineChannel: null,
      aiDifficulty: null,
    });
  },

  applyOnlineState: (payload) => {
    if (!payload?.board) return;
    set({
      board: payload.board,
      currentPlayer: payload.nextTurn ?? payload.currentPlayer ?? 'white',
      winner: payload.winner ?? null,
      capturedWhite: payload.capturedWhite ?? 0,
      capturedBlack: payload.capturedBlack ?? 0,
      capturedWhitePieces: payload.capturedWhitePieces ?? [],
      capturedBlackPieces: payload.capturedBlackPieces ?? [],
      selectedPiece: null,
      validMoves: [],
      animatingMove: null,
      removingPieces: [],
      lastMove: payload.lastMove ?? null,
    });
    if (payload.winner) {
      setTimeout(() => get().goToGameOver(), 1500);
    }
  },

  getOnlineSnapshot: () => {
    const s = get();
    return {
      board: s.board,
      nextTurn: s.currentPlayer,
      winner: s.winner,
      capturedWhite: s.capturedWhite,
      capturedBlack: s.capturedBlack,
      capturedWhitePieces: s.capturedWhitePieces || [],
      capturedBlackPieces: s.capturedBlackPieces || [],
      lastMove: s.lastMove,
    };
  },

  broadcastOnlineMove: (payload) => {
    const { onlineChannel, gameMode } = get();
    if (gameMode !== 'online' || !onlineChannel) return;
    onlineChannel.send({
      type: 'broadcast',
      event: 'game_move',
      payload,
    });
  },

  // ──── Game actions ────
  selectPiece: (row, col) => {
    const { board, currentPlayer, winner, gameMode, onlineRole } = get();
    if (winner) return;
    if (gameMode === 'online' && onlineRole !== currentPlayer) return;

    const moves = getMovesForPiece(board, row, col, currentPlayer);
    if (moves.length === 0) return;

    set({
      selectedPiece: [row, col],
      validMoves: moves,
    });
  },

  clearSelection: () => {
    set({ selectedPiece: null, validMoves: [] });
  },

  makeMove: (move) => {
    const {
      board, currentPlayer, moveHistory,
      lastMoveStartTime, moveSpeed, capturesChosen, sacrifices,
      gameMode, aiDifficulty,
    } = get();

    // ──── Трекинг метрик (только для человека — белых) ────
    let newMoveSpeed = [...moveSpeed];
    let newCapturesChosen = capturesChosen;
    let newSacrifices = sacrifices;

    if (currentPlayer === 'white' && lastMoveStartTime) {
      const elapsed = (Date.now() - lastMoveStartTime) / 1000;
      newMoveSpeed.push(elapsed);
    }

    if (currentPlayer === 'white' && move.captures.length > 0) {
      const allMoves = getValidMoves(board, 'white');
      const captureMoves = allMoves.filter(m => m.captures.length > 0);
      if (captureMoves.length > 1) {
        newCapturesChosen++;
      }
    }

    if (currentPlayer === 'white') {
      const boardAfter = applyMove(board, move);
      const opponentMoves = getValidMoves(boardAfter, 'black');
      const canCaptureUs = opponentMoves.some(m => m.captures.length > 0);
      if (canCaptureUs) {
        newSacrifices++;
      }
    }

    const path = move.path || [move.from, move.to];
    const origPieceType = board[move.from[0]][move.from[1]];

    // ── Finalize: apply the real move result and continue game ──
    const finalize = () => {
      const newBoard = applyMove(board, move);
      const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
      const winner = checkWinner(newBoard, nextPlayer);
      const counts = countPieces(newBoard);

      set({
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedPiece: null,
        validMoves: [],
        winner,
        moveHistory: [...moveHistory, { move, board, player: currentPlayer }],
        animatingMove: null,
        capturedWhite: 12 - counts.white,
        capturedBlack: 12 - counts.black,
        lastMove: move,
        lastMoveStartTime: Date.now(),
        moveSpeed: newMoveSpeed,
        capturesChosen: newCapturesChosen,
        sacrifices: newSacrifices,
        removingPieces: [],
        capturedWhitePieces: currentPlayer === 'black'
          ? [...(get().capturedWhitePieces || []), ...move.captures.map(([r, c]) => board[r][c])]
          : (get().capturedWhitePieces || []),
        capturedBlackPieces: currentPlayer === 'white'
          ? [...(get().capturedBlackPieces || []), ...move.captures.map(([r, c]) => board[r][c])]
          : (get().capturedBlackPieces || []),
      });

      if (winner) {
        get()._logMetrics(winner);
        setTimeout(() => { get().goToGameOver(); }, 1500);
      }
      if (!winner && gameMode === 'ai' && nextPlayer === 'black') {
        get()._triggerAI();
      }
      if (gameMode === 'online') {
        get().broadcastOnlineMove({
          board: newBoard,
          nextTurn: nextPlayer,
          winner,
          capturedWhite: 12 - counts.white,
          capturedBlack: 12 - counts.black,
          capturedWhitePieces: get().capturedWhitePieces || [],
          capturedBlackPieces: get().capturedBlackPieces || [],
          lastMove: move,
        });
      }
    };

    // ── Single hop (simple move or single capture) ──
    if (path.length <= 2) {
      set({ animatingMove: { from: move.from, to: move.to, pieceType: origPieceType } });
      setTimeout(() => {
        finalize();
        // Single capture flash
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

      // 1. Slide piece from → to
      set({ animatingMove: { from, to, pieceType } });

      setTimeout(() => {
        // 2. Update intermediate board
        const nextBoard = stepBoard.map(row => [...row]);
        nextBoard[from[0]][from[1]] = 0;
        // Check promotion mid-chain
        if (pieceType === 1 && to[0] === 0) pieceType = 3;
        if (pieceType === 2 && to[0] === 7) pieceType = 4;
        nextBoard[to[0]][to[1]] = pieceType;
        nextBoard[captured[0]][captured[1]] = 0;

        // 3. Show capture flash
        set({
          board: nextBoard,
          animatingMove: null,
          removingPieces: [{ r: captured[0], c: captured[1], type: capturedType }],
        });

        // 4. After flash → next hop
        setTimeout(() => {
          set({ removingPieces: [] });
          animateStep(stepIndex + 1, nextBoard);
        }, 180);
      }, 250);
    };

    animateStep(0, board);
  },

  _triggerAI: () => {
    const { board, aiDifficulty } = get();
    set({ aiThinking: true });

    // Задержка 250мс — имитация "думает"
    setTimeout(() => {
      const { board: currentBoard, winner } = get();
      if (winner) {
        set({ aiThinking: false });
        return;
      }

      const aiMove = getAIMove(currentBoard, aiDifficulty);
      if (!aiMove) {
        set({ aiThinking: false });
        return;
      }

      set({ aiThinking: false });
      // AI делает ход
      get().makeMove(aiMove);
    }, 250);
  },

  handleCellClick: (row, col) => {
    const { selectedPiece, validMoves, board, currentPlayer, winner, gameMode, aiThinking, onlineRole } = get();
    if (winner) return;
    if (aiThinking) return;

    if (gameMode === 'ai' && currentPlayer === 'black') return;

    // Онлайн: только свой цвет и только в свой ход
    if (gameMode === 'online') {
      if (!onlineRole || onlineRole !== currentPlayer) return;
    }

    // If a piece is selected, check if this is a valid target
    if (selectedPiece) {
      const move = validMoves.find((m) => m.to[0] === row && m.to[1] === col);
      if (move) {
        get().makeMove(move);
        return;
      }
    }

    // Check if clicking on own piece
    const allMoves = getValidMoves(board, currentPlayer);
    const pieceMoves = allMoves.filter((m) => m.from[0] === row && m.from[1] === col);
    if (pieceMoves.length > 0) {
      set({ selectedPiece: [row, col], validMoves: pieceMoves });
    } else {
      set({ selectedPiece: null, validMoves: [] });
    }
  },

  resetGame: () => {
    const { gameMode, aiDifficulty } = get();
    const freshState = getInitialGameState();
    set({
      ...freshState,
      screen: 'game',
      gameMode,
      aiDifficulty,
    });
  },

  // ──── Metrics logging ────
  _logMetrics: (winner) => {
    const { moveSpeed, capturesChosen, sacrifices, moveHistory, gameMode, aiDifficulty } = get();

    const avgThinkTime = moveSpeed.length > 0
      ? (moveSpeed.reduce((a, b) => a + b, 0) / moveSpeed.length).toFixed(2)
      : 0;

    const metrics = {
      gameMode,
      aiDifficulty,
      winner,
      totalMoves: moveHistory.length,
      playerMoves: moveSpeed.length,
      moveSpeed,
      avgThinkTime: parseFloat(avgThinkTime),
      capturesChosen,
      sacrifices,
    };

    console.group('Game Over — Player Metrics');
    console.log('Winner:', winner);
    console.log('Mode:', gameMode, aiDifficulty ? `(${aiDifficulty})` : '');
    console.log('Total moves:', moveHistory.length);
    console.log('Avg think time:', avgThinkTime, 's');
    console.log('Move speeds:', moveSpeed.map(s => s.toFixed(1) + 's'));
    console.log('Captures chosen (multiple options):', capturesChosen);
    console.log('Sacrifices (risky moves):', sacrifices);
    console.table(metrics);
    console.groupEnd();
  },
}));

// ──── Helper: clean game state ────
function getInitialGameState() {
  return {
    board: createInitialBoard(),
    currentPlayer: 'white',
    selectedPiece: null,
    validMoves: [],
    winner: null,
    moveHistory: [],
    animatingMove: null,
    capturedWhite: 0,
    capturedBlack: 0,
    capturedWhitePieces: [],
    capturedBlackPieces: [],
    lastMove: null,
    aiThinking: false,
    moveTimestamps: [],
    moveSpeed: [],
    capturesChosen: 0,
    sacrifices: 0,
    lastMoveStartTime: Date.now(),
    removingPieces: [],
  };
}

export default useGameStore;
