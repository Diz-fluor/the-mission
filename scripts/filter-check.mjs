import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:393,height:852}});
 await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('[data-loaded=true]');
 const check=async label=>{
  const colors=await page.locator('[data-name="Направления"] > div').evaluateAll(nodes=>nodes.map(n=>({label:n.textContent.trim(),background:getComputedStyle(n).backgroundColor})));
  const selected=colors.find(n=>n.label===label);
  assert.equal(colors.filter(n=>n.background===selected.background).length,1,'only '+label+' should be highlighted');
 };
 for(const label of ['Новые','Мои','Все','Новые']){await page.getByText(label,{exact:true}).click();await check(label);}
 await page.reload();await page.waitForSelector('[data-loaded=true]');await check('Новые');
 await page.getByRole('button',{name:'Профиль',exact:true}).click();await page.waitForSelector('[data-screen="563:4968"][data-loaded=true]');
 await page.getByRole('button',{name:'Главная',exact:true}).click();await page.waitForSelector('[data-screen="464:2016"][data-loaded=true]');await check('Новые');
 console.log('Filters: exclusive highlight, reload and navigation passed');
}finally{await browser.close();}
