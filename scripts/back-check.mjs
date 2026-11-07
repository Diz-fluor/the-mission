import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:393,height:852}});
 page.setDefaultTimeout(5000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const at=id=>page.waitForSelector(`[data-screen="${id}"][data-loaded=true]`);
 await page.goto('http://127.0.0.1:5173/');await at('464:2016');
 await page.getByText('ИИ подбор',{exact:true}).click();await at('489:2186');
 const arrow=page.locator('[data-name="THE MISSION/Icon/arrow-left"]');
 assert.equal(await arrow.getAttribute('role'),'button','back arrow must be an accessible control');
 await arrow.click();await at('464:2016');
 // A direct link must stay inside the app even if the browser has older pages.
 await page.goto('http://127.0.0.1:5173/?screen=505%3A3790');await at('505:3790');
 await page.getByRole('button',{name:'Назад',exact:true}).first().click();await at('464:2016');
 await page.getByRole('button',{name:'Профиль',exact:true}).click();await at('563:4968');
 await page.evaluate(()=>location.hash='/506:4090');await at('506:4090');
 await page.getByRole('button',{name:'Назад',exact:true}).click();await at('563:4968');
 // Keyboard navigation uses the same back action exactly once.
 await page.evaluate(()=>location.hash='/489:2186');await at('489:2186');
 await page.getByRole('button',{name:'Назад',exact:true}).press('Enter');await at('563:4968');
 assert.deepEqual(errors,[]);
 console.log('Back: AI arrow, direct link, template and keyboard passed');
}finally{await browser.close();}
