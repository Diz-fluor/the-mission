import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const source=JSON.parse(await readFile('src/prototype/alexander-profile.json','utf8'));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:393,height:852}});page.setDefaultTimeout(6000);
 const open=async id=>{await page.goto('http://127.0.0.1:5173/?screen='+encodeURIComponent(id));await page.waitForSelector('[data-loaded=true]');};
 for(const id of ['457:5863','563:4968','726:5802','726:5915','457:5605','457:5722','729:5891','729:6028']){
  await open(id);const header=page.locator('[data-name="О себе"] > button').first();
  assert.equal(await header.count(),1,'profile details must have an accessible toggle');
  await header.click();assert.equal(await header.getAttribute('aria-expanded'),'true');
  for(const s of source.filter(s=>['Основная информация','О себе'].includes(s.title)))for(const p of s.paragraphs)assert.ok((await page.locator('.profile-biography').innerText()).includes(p),'missing full biography paragraph');
  await header.click();assert.equal(await header.getAttribute('aria-expanded'),'false');assert.equal(await page.locator('.profile-biography').isVisible(),false);
  await header.click();await page.getByRole('button',{name:'Свернуть',exact:true}).click();assert.equal(await header.getAttribute('aria-expanded'),'false');
 }
 await open('729:5891');assert.ok((await page.locator('.design-stage').innerText()).includes('Готов обсудить совместный запуск направления на базе действующего бизнеса партнёра.'));
 await open('729:6028');await page.getByText('Показать все',{exact:true}).click();assert.ok((await page.locator('.design-stage').innerText()).includes('Знакомство и передачу контактов согласовываю с участниками.'));
 await open('457:5863');
 const scroll=await page.locator('[data-name="Profile / Scroll content"]').boundingBox();
 assert.ok(scroll.height>730,'profile should use available space above navigation');
 await page.screenshot({path:'test-results/profile-collapsed.png'});await page.locator('[data-profile-toggle]').first().click();await page.screenshot({path:'test-results/profile-expanded.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),393);
 console.log('Profile: full biography, repeated collapse in 8 states, full request and fourth expertise passed');
}finally{await browser.close();}
