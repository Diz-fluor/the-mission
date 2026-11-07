import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:'reduce'});page.setDefaultTimeout(6000);
 await page.goto('http://127.0.0.1:5173/?screen=563%3A4968');await page.waitForSelector('[data-loaded=true]');
 await page.getByText('Редактировать',{exact:true}).click();await page.waitForSelector('[data-screen="500:2604"][data-loaded=true]');
 assert.equal(await page.getByLabel('Имя и фамилия',{exact:true}).inputValue(),'Александр Репин');
 await page.getByLabel('Имя и фамилия',{exact:true}).fill('Александр Тестов');
 await page.getByLabel('Город',{exact:true}).fill('Казань');
 await page.getByLabel('Подробнее о себе',{exact:true}).fill('Полная биография с опытом, интересами и планами.\nВторая строка для проверки сохранения.');
 await page.getByLabel('Название',{exact:true}).fill('Тестовая компания');
 await page.getByLabel('Текущая задача',{exact:true}).fill('Найти партнёра для нового проекта');
 await page.getByText('СОХРАНИТЬ',{exact:true}).click();await page.waitForSelector('[data-screen="505:4326"][data-loaded=true]');
 await page.getByText('К профилю',{exact:true}).click();await page.waitForSelector('[data-screen="563:4968"][data-loaded=true]');
 assert.equal(await page.getByText('Александр Тестов',{exact:true}).count(),1);assert.equal(await page.getByText('Казань',{exact:true}).count(),1);
 await page.getByText('О себе',{exact:true}).click();assert.ok((await page.locator('.profile-biography').innerText()).includes('Вторая строка для проверки сохранения.'));
 await page.reload();await page.waitForSelector('[data-loaded=true]');assert.equal(await page.getByText('Александр Тестов',{exact:true}).count(),1);
 await page.getByText('Как видят другие',{exact:true}).click();await page.waitForSelector('[data-screen="457:5863"][data-loaded=true]');
 await page.getByText('Вернуться в мой профиль',{exact:true}).click();await page.waitForSelector('[data-screen="563:4968"][data-loaded=true]');assert.equal(await page.getByText('Александр Тестов',{exact:true}).count(),1);
 console.log('Full profile edit, save, multiline biography, reload and own preview return passed');
}finally{await browser.close();}
