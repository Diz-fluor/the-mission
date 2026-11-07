import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 for(const width of [320,393,480]){
  await page.setViewportSize({width,height:852});
  for(const id of ['563:4968','457:5605','457:5722','457:5863','729:5891','729:6028']){
   await page.goto('http://127.0.0.1:5173/?screen='+encodeURIComponent(id));await page.waitForSelector('[data-loaded=true]');
   const center=await page.locator('[data-name="Profile / Scroll content"] > [data-name="Масштаб бизнеса · видимость"]').evaluate(n=>{const r=[...n.children].map(c=>c.getBoundingClientRect());return(r[0].left+r.at(-1).right)/2;});
   assert.ok(Math.abs(center-width/2)<1,`metrics must be centered at ${width}, ${id}: ${center}`);
  }
 }
 console.log('Profile metrics centered in all six tabs at 320, 393, 480');
}finally{await browser.close();}
