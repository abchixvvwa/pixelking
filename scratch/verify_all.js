// Quick verify all 30 puzzles
const EMPTY=0,WHITE=1,BLACK=2,WHITE_KING=3,BLACK_KING=4;
const isWhite=p=>p===WHITE||p===WHITE_KING;
const isBlack=p=>p===BLACK||p===BLACK_KING;
const isKing=p=>p===WHITE_KING||p===BLACK_KING;
const inBounds=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
const enemyOf=piece=>{if(isWhite(piece))return p=>isBlack(p);if(isBlack(piece))return p=>isWhite(p);return()=>false;};
function cloneBoard(b){return b.map(r=>[...r]);}
function maybePromote(b,r,c){if(b[r][c]===WHITE&&r===0)b[r][c]=WHITE_KING;if(b[r][c]===BLACK&&r===7)b[r][c]=BLACK_KING;}
function getCaptureSequences(board,r,c,ac=[]){
  const piece=board[r][c];if(piece===EMPTY)return[];
  const isE=enemyOf(piece),dirs=[[-1,-1],[-1,1],[1,-1],[1,1]],seqs=[];
  if(isKing(piece)){for(const[dr,dc]of dirs){let er=r+dr,ec=c+dc;while(inBounds(er,ec)&&board[er][ec]===EMPTY){er+=dr;ec+=dc;}if(!inBounds(er,ec)||!isE(board[er][ec]))continue;if(ac.some(([cr,cc])=>cr===er&&cc===ec))continue;let lr=er+dr,lc=ec+dc;while(inBounds(lr,lc)&&(board[lr][lc]===EMPTY||(lr===r&&lc===c))){if(board[lr][lc]!==EMPTY&&!(lr===r&&lc===c))break;const nc=[...ac,[er,ec]],nb=cloneBoard(board);nb[r][c]=EMPTY;nb[er][ec]=EMPTY;nb[lr][lc]=piece;const f=getCaptureSequences(nb,lr,lc,nc);if(f.length>0)for(const s of f)seqs.push({from:[r,c],to:s.to,captures:[[er,ec],...s.captures],path:[[r,c],[lr,lc],...(s.path||[]).slice(1)]});else seqs.push({from:[r,c],to:[lr,lc],captures:[[er,ec]],path:[[r,c],[lr,lc]]});lr+=dr;lc+=dc;}}}
  else{for(const[dr,dc]of dirs){const er=r+dr,ec=c+dc,lr=r+2*dr,lc=c+2*dc;if(!inBounds(lr,lc)||!isE(board[er][ec]))continue;if(board[lr][lc]!==EMPTY&&!(lr===r&&lc===c))continue;if(ac.some(([cr,cc])=>cr===er&&cc===ec))continue;const nc=[...ac,[er,ec]],wp=(isWhite(piece)&&lr===0)||(isBlack(piece)&&lr===7),pp=wp?(isWhite(piece)?WHITE_KING:BLACK_KING):piece,nb=cloneBoard(board);nb[r][c]=EMPTY;nb[er][ec]=EMPTY;nb[lr][lc]=pp;const f=getCaptureSequences(nb,lr,lc,nc);if(f.length>0)for(const s of f)seqs.push({from:[r,c],to:s.to,captures:[[er,ec],...s.captures],path:[[r,c],[lr,lc],...(s.path||[]).slice(1)]});else seqs.push({from:[r,c],to:[lr,lc],captures:[[er,ec]],path:[[r,c],[lr,lc]]});}}
  return seqs;
}
function getSimpleMoves(board,r,c){const p=board[r][c];if(p===EMPTY)return[];const m=[];if(isKing(p)){for(const[dr,dc]of[[-1,-1],[-1,1],[1,-1],[1,1]]){let nr=r+dr,nc=c+dc;while(inBounds(nr,nc)&&board[nr][nc]===EMPTY){m.push({from:[r,c],to:[nr,nc],captures:[]});nr+=dr;nc+=dc;}}}else{const d=isWhite(p)?-1:1;for(const dc of[-1,1]){const nr=r+d,nc=c+dc;if(inBounds(nr,nc)&&board[nr][nc]===EMPTY)m.push({from:[r,c],to:[nr,nc],captures:[]});}}return m;}
function getValidMoves(board,player){const ip=player==='white'?isWhite:isBlack;let caps=[],sim=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(!ip(board[r][c]))continue;caps.push(...getCaptureSequences(board,r,c));sim.push(...getSimpleMoves(board,r,c));}if(caps.length>0){const mx=Math.max(...caps.map(m=>m.captures.length));return caps.filter(m=>m.captures.length===mx);}return sim;}
function applyMove(board,move){const nb=cloneBoard(board);const[fr,fc]=move.from,[tr,tc]=move.to;nb[tr][tc]=nb[fr][fc];nb[fr][fc]=EMPTY;for(const[cr,cc]of move.captures)nb[cr][cc]=EMPTY;maybePromote(nb,tr,tc);return nb;}
function checkWinner(board,cp){const moves=getValidMoves(board,cp);if(moves.length===0)return cp==='white'?'black':'white';let hw=false,hb=false;for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(isWhite(board[r][c]))hw=true;if(isBlack(board[r][c]))hb=true;}if(!hw)return'black';if(!hb)return'white';return null;}
const cn=(r,c)=>String.fromCharCode(97+c)+(8-r);

