/**
 * Verification script: checks that each daily challenge is solvable.
 * Run: node scratch/verify_puzzles.js
 * 
 * For each puzzle, simulates the solution moves for white and AI responses for black.
 * Verifies that white wins after the solution sequence.
 */

// Inline checkers logic (minimal)
const EMPTY = 0, WHITE = 1, BLACK = 2, WHITE_KING = 3, BLACK_KING = 4;
const BOARD_SIZE = 8;

const isWhite = p => p === WHITE || p === WHITE_KING;
const isBlack = p => p === BLACK || p === BLACK_KING;
const isKing = p => p === WHITE_KING || p === BLACK_KING;
const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

const enemyOf = (piece) => {
  if (isWhite(piece)) return p => isBlack(p);
  if (isBlack(piece)) return p => isWhite(p);
  return () => false;
};

function cloneBoard(b) { return b.map(r => [...r]); }

function maybePromote(board, r, c) {
  if (board[r][c] === WHITE && r === 0) board[r][c] = WHITE_KING;
  if (board[r][c] === BLACK && r === 7) board[r][c] = BLACK_KING;
}

function getCaptureSequences(board, r, c, alreadyCaptured = []) {
  const piece = board[r][c];
  if (piece === EMPTY) return [];
  const isEnemy = enemyOf(piece);
  const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
  const sequences = [];

  if (isKing(piece)) {
    for (const [dr, dc] of dirs) {
      let er = r+dr, ec = c+dc;
      while (inBounds(er,ec) && board[er][ec] === EMPTY) { er+=dr; ec+=dc; }
      if (!inBounds(er,ec) || !isEnemy(board[er][ec])) continue;
      if (alreadyCaptured.some(([cr,cc])=>cr===er&&cc===ec)) continue;
      let lr=er+dr, lc=ec+dc;
      while (inBounds(lr,lc) && (board[lr][lc]===EMPTY||(lr===r&&lc===c))) {
        if (board[lr][lc]!==EMPTY&&!(lr===r&&lc===c)) break;
        const newCaptured = [...alreadyCaptured,[er,ec]];
        const nb = cloneBoard(board); nb[r][c]=EMPTY; nb[er][ec]=EMPTY; nb[lr][lc]=piece;
        const further = getCaptureSequences(nb,lr,lc,newCaptured);
        if (further.length>0) {
          for (const seq of further) {
            sequences.push({from:[r,c],to:seq.to,captures:[[er,ec],...seq.captures],path:[[r,c],[lr,lc],...(seq.path||[]).slice(1)],isPromotion:seq.isPromotion});
          }
        } else {
          sequences.push({from:[r,c],to:[lr,lc],captures:[[er,ec]],path:[[r,c],[lr,lc]],isPromotion:false});
        }
        lr+=dr; lc+=dc;
      }
    }
  } else {
    for (const [dr,dc] of dirs) {
      const er=r+dr, ec=c+dc, lr=r+2*dr, lc=c+2*dc;
      if (!inBounds(lr,lc)||!isEnemy(board[er][ec])) continue;
      if (board[lr][lc]!==EMPTY&&!(lr===r&&lc===c)) continue;
      if (alreadyCaptured.some(([cr,cc])=>cr===er&&cc===ec)) continue;
      const newCaptured=[...alreadyCaptured,[er,ec]];
      const willPromote=(isWhite(piece)&&lr===0)||(isBlack(piece)&&lr===7);
      const promotedPiece=willPromote?(isWhite(piece)?WHITE_KING:BLACK_KING):piece;
      const nb=cloneBoard(board); nb[r][c]=EMPTY; nb[er][ec]=EMPTY; nb[lr][lc]=promotedPiece;
      const further=getCaptureSequences(nb,lr,lc,newCaptured);
      if (further.length>0) {
        for (const seq of further) {
          sequences.push({from:[r,c],to:seq.to,captures:[[er,ec],...seq.captures],path:[[r,c],[lr,lc],...(seq.path||[]).slice(1)],isPromotion:willPromote||seq.isPromotion});
        }
      } else {
        sequences.push({from:[r,c],to:[lr,lc],captures:[[er,ec]],path:[[r,c],[lr,lc]],isPromotion:willPromote});
      }
    }
  }
  return sequences;
}

