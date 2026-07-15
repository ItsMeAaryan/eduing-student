const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
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

const dirs = ['app', 'components', 'lib', 'e2e'];
let files = [];
dirs.forEach(d => { files = files.concat(walk(d)); });

let replaced = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('—')) {
    const newContent = content.replace(/—/g, '-');
    fs.writeFileSync(file, newContent, 'utf8');
    replaced++;
    console.log('Replaced in ' + file);
  }
});
console.log(`Replaced in ${replaced} files.`);
