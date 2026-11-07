import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:'reduce'});page.setDefaultTimeout(6000);
 const at=id=>page.waitForSelector(`[data-screen="${id}"][data-loaded=true]`);const open=async id=>{await page.goto('http://127.0.0.1:5173/?screen='+encodeURIComponent(id));await at(id);};
 await open('489:2186');await page.getByLabel('Сообщение',{exact:true}).fill('Нужен руководитель продаж');await page.getByRole('button',{name:'Отправить сообщение',exact:true}).click();await at('489:2257');await page.getByRole('button',{name:'Назад',exact:true}).click();await at('489:2186');await page.waitForTimeout(1400);await at('489:2186');
 await open('503:2497');await page.getByRole('button',{name:'Открыть запрос: Ищу партнёра по маркетингу',exact:true}).click();await at('503:2556');assert.equal(await page.getByText('Ищу партнёра по маркетингу',{exact:true}).count(),1,'request detail must match selected card');
 await page.getByText('Откликнуться',{exact:true}).click();await at('503:2653');await page.getByLabel('Чем можете помочь',{exact:true}).fill('Помогу выстроить маркетинг и привлечь клиентов.');await page.getByText('Отправить',{exact:true}).click();await at('503:2728');assert.ok((await page.evaluate(()=>JSON.parse(localStorage.getItem('the-mission-prototype-v1')).fields['last-response'])).includes('маркетинг'));
 await page.getByRole('tab',{name:'Мои',exact:true}).click();await at('503:2842');await page.getByRole('tab',{name:'Все',exact:true}).click();await at('503:2497');
 await open('504:2892');await page.getByText('Настройка процессов',{exact:true}).click();await at('504:3088');assert.equal(await page.getByText('Настройка процессов',{exact:true}).count(),1,'deal detail must match selected card');
 await open('505:4047');await page.locator('input.prototype-input').fill('@demo_member');await page.getByText('Создать приглашение',{exact:true}).click();await at('505:4084');assert.equal(await page.getByText('Для @demo_member',{exact:true}).count(),1);await page.getByText('Отозвать приглашение',{exact:true}).click();await at('506:4193');
 await open('505:4231');await page.getByText('Удалить профиль',{exact:true}).click();await at('505:4231');assert.equal(await page.getByRole('status').count(),1,'deletion needs explicit typed confirmation');
 console.log('AI return, request identity/reply/tabs, deal identity, invitation/revoke and deletion validation passed');
}finally{await browser.close();}
