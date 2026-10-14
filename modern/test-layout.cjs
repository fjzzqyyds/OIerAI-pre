const { chromium } = require('./web/node_modules/playwright-core');
const assert = require('assert');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-sandbox','--disable-gpu'] });
  const page = await browser.newPage();
  for (const size of [{width:944,height:603},{width:1280,height:720},{width:1600,height:900}]) {
    await page.setViewportSize(size);
    await page.goto('file:///D:/LuoguAI/modern/web/index.html');
    await page.waitForSelector('.expand-editor');
    await page.evaluate(() => {
      pasteText('statement','# 粘贴题目\n\n中文内容');
      pasteText('code','int main() { return 0; }');
    });
    assert((await page.locator('#statement').inputValue()).includes('中文内容'));
    assert((await page.locator('#code').inputValue()).includes('int main'));
    assert(await page.locator('#codeHighlight .hljs-type').count()>0);
    const bounds = await page.evaluate(() => {
      const rect = s => {const r=document.querySelector(s).getBoundingClientRect(); return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};};
      return {statement:rect('.statement-card'),editor:rect('.statement-editor'),code:rect('.code-card'),report:rect('.result'),width:document.documentElement.scrollWidth,viewport:innerWidth};
    });
    assert(bounds.editor.bottom<=bounds.statement.bottom, 'statement editor escaped card');
    assert(bounds.editor.height>50, 'statement editor collapsed');
    assert(bounds.width<=bounds.viewport, 'horizontal overflow');
    if(size.width<=1100) assert(bounds.report.top>=bounds.code.bottom,'report overlaps inputs');
    await page.locator('.statement-card .expand-editor').click();
    await page.evaluate(()=>{setStatementMode(true);pasteText('statement','追加内容');});
    assert(await page.locator('#statement').isVisible());
    assert(await page.locator('.statement-card').evaluate(el=>el.getBoundingClientRect().height>innerHeight-40));
    await page.keyboard.press('Escape');
    await page.locator('.code-card .expand-editor').click();
    assert(await page.locator('.code-card').evaluate(el=>el.getBoundingClientRect().height>innerHeight-40));
    await page.keyboard.press('Escape');
    await page.screenshot({path:`D:/LuoguAI/modern/layout-${size.width}.png`,fullPage:true});
    console.log('PASS real browser layout',size);
  }
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