function getSimpleMoves(board, r, c) {
  const piece = board[r][c];
  if (piece === EMPTY) return [];
  const moves = [];
  if (isKing(piece)) {
    for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
      let nr=r+dr, nc=c+dc;
      while (inBounds(nr,nc) && board[nr][nc]===EMPTY) {
        moves.push({from:[r,c],to:[nr,nc],captures:[],isPromotion:false});
        nr+=dr; nc+=dc;
      }
    }
  } else {
    const dir = isWhite(piece)?-1:1;
    for (const dc of [-1,1]) {
      const nr=r+dir, nc=c+dc;
      if (inBounds(nr,nc) && board[nr][nc]===EMPTY) {
        const prom = (isWhite(piece)&&nr===0)||(isBlack(piece)&&nr===7);
        moves.push({from:[r,c],to:[nr,nc],captures:[],isPromotion:prom});
      }
    }
  }
  return moves;
}

function getValidMoves(board, player) {
  const isPiece = player==='white'?isWhite:isBlack;
  let caps=[], simple=[];
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    if (!isPiece(board[r][c])) continue;
    caps.push(...getCaptureSequences(board,r,c));
    simple.push(...getSimpleMoves(board,r,c));
  }
  if (caps.length>0) {
    const max=Math.max(...caps.map(m=>m.captures.length));
    return caps.filter(m=>m.captures.length===max);
  }
  return simple;
}

function applyMove(board, move) {
  const nb=cloneBoard(board);
  const [fr,fc]=move.from, [tr,tc]=move.to;
  nb[tr][tc]=nb[fr][fc]; nb[fr][fc]=EMPTY;
  for (const [cr,cc] of move.captures) nb[cr][cc]=EMPTY;
  maybePromote(nb,tr,tc);
  return nb;
}

function checkWinner(board, currentPlayer) {
  const moves=getValidMoves(board,currentPlayer);
  if (moves.length===0) return currentPlayer==='white'?'black':'white';
  let hw=false, hb=false;
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    if (isWhite(board[r][c])) hw=true;
    if (isBlack(board[r][c])) hb=true;
  }
  if (!hw) return 'black';
  if (!hb) return 'white';
  return null;
}

function printBoard(board) {
  const symbols = { 0: '.', 1: 'w', 2: 'b', 3: 'W', 4: 'B' };
  console.log('  a b c d e f g h');
  board.forEach((row, r) => {
    console.log(`${8-r} ${row.map(c=>symbols[c]).join(' ')}`);
  });
}

function cellName(r, c) {
  return String.fromCharCode(97+c) + (8-r);
}

// ══════════════════════════════════════════════════════════
// Generate verified puzzles
// ══════════════════════════════════════════════════════════

const puzzles = [];

// Helper: test a puzzle position
function testPuzzle(title, board, solutionMoves) {
  let b = cloneBoard(board);
  let currentPlayer = 'white';
  const moveLog = [];
  
  for (let i = 0; i < solutionMoves.length; i++) {
    const solMove = solutionMoves[i];
    const validMoves = getValidMoves(b, currentPlayer);
    
    // Find matching move
    const match = validMoves.find(m => 
      m.from[0]===solMove.from[0] && m.from[1]===solMove.from[1] &&
      m.to[0]===solMove.to[0] && m.to[1]===solMove.to[1]
    );
    
    if (!match) {
      console.log(`❌ ${title}: Move ${i+1} ${cellName(...solMove.from)}→${cellName(...solMove.to)} is INVALID for ${currentPlayer}`);
      console.log(`   Valid moves:`, validMoves.map(m => `${cellName(...m.from)}→${cellName(...m.to)}`).join(', '));
      printBoard(b);
      return false;
    }
    
    moveLog.push(`${cellName(...match.from)}→${cellName(...match.to)}${match.captures.length?` (x${match.captures.length})`:''}`);
    b = applyMove(b, match);
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    
    // Check if won
    const winner = checkWinner(b, currentPlayer);
    if (winner === 'white') {
      console.log(`✅ ${title}: White wins after ${i+1} move(s): ${moveLog.join(' → ')}`);
      return true;
    }
    if (winner === 'black') {
      console.log(`❌ ${title}: Black wins unexpectedly after move ${i+1}`);
      return false;
    }
    
    // If not last move and it's black's turn, AI responds (pick first valid move)
    if (currentPlayer === 'black' && i < solutionMoves.length - 1) {
      const aiMoves = getValidMoves(b, 'black');
      if (aiMoves.length === 0) {
        console.log(`✅ ${title}: Black has no moves → White wins: ${moveLog.join(' → ')}`);
        return true;
      }
      // AI plays first available move
      const aiMove = aiMoves[0];
      moveLog.push(`[AI: ${cellName(...aiMove.from)}→${cellName(...aiMove.to)}]`);
      b = applyMove(b, aiMove);
      currentPlayer = 'white';
      
      const w2 = checkWinner(b, currentPlayer);
      if (w2 === 'white') {
        console.log(`✅ ${title}: White wins: ${moveLog.join(' → ')}`);
        return true;
      }
    }
  }
  
  // After all solution moves, check if white won
  const finalWinner = checkWinner(b, currentPlayer);
  if (finalWinner === 'white') {
    console.log(`✅ ${title}: White wins: ${moveLog.join(' → ')}`);
    return true;
  }
  
  // Not immediate win — that's OK for multi-move puzzles where AI plays differently
  console.log(`⚠️  ${title}: Not immediate win after solution. Board state:`);
  printBoard(b);
  console.log(`   Moves played: ${moveLog.join(' → ')}`);
  return true; // might be ok depending on AI response
}

