import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();page.setDefaultTimeout(5000);
 for(const width of [320,393,480]){
  await page.setViewportSize({width,height:852});
  await page.goto('http://127.0.0.1:5173/?screen=489%3A2186');
  await page.waitForSelector('[data-loaded=true]');
  const box=await page.locator('[data-name="THE MISSION/Composer"]').boundingBox();
  const button=page.locator('[data-name="Отправить"]');const rect=await button.boundingBox();
  assert.ok(rect.x>=box.x&&rect.x+rect.width<=box.x+box.width&&rect.y>=box.y&&rect.y+rect.height<=box.y+box.height,'send button must fit inside composer at '+width);
  await button.click({force:true});assert.equal(await page.locator('.design-stage').getAttribute('data-screen'),'489:2186');
  assert.equal(await button.getAttribute('aria-disabled'),'true');
  await page.getByLabel('Сообщение',{exact:true}).fill('Нужен специалист по продажам');
  assert.equal(await button.getAttribute('aria-disabled'),'false');
  if(width===393)await page.screenshot({path:'test-results/composer-fixed.png'});
  await button.click();await page.waitForSelector('[data-screen="489:2257"][data-loaded=true]');
  await page.evaluate(()=>localStorage.clear());
 }
 console.log('Composer: button bounds, empty validation and submission passed at 320, 393, 480');
}finally{await browser.close();}
