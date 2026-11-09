import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:'reduce'});
 const errors=[],issues=[];let count=0;page.on('pageerror',e=>errors.push(e.message));
 const ids=JSON.parse(await readFile('docs/figma-screens.json','utf8')).screens.map(s=>s.id);
 await page.goto('http://127.0.0.1:5173/');
 await page.waitForSelector('[data-loaded=true]');
 await page.getByRole('button',{name:'Сохранить участника',exact:true}).first().click();
 for(const id of ids){
  await page.evaluate(id=>location.hash='/'+id,id);await page.waitForSelector(`[data-screen="${id}"][data-loaded=true]`);
  const result=await page.evaluate(()=>{
   const candidates=[...document.querySelectorAll('[data-name*="CTA"],[data-name="Сохранить изменения профиля"]')];
   return {count:candidates.length,issues:candidates.filter(n=>{
    const label=n.querySelector('.connection-label'),action=n.querySelector('.connection-action');
    return !n.classList.contains('connection-cta')||!n.querySelector('.connection-glass svg [data-glass-outline]')||!label||!action||!getComputedStyle(label).fontFamily.includes('Onest')||label.getBoundingClientRect().height!==64||action.getBoundingClientRect().width!==64;
   }).map(n=>n.dataset.nodeId)};
  });
  count+=result.count;if(result.issues.length)issues.push({id,issues:result.issues});
 }
 console.log({screens:ids.length,primaryActions:count,issues,errors});assert.deepEqual(issues,[]);assert.deepEqual(errors,[]);
}finally{await browser.close();}