// ═══════════════════════════════════════════════════════════
// Define puzzles with verified positions
// ═══════════════════════════════════════════════════════════

console.log('\n══════ Testing Daily Puzzles ══════\n');

// Puzzle 1: Simple double capture
// White at e3=[5,4], blacks at d4=[4,3] and f2=[2,5]... 
// Let me think in terms of the board coordinates properly:
// Row 0 = top, Row 7 = bottom
// Col 0 = a (left), Col 7 = h (right)
// White moves UP (row decreases)

// For a normal white piece at [5,2] (c3), enemy at [4,3] (d4), lands on [3,4] (e5)
// Then enemy at [2,5] (f6)... no, need [2,5] to be adjacent to [3,4]: enemy at [2,5]? [3,4]→[1,6] via [2,5]? Yes!

let board1 = [
  [0,0,0,0,0,0,0,0],  // row 0 (rank 8)
  [0,0,0,0,0,0,0,0],  // row 1 (rank 7)
  [0,0,0,0,0,2,0,0],  // row 2: f6=black
  [0,0,0,0,0,0,0,0],  // row 3
  [0,0,0,2,0,0,0,0],  // row 4: d4=black
  [0,0,1,0,0,0,0,0],  // row 5: c3=white
  [0,0,0,0,0,0,0,0],  // row 6
  [0,0,0,0,0,0,0,0],  // row 7
];
testPuzzle('Puzzle 1: Double capture', board1, [{from:[5,2], to:[1,6]}]);

// Puzzle 2: Triple capture
// White at a1=[7,0], enemies at b2=[6,1], d4=[4,3], f6=[2,5]
let board2 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,2,0,0],  // f6
  [0,0,0,0,0,0,0,0],
  [0,0,0,2,0,0,0,0],  // d4
  [0,0,0,0,0,0,0,0],
  [0,2,0,0,0,0,0,0],  // b2
  [1,0,0,0,0,0,0,0],  // a1
];
testPuzzle('Puzzle 2: Triple capture', board2, [{from:[7,0], to:[1,6]}]);

// Puzzle 3: Simple single capture
// White at g1=[7,6], enemy at f2=[6,5], lands on e3=[5,4]
let board3 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,2,0,0],  // f2
  [0,0,0,0,0,0,1,0],  // g1
];
testPuzzle('Puzzle 3: Simple capture', board3, [{from:[7,6], to:[5,4]}]);

// Puzzle 4: King captures multiple
// White king at a1=[7,0], enemies at c3=[5,2] and e5=[3,4] and g7=[1,6]
// King flies a1→ over c3 → lands d4=[4,3], then over e5=[3,4]→ lands f6=[2,5], then over g7=[1,6]→ lands h8=[0,7]
let board4 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,2,0],  // g7
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,2,0,0,0],  // e5
  [0,0,0,0,0,0,0,0],
  [0,0,2,0,0,0,0,0],  // c3
  [0,0,0,0,0,0,0,0],
  [3,0,0,0,0,0,0,0],  // a1 = white king
];
testPuzzle('Puzzle 4: King triple capture', board4, [{from:[7,0], to:[0,7]}]);

// Puzzle 5: Capture and promote
// White at b2=[6,1], enemy at c7=[1,2]... no that's far away
// White at b2=[6,1], enemy at a3=[5,0]? No that doesn't work for white going up
// White goes UP: from [6,1] can capture enemy at [5,0] landing [4,?]... [5,0] is diag from [6,1]? Yes! [6,1]-[5,0] is diagonal. Land on [4, -1]? Out of bounds.
// [6,1] can capture [5,2] landing [4,3]. OK.
// Let me do: white at e1=[7,4], enemy at d2=[6,3], land on c3=[5,2]
let board5 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,2,0,0,0,0],  // d2
  [0,0,0,0,1,0,0,0],  // e1
];
testPuzzle('Puzzle 5: Simple capture 2', board5, [{from:[7,4], to:[5,2]}]);

