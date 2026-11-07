import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:'reduce'});page.setDefaultTimeout(6000);
 await page.goto('http://127.0.0.1:5173/?screen=563%3A4968');await page.waitForSelector('[data-loaded=true]');
 await page.locator('[data-name="Profile / Scroll content"]').evaluate(n=>n.scrollTop=350);
 const gear=await page.locator('[data-name="Настройки · открыть"]').boundingBox();assert.ok(gear.y+gear.height<0,'settings icon must scroll away with profile header');
 const top=await page.locator('[data-name="Вкладки профиля"]').boundingBox();
 await page.locator('[data-name="Вкладки профиля"]').getByText('Запросы',{exact:true}).click();await page.waitForSelector('[data-screen="457:5605"][data-loaded=true]');
 const after=await page.locator('[data-name="Вкладки профиля"]').boundingBox();assert.ok(Math.abs(after.y-top.y)<2,'tabs must stay in place');
 await page.locator('[data-name="Вкладки профиля"]').getByText('Экспертизы',{exact:true}).click();await page.waitForSelector('[data-screen="457:5722"][data-loaded=true]');assert.ok(Math.abs((await page.locator('[data-name="Вкладки профиля"]').boundingBox()).y-top.y)<2);
 await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('[data-loaded=true]');
 const nav=page.locator('[data-name*="Таббар"]');const glow=await nav.locator('[data-name="Active glow"]').boundingBox();const active=await nav.locator(':scope > div:not([data-name="Active glow"])').boundingBox();assert.ok(Math.abs(glow.x+glow.width/2-(active.x+active.width/2))<1,'glow must be centered under active tab');
 console.log('Profile tab position, scrolling settings and centered navigation glow passed');
}finally{await browser.close();}
