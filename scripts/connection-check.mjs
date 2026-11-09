import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:'reduce'});page.setDefaultTimeout(7000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const at=id=>page.waitForSelector(`[data-screen="${id}"][data-loaded=true]`);
 const open=async id=>{await page.goto('http://127.0.0.1:5173/?screen='+id);await at(id);};
 await open('678:14745');
 const support=page.locator('[data-name="CTA · Поддержать проект"]');
 assert.equal(await support.locator('.connection-label').count(),1,'main action must use the approved connected label and action zones');
 for(const width of [320,360,393,430]){
  await page.setViewportSize({width,height:852});
  for(const id of ['678:14745','464:1674','481:2176','481:2230','500:2604','504:3284']){
   await open(id);
   const buttons=page.locator('.connection-cta');assert.ok(await buttons.count(),`primary action missing on ${id}`);
   for(const button of await buttons.all()){
    const check=await button.evaluate(n=>{const label=n.querySelector('.connection-label'),action=n.querySelector('.connection-action'),b=n.getBoundingClientRect(),a=action.getBoundingClientRect();const range=document.createRange();range.selectNodeContents(label);const text=range.getBoundingClientRect(),l=label.getBoundingClientRect();return {height:b.height,labelHeight:l.height,actionWidth:a.width,actionHeight:a.height,gap:a.left-l.right,upper:getComputedStyle(label).textTransform,font:getComputedStyle(label).fontFamily,textFits:text.width<=l.width+1&&text.height<=l.height+1,bridge:getComputedStyle(n,'::before').height};});
    const surface=await button.locator('.connection-glass svg').evaluate(n=>({width:n.getBoundingClientRect().width,pathWidth:n.querySelector('[data-glass-outline]').getBBox().width,viewWidth:n.viewBox.baseVal.width}));assert.ok(Math.abs(surface.width-surface.pathWidth)<1,'surface must follow button width without stretching the action circle');assert.equal(surface.viewWidth,surface.width);assert.equal(check.height,64);assert.equal(check.labelHeight,64);assert.equal(check.actionWidth,64);assert.equal(check.actionHeight,64);assert.ok(Math.abs(check.gap)<1);assert.equal(check.upper,'uppercase');assert.match(check.font,/Onest/);assert.ok(check.textFits,`long label clipped at ${width} on ${id}`);assert.equal(check.bridge,'24px');
   }
  }
 }
 await open('678:14745');
 assert.equal(await page.getByText(/Мой вклад/).evaluate(n=>getComputedStyle(n).textTransform),'none','secondary actions stay in normal case');
 const normal=await support.locator('.connection-glass').evaluate(n=>getComputedStyle(n).getPropertyValue('--glass-base'));
 await support.hover();await page.mouse.down();assert.notEqual(await support.locator('.connection-glass').evaluate(n=>getComputedStyle(n).getPropertyValue('--glass-base')),normal,'press feedback must be visible');await page.mouse.move(0,0);await page.mouse.up();
 await support.evaluate(n=>n.setAttribute('aria-busy','true'));assert.equal(await support.locator('.connection-icon--loading').isVisible(),true);await support.evaluate(n=>n.removeAttribute('aria-busy'));
 await support.locator('.connection-action').click();await at('488:2076');
 await open('464:1714');const next=page.locator('.connection-cta');assert.equal(await next.getAttribute('aria-disabled'),'true');const disabled=await next.locator('.connection-label').evaluate(n=>getComputedStyle(n).backgroundColor);await next.dispatchEvent('click');await at('464:1714');
 await page.getByText('Принимаю правила сообщества',{exact:true}).click();await page.getByText('Согласен на обработку данных',{exact:true}).click();assert.equal(await next.getAttribute('aria-disabled'),'false');assert.notEqual(await next.locator('.connection-label').evaluate(n=>getComputedStyle(n).backgroundColor),disabled);await next.locator('.connection-action').click();await at('464:1784');
 await open('678:14745');await page.evaluate(()=>Promise.all([...document.querySelectorAll('.connection-cta img')].map(i=>i.decode())));await page.screenshot({path:'test-results/connection-community.png'});
 assert.deepEqual(errors,[]);console.log('Connection CTA: Figma geometry, uppercase scope, narrow/long labels, pressed/loading/disabled states and arrow-click navigation passed');
}finally{await browser.close();}
