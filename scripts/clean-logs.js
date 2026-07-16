const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [...walk('app'), ...walk('lib')];
let count = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('console.log(')) {
    const newContent = content.replace(/^[ \t]*console\.log\(.*?\);?[ \t]*\n/gm, '');
    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
      count++;
      console.log(`Cleaned ${file}`);
    }
  }
});

console.log(`Cleaned ${count} files.`);
