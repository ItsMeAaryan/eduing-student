const fs = require('fs');
const content = fs.readFileSync('app/layout.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  for (let j = 0; j < line.length; j++) {
    const code = line.charCodeAt(j);
    if (code > 127 || code < 32 && code !== 9 && code !== 10 && code !== 13) {
      console.log(`Line ${i+1}, Col ${j+1}: ${line[j]} (char code ${code})`);
    }
  }
});
