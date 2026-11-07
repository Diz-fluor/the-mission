import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:393,height:852}});page.setDefaultTimeout(6000);
 await page.goto('http://127.0.0.1:5173/?screen=563%3A4968');await page.waitForSelector('[data-loaded=true]');
 const icons=await page.locator('[data-name="Личные действия · Сохранённые и уведомления"]').boundingBox();assert.ok(Math.abs(icons.x+icons.width-325)<2,'personal icons must align with right content edge');
 const sizes=await page.locator('[data-name="Видео · прокрутка"]>div').evaluateAll(ns=>ns.map(n=>n.getBoundingClientRect().width));assert.ok(sizes.every(w=>Math.abs(w-144)<1),'video cards must keep original width');
 await page.screenshot({path:'test-results/own-profile-layout.png'});
 for(const name of ['Андрей Белов','Мария Волкова']){
  await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('[data-loaded=true]');
  const card=page.getByRole('button',{name:'Открыть профиль: '+name,exact:true});const avatar=await card.locator('img').first().getAttribute('src');
  await card.click();await page.waitForSelector('[data-screen="457:5863"][data-loaded=true]');
  assert.ok((await page.locator('.design-stage').innerText()).includes(name));
  assert.equal(await page.locator('[data-name="Аватар · Опора сообщества"] img').getAttribute('src'),avatar);
  assert.ok(await page.locator('.demo-profile-card').count()>0,'participant needs full companies content');
  await page.locator('[data-profile-toggle]').first().click();assert.ok((await page.locator('.profile-biography').innerText()).length>150,'participant needs own biography');
  for(const [label,id]of [['Запросы','729:5891'],['Экспертизы','729:6028'],['Компании','457:5863']]){
   await page.locator('[data-name="Вкладки профиля"]').getByText(label,{exact:true}).click();await page.waitForSelector(`[data-screen="${id}"][data-loaded=true]`);
   assert.ok(await page.locator('.demo-profile-card').count()>0,'participant needs '+label);
   assert.ok(!(await page.locator('.design-stage').innerText()).includes('Александр'),'must not leak Alexander identity');
  }
  await page.reload();await page.waitForSelector('[data-loaded=true]');assert.ok((await page.locator('.design-stage').innerText()).includes(name));
  await page.screenshot({path:`test-results/participant-${name.split(' ')[0]}.png`});
 }
 console.log('Participants: right icons, full video cards, identity, avatar, biography, tabs and reload passed');
}finally{await browser.close();}
