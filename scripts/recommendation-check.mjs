import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:'reduce'});page.setDefaultTimeout(6000);
 await page.goto('http://127.0.0.1:5173/?screen=487%3A1972');await page.waitForSelector('[data-loaded=true]');
 await page.getByRole('radio',{name:'Знаком лично',exact:true}).click();
 const colors=await page.locator('[data-choice]').evaluateAll(ns=>ns.map(n=>({selected:n.getAttribute('aria-checked'),color:getComputedStyle(n).backgroundColor})));
 const active=colors.find(n=>n.selected==='true');assert.equal(colors.filter(n=>n.color===active.color).length,1,'only one radio row may look selected');
 const field=page.getByLabel('Что делали вместе',{exact:true});assert.equal(await field.evaluate(n=>n.tagName),'TEXTAREA');await field.fill('Работали вместе над запуском нового отдела.\nРезультат: команда и процессы настроены.');
 await page.getByText('На проверку',{exact:true}).click();await page.waitForSelector('[data-screen="487:2006"][data-loaded=true]');
 await page.goto('http://127.0.0.1:5173/?screen=457%3A5863');await page.waitForSelector('[data-loaded=true]');await page.getByText('Рекомендовать',{exact:true}).click();await page.waitForSelector('[data-screen="487:1972"][data-loaded=true]');
 await page.getByRole('button',{name:'Закрыть',exact:true}).click();await page.waitForSelector('[data-screen="457:5863"][data-loaded=true]');
 console.log('Recommendation radio styling, multiline text, submission and close passed');
}finally{await browser.close();}
