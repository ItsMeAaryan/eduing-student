const fs = require('fs');
const content = fs.readFileSync('.next/static/chunks/app/layout.js', 'utf8');
const lines = content.split('\n');
const line28 = lines[27]; // 0-indexed

// The line is: eval(__webpack_require__.ts("..."));
// Let's extract the string inside __webpack_require__.ts( ... )
const start = line28.indexOf('__webpack_require__.ts("');
if (start === -1) {
  console.log('Could not find start');
  process.exit(1);
}
// We want to parse the string literal. Since it might have escapes, let's use Acorn or just Function
// Wait, we can mock `eval` and `__webpack_require__.ts` to capture the string.
const fakeEnv = {
  eval: function(code) {
    try {
      // Create a function instead of evaluating directly to catch syntax errors
      new Function('__webpack_exports__', '__webpack_require__', code);
      console.log('Parse successful!');
    } catch (e) {
      console.log('Syntax error caught in eval code:', e.message);
      // We can try to pinpoint where the error is.
      // E.g. find out the snippet near the error.
      // But Function doesn't give us line numbers in the string easily... wait, it does!
      console.log(e.stack);
    }
  },
  __webpack_require__: {
    ts: function(str) { return str; }
  },
  __webpack_exports__: {}
};

try {
  // Execute the line 28 with our fakeEnv
  const script = `(function(eval, __webpack_require__, __webpack_exports__) { ${line28} })`;
  const fn = eval(script);
  fn(fakeEnv.eval, fakeEnv.__webpack_require__, fakeEnv.__webpack_exports__);
} catch (e) {
  console.log('Error executing line 28:', e.message);
}
