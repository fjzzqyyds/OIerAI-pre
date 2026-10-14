const fs = require('fs');
const assert = require('assert');
const { JSDOM } = require('./web/node_modules/jsdom');

const dom = new JSDOM(fs.readFileSync(__dirname + '/web/index.html', 'utf8'), {
  runScripts: 'outside-only',
  url: 'https://oierai.local/'
});
const w = dom.window;
w.chrome = { webview: { postMessage() {}, addEventListener() {} } };
w.hljs = require('./web/node_modules/highlight.js');
w.renderMathInElement = () => {};
for (const path of ['vendor/marked.umd.js', 'vendor/purify.min.js', 'app.js']) {
  w.eval(fs.readFileSync(__dirname + '/web/' + path, 'utf8'));
}

const statement = w.document.getElementById('statement');
statement.value = '# 标题\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n<script>bad()</script>';
statement.dispatchEvent(new w.Event('input'));
w.document.getElementById('statementPreview').click();
const rendered = w.document.getElementById('statementRendered');
assert(rendered.querySelector('h1'));
assert(rendered.querySelector('table'));
assert(!rendered.querySelector('script'));
assert(statement.hidden && !rendered.hidden);
w.document.getElementById('statementEdit').click();
assert(!statement.hidden && rendered.hidden);

const code = w.document.getElementById('code');
code.value = '#include <iostream>\nint main() { return 0; }';
code.dispatchEvent(new w.Event('input'));
let highlighted = w.document.querySelector('#codeHighlight code');
assert(highlighted.classList.contains('language-cpp'));
assert(highlighted.querySelector('.hljs-meta'));
w.document.getElementById('language').value = 'Python 3';
code.value = 'def solve():\n    return True';
w.document.getElementById('language').dispatchEvent(new w.Event('change'));
highlighted = w.document.querySelector('#codeHighlight code');
assert(highlighted.classList.contains('language-python'));
assert(highlighted.querySelector('.hljs-keyword'));

const css = fs.readFileSync(__dirname + '/web/responsive-editors.css', 'utf8');
const statementCard = w.document.querySelector('.statement-card');
const codeCard = w.document.querySelector('.code-card');
statementCard.querySelector('.expand-editor').click();
assert(statementCard.classList.contains('expanded'));
assert(w.document.body.classList.contains('editor-expanded'));
assert(statement.value.startsWith('# 标题'));
w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' }));
assert(!statementCard.classList.contains('expanded'));
assert(!w.document.body.classList.contains('editor-expanded'));
codeCard.querySelector('.expand-editor').click();
assert(codeCard.classList.contains('expanded'));
assert(code.value.includes('def solve'));
codeCard.querySelector('.expand-editor').click();
assert(!codeCard.classList.contains('expanded'));
assert(css.includes('position:absolute;inset:0;width:100%;height:100%;min-height:0'));
assert(css.includes('@media(max-width:1100px)'));
assert(css.includes('grid-template-columns:minmax(0,1fr)'));
console.log('PASS: statement Markdown preview, sanitization, language-aware code highlighting, responsive breakpoint');
dom.window.close();
