import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const ids=JSON.parse(await readFile('docs/figma-screens.json','utf8')).screens.map(s=>s.id);const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:393,height:852}});const errors=[],broken=[];page.on('pageerror',e=>errors.push(e.message));
for(const [index,id]of ids.entries()){
 await page.goto('http://127.0.0.1:5173/?frame=1&screen='+encodeURIComponent(id),{waitUntil:'domcontentloaded'});
 await page.waitForSelector(`[data-screen="${id}"][data-loaded=true]`);await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
 const missing=await page.evaluate(()=>[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src));if(missing.length)broken.push({id,missing});
 if(index%25===0)console.log('Rendered',index+1,'/',ids.length);
}
for(const width of [320,360,393,430]){await page.setViewportSize({width,height:852});await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('[data-loaded=true]');await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);await page.screenshot({path:`test-results/native-${width}.png`});}
await writeFile('test-results/screens.json',JSON.stringify({rendered:ids.length,errors,broken,widths:[320,360,393,430]},null,2));console.log(JSON.stringify({rendered:ids.length,errors,broken}));await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(broken,[]);
