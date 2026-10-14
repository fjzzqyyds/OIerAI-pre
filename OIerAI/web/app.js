const $=id=>document.getElementById(id);let config={},body='',thought='',running=false,pending=false;const bridge=window.chrome?.webview;
function send(action,payload={}){if(bridge)bridge.postMessage({action,payload});else if(action==='analyze')toast('浏览器预览：请运行桌面程序连接 AI');else if(action==='save'){config=payload;$('settings').close();toast('预览设置已保存');}}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3500);}
const languageMap={'C++17':'cpp','C++20':'cpp','C':'c','Python 3':'python','Java':'java','Rust':'rust','Go':'go','其他':'plaintext'};
function renderMarkdown(target,source){target.innerHTML=DOMPurify.sanitize(marked.parse(source||'',{gfm:true,breaks:false}));target.querySelectorAll('pre code').forEach(el=>{const language=[...el.classList].find(c=>c.startsWith('language-'))?.slice(9)||'text';el.parentElement.dataset.language=language;hljs.highlightElement(el);});renderMathInElement(target,{delimiters:[{left:'$$',right:'$$',display:true},{left:'\\[',right:'\\]',display:true},{left:'$',right:'$',display:false},{left:'\\(',right:'\\)',display:false}],throwOnError:false,ignoredTags:['script','noscript','style','textarea','pre','code']});}
function updateCodeHighlight(){const target=$('codeHighlight').firstElementChild;const source=$('code').value||' ';target.className='language-'+languageMap[$('language').value];target.textContent=source.endsWith('\n')?source+' ':source;delete target.dataset.highlighted;hljs.highlightElement(target);syncCodeScroll();}
function syncCodeScroll(){$('codeHighlight').scrollTop=$('code').scrollTop;$('codeHighlight').scrollLeft=$('code').scrollLeft;}
function setStatementMode(preview){$('statement').hidden=preview;$('statementRendered').hidden=!preview;$('statementEdit').classList.toggle('active',!preview);$('statementPreview').classList.toggle('active',preview);if(preview)renderMarkdown($('statementRendered'),$('statement').value||'*还没有题目内容*');}
let expandedEditor=null;
function pasteText(target,text){if(target==='statement')setStatementMode(false);const input=$(target);input.setRangeText(text,input.selectionStart,input.selectionEnd,'end');input.dispatchEvent(new Event('input'));input.focus();}
for(const target of ['statement','code']){const button=document.createElement('button');button.type='button';button.className='quiet paste-editor';button.textContent='粘贴';button.onclick=()=>{if(bridge)send('paste',{target});else navigator.clipboard.readText().then(text=>pasteText(target,text)).catch(()=>toast('请点击输入框并按 Ctrl+V'));};$(target).closest('.input-card').querySelector('.section-label').append(button);$(target).addEventListener('keydown',e=>{if(bridge&&(e.ctrlKey||e.metaKey)&&!e.shiftKey&&e.key.toLowerCase()==='v'){e.preventDefault();send('paste',{target});}});}
bridge?.addEventListener('message',e=>{if(e.data.type==='paste')pasteText(e.data.value.target,e.data.value.text);});
function expandEditor(card,button){const close=expandedEditor?.card===card;if(expandedEditor){expandedEditor.card.classList.remove('expanded');expandedEditor.button.textContent='⛶ 放大';expandedEditor.button.setAttribute('aria-expanded','false');}expandedEditor=close?null:{card,button};document.body.classList.toggle('editor-expanded',!close);if(!close){card.classList.add('expanded');button.textContent='↙ 返回';button.setAttribute('aria-expanded','true');}syncCodeScroll();button.focus();}
for(const selector of ['.statement-card','.code-card']){const card=document.querySelector(selector);const button=document.createElement('button');button.type='button';button.className='quiet expand-editor';button.textContent='⛶ 放大';button.setAttribute('aria-expanded','false');button.setAttribute('aria-label',selector==='.statement-card'?'放大题目上下文':'放大提交代码');button.onclick=()=>expandEditor(card,button);card.querySelector('.section-label').append(button);}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&expandedEditor){e.preventDefault();expandEditor(expandedEditor.card,expandedEditor.button);}});
function render(){pending=false;$('empty').hidden=true;$('empty').style.display='none';$('report').hidden=false;renderMarkdown($('report'),body);$('reasoningPanel').hidden=!thought;$('reasoning').textContent=thought;}
function schedule(){if(!pending){pending=true;setTimeout(render,100);}}
function setBusy(value){running=value;document.body.classList.toggle('busy',value);$('analyze').disabled=value;$('stop').disabled=!value;$('preview').disabled=value;$('previewEmpty').disabled=value;$('copy').disabled=value;$('export').disabled=value;}
function formConfig(){const f=$('settingsForm');let c={...config};for(const el of f.elements){if(!el.name)continue;c[el.name]=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value;}return c;}
$('settingsBtn').onclick=()=>{for(const el of $('settingsForm').elements){if(!el.name)continue;if(el.type==='checkbox')el.checked=!!config[el.name];else el.value=config[el.name]??'';}$('settings').showModal();};$('closeSettings').onclick=()=>$('settings').close();$('settingsForm').onsubmit=e=>{e.preventDefault();send('save',formConfig());};$('test').onclick=()=>{$('testResult').textContent='正在测试…';send('test',formConfig());};
$('analyze').onclick=()=>{if(!$('statement').value.trim()||!$('code').value.trim()){toast('请填写题目和完整代码');return;}send('analyze',Object.fromEntries(['title','statement','code','language','status','notes'].map(id=>[id,$(id).value])));};$('stop').onclick=()=>send('stop');$('copy').onclick=()=>send('copy');$('export').onclick=()=>send('export');
for(const id of ['statement','code'])$(id).addEventListener('input',()=>$(id+'Count').textContent=$(id).value.length+' 字');$('code').addEventListener('input',updateCodeHighlight);$('code').addEventListener('scroll',syncCodeScroll);$('language').addEventListener('change',updateCodeHighlight);$('statementEdit').onclick=()=>setStatementMode(false);$('statementPreview').onclick=()=>setStatementMode(true);$('code').addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const t=e.target;const start=t.selectionStart;t.setRangeText('    ',start,t.selectionEnd,'end');t.dispatchEvent(new Event('input'));}});
$('example').onclick=()=>{$('title').value='求和 · 1 + 2 + … + n';$('statement').value='给定正整数 n，计算 1 + 2 + … + n。\n\n输入：一个整数 n。\n输出：总和。\n\n样例输入：5\n样例输出：15\n\n数据范围：1 ≤ n ≤ 10^9。';$('code').value='#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long sum = 0;\n    for (int i = 1; i < n; i++) {\n        sum += i;\n    }\n    cout << sum << endl;\n    return 0;\n}';for(const id of ['statement','code'])$(id).dispatchEvent(new Event('input'));toast('示例已载入 · 可以开始分析');};
const preview=`> **排版预览** · 以下是内置示例报告，不是实时 AI 分析结果。

## 一句话结论
循环条件 \`i < n\` 漏掉了最后一项；即使改对边界，逐项累加也会在大数据下超时。

## 题意理解
给定 $n$，求前 $n$ 个正整数的和。数据上限是 $10^9$，应使用 **常数时间算法** 和 64 位整数。

## 逐条排查
| 问题 | 触发条件 | 影响 |
| --- | --- | --- |
| 最后一项未被累加 | 所有正整数输入 | WA |
| 逐项求和太慢 | $n$ 接近 $10^9$ | TLE |
| 中间乘法溢出 | 使用 int 计算乘积 | WA |

## 修改建议
用等差数列公式替代循环，并从输入开始使用 64 位整数。

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    cout << n * (n + 1) / 2 << '\\n';
    return 0;
}
\`\`\`

## 边界与复杂度
- 时间复杂度：$O(1)$；空间复杂度：$O(1)$。
- 必须补测 **n = 1**、样例和最大输入。

$$S_n = \\frac{n(n+1)}{2}$$

## 自测数据
\`\`\`text
输入：1
期望输出：1

输入：1000000000
期望输出：500000000500000000
\`\`\`
`;
function showPreview(){body=preview;thought='';render();$('statusText').textContent='内置示例 · 排版预览';send('preview',{markdown:preview});}$('preview').onclick=showPreview;$('previewEmpty').onclick=showPreview;
bridge?.addEventListener('message',e=>{const {type,value}=e.data;switch(type){case 'config':config=value;$('modelBadge').textContent=value.model||'尚未配置';break;case 'saved':config=formConfig();$('modelBadge').textContent=config.model;$('settings').close();toast(value);break;case 'tested':$('testResult').textContent=value;break;case 'started':body='';thought='';setBusy(true);$('statusText').textContent='正在分析 · '+value;render();break;case 'delta':body+=value.content;thought+=value.reasoning;schedule();break;case 'done':setBusy(false);$('statusText').textContent=value;render();break;case 'error':setBusy(false);$('statusText').textContent='分析失败：'+value;toast(value);break;case 'toast':toast(value);break;}});updateCodeHighlight();send('ready');
