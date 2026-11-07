import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const allIds=JSON.parse(await readFile('docs/figma-screens.json','utf8')).screens.map(s=>s.id);
const ids=process.argv.includes('--core')?['464:2016','563:4968','504:2892','678:14745','489:2186','503:2596','487:1972','503:2945','504:3401']:allIds;
const browser=await chromium.launch({headless:true});
const failures=[],errors=[];let checked=0;
try{
 const page=await browser.newPage({reducedMotion:'reduce'});page.setDefaultTimeout(6000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('[data-loaded=true]');
 await page.getByRole('button',{name:'Сохранить участника',exact:true}).first().click();
 for(const [width,height]of [[320,640],[360,780],[393,852],[430,932]]){
  await page.setViewportSize({width,height});
  for(const id of ids){
   await page.evaluate(id=>location.hash='/'+id,id);
   await page.waitForSelector(`[data-screen="${id}"][data-loaded=true]`);
   const issues=await page.evaluate(()=>{
    const issues=[];
    if(document.documentElement.scrollWidth>innerWidth)issues.push('horizontal page overflow');
    const nav=document.querySelector('[data-name*="Таббар"]');
    if(nav){const r=nav.getBoundingClientRect();if(r.left<0||r.right>innerWidth||r.bottom>innerHeight+1||r.top<0)issues.push('tabbar outside viewport');
     if(!document.querySelector('.prototype-sheet,.support-explanation')){const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(hit&&!nav.contains(hit))issues.push('tabbar covered by content');}
     for(const item of [...nav.children].filter(n=>getComputedStyle(n).position!=='absolute')){const box=item.getBoundingClientRect();if(box.width<44||box.height<44)issues.push('tabbar touch target too small');}}
    const profile=document.querySelector('[data-name="Profile / Scroll content"]');
    if(profile&&profile.getBoundingClientRect().bottom>innerHeight)issues.push('profile scroll outside viewport');
    for(const selector of ['[data-name="Поиск и фильтры"]','[data-name="Вход · ИИ-подбор"]','[data-name="Новость · 6 ноября"]']){const node=document.querySelector(selector);if(node){const r=node.getBoundingClientRect();if(r.left<0||r.right>innerWidth)issues.push('content outside viewport: '+selector);}}
    return issues;
   });
   if(issues.length)failures.push({id,width,height,issues});
   checked++;
   if(['464:2016','563:4968','504:2892','678:14745','489:2186','503:2596'].includes(id))await page.screenshot({path:`test-results/mobile-${width}-${id.replace(':','-')}.png`});
  }
  console.log('Mobile width checked:',width);
 }
 await writeFile('test-results/mobile.json',JSON.stringify({checked,failures,errors},null,2));
 console.log(JSON.stringify({checked,failures,errors}));assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
}finally{await browser.close();}