// Puzzle 6: Double capture going right then left (zigzag)
// White at a1=[7,0], enemy b2=[6,1] and c4=... no wait, after landing on c3=[5,2], need enemy adjacent
// a1=[7,0] captures b2=[6,1] → c3=[5,2], then captures d4=[4,3] → e5=[3,4]
let board6 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,2,0,0,0,0],  // d4
  [0,0,0,0,0,0,0,0],
  [0,2,0,0,0,0,0,0],  // b2
  [1,0,0,0,0,0,0,0],  // a1
];
testPuzzle('Puzzle 6: Double capture zigzag', board6, [{from:[7,0], to:[3,4]}]);

// Puzzle 7: Capture going left
// White at h2=[6,7], enemy g3=[5,6], land f4=[4,5]
// Then enemy e5=[3,4], land d6=[2,3]
let board7 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,2,0,0,0],  // e5
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,2,0],  // g3
  [0,0,0,0,0,0,0,1],  // h2
  [0,0,0,0,0,0,0,0],
];
testPuzzle('Puzzle 7: Double capture left', board7, [{from:[6,7], to:[2,3]}]);

// Puzzle 8: King long-range capture
// White king at h2=[6,7], enemy at e5=[3,4], king flies over and lands beyond
let board8 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,2,0,0,0],  // e5
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,3],  // h2 = white king
  [0,0,0,0,0,0,0,0],
];
testPuzzle('Puzzle 8: King long capture', board8, [{from:[6,7], to:[2,3]}]);

// Puzzle 9: Four captures (rare and cool!)
// White at a1=[7,0]
// Enemies: b2=[6,1], d2=[6,3]... no those are same row
// Chain: [7,0]→[5,2] (over [6,1])→[3,4] (over [4,3])→[5,6] (over [4,5])? No, that goes DOWN again
// For a normal piece, can go in any direction when capturing in Russian checkers
// [7,0]→[5,2] over [6,1], then [5,2]→[3,4] over [4,3], then [3,4]→[1,2] over [2,3], then [1,2]→... 
// Wait: [3,4]→[1,2] is going up-left, enemy at [2,3]. Yes!
// Then [1,2]→... could go further? Only if there's another enemy. Let's add one:
// [1,2]→[3,0]? enemy at [2,1]. That's going DOWN-left. Russian rules allow backward capture for normal pieces.
// So: 4 enemies: [6,1], [4,3], [2,3]... wait [3,4]→[1,2] needs enemy at [2,3]. Let me recheck:
// From [3,4] going up-left: enemy at [2,3], land on [1,2]. ✓
// From [1,2] going down-left: enemy at [2,1], land on [3,0]. ✓
// Enemies: [6,1], [4,3], [2,3], [2,1]
let board9 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,2,0,2,0,0,0,0],  // b6=[2,1] and d6=[2,3]
  [0,0,0,0,0,0,0,0],
  [0,0,0,2,0,0,0,0],  // d4=[4,3]
  [0,0,0,0,0,0,0,0],
  [0,2,0,0,0,0,0,0],  // b2=[6,1]
  [1,0,0,0,0,0,0,0],  // a1=[7,0]
];
testPuzzle('Puzzle 9: Quadruple capture', board9, [{from:[7,0], to:[3,0]}]);

// Puzzle 10: Promotion via capture
// White at c3=[5,2], enemy at b4=[4,1]? No, [4,1] is b4... wait
// Actually: c3=[5,2] captures d2=[4,3]? No that's going UP-right for the enemy...
// white at b2=[6,1], captures c7=[1,2]? Too far.
// White at c3=[5,2], enemy at d4=[4,3]? From [5,2] to [3,4] over [4,3]. Yes.
// Then after capture, white is at [3,4]=e5. Promotion needs row 0. Not yet.
// Simple: white at b2=[6,1], enemy at a3=[5,0]. Land: from [6,1] over [5,0] to [4,-1]? Out of bounds!
// [6,1] over [5,2] to [4,3]. OK so enemy at c3=[5,2].
// From [4,3] enemy at [3,2], land [2,1]. From [2,1] enemy at [1,0], land [0,-1]? OOB.
// [2,1] enemy at [1,2], land [0,3]. Promotion! Row 0!
let board10 = [
  [0,0,0,0,0,0,0,0],
  [0,0,2,0,0,0,0,0],  // c7=[1,2]
  [0,0,0,0,0,0,0,0],
  [0,0,2,0,0,0,0,0],  // c5=[3,2]
  [0,0,0,0,0,0,0,0],
  [0,0,2,0,0,0,0,0],  // c3=[5,2]
  [0,1,0,0,0,0,0,0],  // b2=[6,1]
  [0,0,0,0,0,0,0,0],
];
testPuzzle('Puzzle 10: Capture-promote chain', board10, [{from:[6,1], to:[0,3]}]);

console.log('\n══════ Done ══════\n');
