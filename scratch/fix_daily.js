const fs = require('fs');

const path = './src/data/dailyChallenges.js';
let content = fs.readFileSync(path, 'utf8');

// The file exports SKINS ... wait, no. It exports an array of challenges.
// Let's parse it using eval since it's just a JS file.
// Or simple regex/replacement? No, there are 30 objects.
// Let's just require it, modify, and rewrite it. Or do string manipulation.

const challengesMatch = content.match(/const dailyChallenges = (\[[\s\S]*?\]);\n\nexport function/);
if (!challengesMatch) {
  console.log("Could not find dailyChallenges array");
  process.exit(1);
}

let challengesStr = challengesMatch[1];
// Simple function to parse the array of arrays and shift elements
let challenges = eval(challengesStr);

let modified = false;
for (let ch of challenges) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (ch.board[r][c] !== 0) {
        if ((r + c) % 2 === 0) {
          // piece is on light square
          let val = ch.board[r][c];
          ch.board[r][c] = 0;
          // move to adjacent dark square (prefer +1, else -1)
          if (c + 1 < 8) {
             ch.board[r][c + 1] = val;
          } else if (c - 1 >= 0) {
             ch.board[r][c - 1] = val;
          }
          modified = true;
        }
      }
    }
  }
}

if (modified) {
  // Convert back to string
  let newChallengesStr = JSON.stringify(challenges, null, 2);
  // Need to fix formatting to remove quotes around keys to keep it clean, but JSON.stringify is fine.
  // Actually, let's keep it clean.
  newChallengesStr = newChallengesStr.replace(/"([^"]+)":/g, '$1:');
  
  let newContent = content.replace(challengesMatch[1], newChallengesStr);
  fs.writeFileSync(path, newContent, 'utf8');
  console.log("Successfully fixed pieces on light squares.");
} else {
  console.log("No pieces were on light squares.");
}
