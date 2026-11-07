import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:393,height:852}});
 await page.goto('http://127.0.0.1:5173/');
 await page.waitForSelector('[data-loaded=true]');
 // Observe animations at creation, without relying on machine timing.
 await page.evaluate(()=>{window.motion=[];const animate=Element.prototype.animate;Element.prototype.animate=function(frames,options){if(this.classList.contains('design-stage'))window.motion.push({frames,options});return animate.call(this,frames,options);};});
 await page.getByRole('button',{name:'Сообщество',exact:true}).click();
 await page.waitForSelector('[data-screen="678:14745"][data-loaded=true]');
 assert.equal(await page.evaluate(()=>window.motion.length),1,'section change should animate');
 await page.getByText('Поддержать проект',{exact:true}).click();
 await page.waitForSelector('[data-screen="488:2076"][data-loaded=true]');
 assert.match(await page.evaluate(()=>window.motion.at(-1).frames[0].transform),/translateX\(20px\)/);
 await page.goBack();
 await page.waitForSelector('[data-screen="678:14745"][data-loaded=true]');
 assert.match(await page.evaluate(()=>window.motion.at(-1).frames[0].transform),/translateX\(-20px\)/);
 await page.emulateMedia({reducedMotion:'reduce'});
 const count=await page.evaluate(()=>window.motion.length);
 await page.getByText('Поддержать проект',{exact:true}).click();
 await page.waitForSelector('[data-screen="488:2076"][data-loaded=true]');
 assert.equal(await page.evaluate(()=>window.motion.length),count,'reduced motion should skip animation');
 console.log('Motion: section, detail, back and reduced motion passed');
} finally {await browser.close();}
