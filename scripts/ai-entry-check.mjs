import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({reducedMotion:'reduce'});page.setDefaultTimeout(7000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const open=async()=>{await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('[data-screen="464:2016"][data-loaded=true]');};
 for(const width of [320,360,393,430]){
  await page.setViewportSize({width,height:852});await open();const button=page.locator('[data-name="Вход · ИИ-подбор"]');
  assert.equal(await button.locator('.ai-connection-label').count(),1,'AI entry should share the Connection silhouette');
  const geometry=await button.evaluate(n=>{const body=n.querySelector('.ai-connection-label'),a=n.querySelector('.connection-action'),p=body.querySelector('p'),mark=n.querySelector('.ai-connection-mark'),arrow=n.querySelector('.ai-connection-arrow');const b=n.getBoundingClientRect(),r=body.getBoundingClientRect(),s=a.getBoundingClientRect();return{h:b.height,bodyH:r.height,actionW:s.width,gap:s.left-r.right,markW:mark.getBoundingClientRect().width,arrowW:arrow.getBoundingClientRect().width,font:getComputedStyle(p).fontFamily,size:getComputedStyle(p).fontSize,case:getComputedStyle(p).textTransform,bridge:getComputedStyle(n,'::before').height,right:b.right};});
  assert.equal(geometry.h,48);assert.equal(geometry.bodyH,48);assert.equal(geometry.actionW,48);assert.equal(geometry.gap,4);assert.equal(geometry.markW,32);assert.equal(geometry.arrowW,20);assert.match(geometry.font,/Onest/);assert.equal(geometry.size,'15px');assert.equal(geometry.case,'none');assert.equal(geometry.bridge,'18px');assert.ok(geometry.right<=width);
  await button.locator('.connection-action').click();await page.waitForSelector('[data-screen="489:2186"][data-loaded=true]');await page.getByRole('button',{name:'Назад',exact:true}).click();await page.waitForSelector('[data-screen="464:2016"][data-loaded=true]');
 }
 const button=page.locator('.ai-connection');const normal=await button.locator('.ai-connection-label').evaluate(n=>getComputedStyle(n).backgroundColor);await button.hover();await page.mouse.down();assert.notEqual(await button.locator('.ai-connection-label').evaluate(n=>getComputedStyle(n).backgroundColor),normal);await page.mouse.move(0,0);await page.mouse.up();
 await page.getByText('ИИ подбор',{exact:true}).click();await page.waitForSelector('[data-screen="489:2186"][data-loaded=true]');
 await page.setViewportSize({width:393,height:852});await open();await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>Promise.all([...document.querySelector('[data-name="Вход · ИИ-подбор"]').querySelectorAll('img')].map(i=>i.decode())));await page.screenshot({path:'test-results/ai-entry-connection.png'});assert.deepEqual(errors,[]);console.log('AI Connection: 4 widths, original case, exact icon sizes, shared silhouette, press feedback and label/arrow navigation passed');
}finally{await browser.close();}
