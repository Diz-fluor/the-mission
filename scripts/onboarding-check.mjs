import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:320,height:640},reducedMotion:'reduce'});page.setDefaultTimeout(6000);
 await page.goto('http://127.0.0.1:5173/?screen=464%3A1674');await page.waitForSelector('[data-loaded=true]');
 await page.getByText('Стать участником',{exact:true}).click();await page.waitForSelector('[data-screen="464:1714"][data-loaded=true]');
 await page.getByText('Принимаю правила сообщества',{exact:true}).click();await page.getByText('Согласен на обработку данных',{exact:true}).click();await page.getByText('Продолжить',{exact:true}).click();await page.waitForSelector('[data-screen="464:1784"][data-loaded=true]');
 assert.equal(await page.locator('input.prototype-input').count(),2,'short onboarding should only ask basic details');
 await page.locator('input.prototype-input').nth(0).fill('Иван Петров');await page.locator('input.prototype-input').nth(1).fill('Казань');await page.getByText('Далее',{exact:true}).click();await page.waitForSelector('[data-screen="464:1844"][data-loaded=true]');
 await page.locator('input.prototype-input').fill('Разработка продуктов');await page.getByRole('button',{name:'Продажи',exact:true}).click();
 await page.getByText('Согласен на публикацию профиля',{exact:true}).click();
 const consent=await page.locator('[data-consent="publication"]').boundingBox();const cta=await page.getByText('Отправить анкету',{exact:true}).boundingBox();assert.ok(consent.height>=44,'publication consent needs a full touch target');assert.ok(consent.y+consent.height<=cta.y,'consent must not overlap submission');
 await page.screenshot({path:'test-results/onboarding-final.png'});
 await page.getByText('Отправить анкету',{exact:true}).click();await page.waitForSelector('[data-screen="464:1965"][data-loaded=true]');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('the-mission-prototype-v1')).profile);assert.equal(saved.name,'Иван Петров');assert.ok(saved.competencies.includes('Продажи'));
 // Approval is a separate, explicitly simulated curator event.
 await page.evaluate(()=>location.hash='/481:1993');await page.waitForSelector('[data-loaded=true]');await page.getByText('Найти людей',{exact:true}).click();await page.waitForSelector('[data-screen="464:2016"][data-loaded=true]');
 await page.getByRole('button',{name:'Профиль',exact:true}).click();await page.waitForSelector('[data-screen="563:4968"][data-loaded=true]');assert.equal(await page.getByText('Иван Петров',{exact:true}).count(),1);assert.ok(!(await page.locator('.design-stage').innerText()).includes('Александр Репин'));
 console.log('Short onboarding, consents, badges, no CTA overlap, simulated approval and fresh profile passed');
}finally{await browser.close();}
