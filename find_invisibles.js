const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = [...walk('app'), ...walk('components')];
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  for (let i = 0; i < content.length; i++) {
    const code = content.charCodeAt(i);
    if (code === 0x2028 || code === 0x2029 || code === 0x200b || code === 0x200c || code === 0x200d || code === 0xfeff) {
      console.log(`Found invisible char in ${file} at index ${i} (code ${code})`);
    }
  }
});
console.log('Done scanning.');
