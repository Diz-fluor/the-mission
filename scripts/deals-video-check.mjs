import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:393,height:852}});page.setDefaultTimeout(6000);
 await page.goto('http://127.0.0.1:5173/?screen=504%3A2892');await page.waitForSelector('[data-loaded=true]');
 await page.getByText('Завершены',{exact:true}).click();
 assert.equal(await page.locator('[data-name="THE MISSION/Card/Deal"]:visible').count(),0,'completed filter must hide active deals');
 assert.equal(await page.getByText('Пока нет завершённых сделок',{exact:true}).isVisible(),true);
 for(const label of ['Все','Активные']){await page.getByRole('tab',{name:label,exact:true}).click();assert.equal(await page.locator('[data-name="THE MISSION/Card/Deal"]:visible').count(),2);assert.equal(await page.locator('[role=tab][aria-selected=true]').count(),1);}
 await page.getByRole('tab',{name:'Завершены',exact:true}).click();await page.reload();await page.waitForSelector('[data-loaded=true]');assert.equal(await page.getByRole('tab',{name:'Завершены',exact:true}).getAttribute('aria-selected'),'true');
 await page.goto('http://127.0.0.1:5173/?screen=563%3A4968');await page.waitForSelector('[data-loaded=true]');await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.getByRole('button',{name:'Следующие видео',exact:true}).count(),0);
 const strip=page.locator('[data-name="Видео · прокрутка"]');
 await strip.evaluate(n=>n.scrollLeft=n.scrollWidth);
 const rect=await strip.boundingBox();const third=await strip.locator('>div').nth(2).boundingBox();
 assert.ok(third.x>=rect.x-1&&third.x+third.width<=rect.x+rect.width+1,'third video must be fully visible after scrolling');
 await page.screenshot({path:'test-results/third-video-visible.png'});
 console.log('Deals filters, persisted selection and fully visible third video passed');
}finally{await browser.close();}