// Import puzzles
const fs = require('fs');
const src = fs.readFileSync('src/data/dailyChallenges.js','utf8');
// Extract puzzle data manually
const puzzleRegex = /\{[^}]*id:\s*(\d+)[^}]*title:\s*"([^"]+)"[^}]*board:\s*\[([\s\S]*?)\]\s*,\s*\n\s*parMoves/g;

// Simpler: just eval the array
const cleaned = src.replace(/export function.*$/ms,'').replace(/export default.*$/m,'').replace('const dailyChallenges = ','module.exports = ');
const tmpFile = 'scratch/_tmp_puzzles.js';
fs.writeFileSync(tmpFile, cleaned);
const puzzles = require('./' + tmpFile);
fs.unlinkSync(tmpFile);

console.log(`\n══════ Testing ${puzzles.length} Daily Puzzles ══════\n`);
let pass=0, fail=0;
for (const p of puzzles) {
  let b = cloneBoard(p.board);
  const sol = p.solution;
  let ok = false;
  for (let i=0; i<sol.length; i++) {
    const vm = getValidMoves(b,'white');
    const match = vm.find(m=>m.from[0]===sol[i].from[0]&&m.from[1]===sol[i].from[1]&&m.to[0]===sol[i].to[0]&&m.to[1]===sol[i].to[1]);
    if (!match) {
      console.log(`❌ #${p.id} "${p.title}": Move ${cn(...sol[i].from)}→${cn(...sol[i].to)} INVALID`);
      console.log(`   Valid:`, vm.map(m=>`${cn(...m.from)}→${cn(...m.to)}`).join(', '));
      fail++; ok=false; break;
    }
    b = applyMove(b, match);
    const w = checkWinner(b,'black');
    if (w==='white') { console.log(`✅ #${p.id} "${p.title}": ${cn(...match.from)}→${cn(...match.to)} (x${match.captures.length})`); ok=true; pass++; break; }
    if (i<sol.length-1) {
      const ai=getValidMoves(b,'black');
      if(ai.length===0){console.log(`✅ #${p.id} "${p.title}": Black stuck`);ok=true;pass++;break;}
      b=applyMove(b,ai[0]);
    }
  }
  if(!ok&&fail===0){console.log(`⚠️  #${p.id} "${p.title}": No immediate win`);fail++;}
}
console.log(`\n══════ ${pass}/${puzzles.length} passed, ${fail} failed ══════\n`);
