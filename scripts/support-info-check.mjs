import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:393,height:852}});page.setDefaultTimeout(6000);
 await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('[data-loaded=true]');
 await page.getByRole('button',{name:'Открыть профиль: Мария Волкова',exact:true}).click();await page.waitForSelector('[data-screen="457:5863"][data-loaded=true]');
 await page.evaluate(()=>location.hash='/457:5992');await page.waitForSelector('[data-screen="457:5992"][data-loaded=true]');
 const panel=page.locator('[data-name="Пояснение уровня"]');
 const photos=await panel.locator('img').evaluateAll(ns=>ns.map(n=>n.getAttribute('src')));assert.equal(new Set(photos).size,1,'all support examples must use one photo');
 assert.equal(await panel.getByText('Опора сообщества',{exact:true}).isVisible(),true);
 const button=panel.getByRole('button',{name:'Понятно',exact:true});assert.equal(await button.count(),1,'acknowledgment must be a real control');
 const color=await button.evaluate(n=>getComputedStyle(n).backgroundColor);assert.notEqual(color,'rgba(0, 0, 0, 0)');
 await page.screenshot({path:'test-results/support-info-fixed.png'});await button.click();await page.waitForSelector('[data-screen="457:5863"][data-loaded=true]');
 console.log('Support explanation: same photo, all labels, visible button and return passed');
}finally{await browser.close();}
