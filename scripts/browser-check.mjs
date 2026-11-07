import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 1 });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await mkdir('test-results', { recursive: true });
for (const [name, query] of [['home', '?frame=1'], ['profile', '?frame=1&screen=457%3A5863'], ['native', ''], ['form', '?screen=464%3A1784']]) {
 await page.goto('http://127.0.0.1:5173/' + query, { waitUntil: 'domcontentloaded' });
 await page.waitForSelector('[data-loaded=true]'); await page.evaluate(() => document.fonts.ready);
 await page.screenshot({ path: `test-results/${name}.png` });
 console.log(name, await page.evaluate(() => ({ images: [...document.images].filter(i => !i.complete || !i.naturalWidth).length, inputs: document.querySelectorAll('input,textarea').length, w: document.documentElement.scrollWidth, h: innerHeight, fonts:[...document.querySelectorAll('p')].slice(0,6).map(e=>({text:e.textContent,weight:getComputedStyle(e).fontWeight,family:getComputedStyle(e).fontFamily,size:getComputedStyle(e).fontSize})) })));
}
console.log(JSON.stringify({ errors })); await writeFile('test-results/browser-errors.json', JSON.stringify(errors));
await browser.close();
if (errors.length) process.exitCode = 1;
