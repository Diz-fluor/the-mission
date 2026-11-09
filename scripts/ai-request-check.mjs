import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const errors = [], results = [];
const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
page.on('pageerror', error => errors.push(error.message));
const at = id => page.waitForSelector(`[data-screen="${id}"][data-loaded=true]`);
const open = async id => { await page.goto('http://127.0.0.1:5173/?screen=' + encodeURIComponent(id)); await at(id); };
const click = label => page.getByRole('button', { name: label, exact: true }).click();
await mkdir('test-results', { recursive: true });
try {
  await open('503:2497');
  await click('Создать запрос с ИИ'); await at('838:7413');
  assert.equal(await page.getByRole('button', { name: 'Составить запрос' }).isDisabled(), true);
  const raw = 'Хочу наладить продажи в студии. Нужен человек, который поможет с командой и процессами.';
  await page.getByLabel('С чем нужна помощь').fill(raw);
  await click('Составить запрос'); await at('838:7466');
  await page.getByLabel('Запущенный отдел продаж', { exact: true }).check();
  await click('К черновику'); await at('838:7580');
  assert.equal(await page.getByLabel('Заголовок', { exact: true }).inputValue(), 'Помочь запустить отдел продаж');
  assert.ok((await page.getByLabel('Задача и результат').inputValue()).startsWith(raw));
  await page.getByLabel('Заголовок', { exact: true }).fill('Мой проверенный запрос');
  await page.getByLabel('Задача и результат').fill('Нужна помощь с запуском продаж. Текст исправлен вручную.');
  await click('Добавить бюджет, срок и формат');
  assert.equal(await page.getByLabel('Бюджет · необязательно').inputValue(), '');
  assert.equal(await page.getByLabel('Срок · необязательно').inputValue(), '');
  await page.getByLabel('Бюджет · необязательно').fill('До 80 000 ₽');
  await click('Сохранить черновик'); await at('503:2842');
  await open('503:2497'); assert.equal(await page.getByText('Черновик · Мой проверенный запрос', { exact: true }).count(), 0);
  await open('503:2842'); await page.getByText('Черновик · Мой проверенный запрос', { exact: true }).click(); await at('838:7580');
  assert.equal(await page.getByLabel('Заголовок', { exact: true }).inputValue(), 'Мой проверенный запрос');
  await click('Уточнить с ИИ'); await at('838:7413'); await click('Составить запрос'); await at('838:7580');
  assert.equal(await page.getByLabel('Заголовок', { exact: true }).inputValue(), 'Мой проверенный запрос');
  assert.equal(await page.getByLabel('Задача и результат').inputValue(), 'Нужна помощь с запуском продаж. Текст исправлен вручную.');
  await click('Опубликовать'); await at('838:7696');
  assert.match(await page.locator('body').innerText(), /До 80 000 ₽/);
  const records = await page.evaluate(() => JSON.parse(localStorage.getItem('the-mission-prototype-v1')).requests);
  assert.equal(records.length, 1); assert.equal(records[0].status, 'published');
  await open('503:2497'); await page.getByText('Мой проверенный запрос', { exact: true }).click(); await at('838:7696');
  await click('Подобрать людей'); await at('489:2257');
  assert.match(await page.locator('[data-name="Сообщение участника"]').innerText(), /Текст исправлен вручную/);
  await open('503:2842'); await page.getByText('Мой проверенный запрос', { exact: true }).click(); await at('838:7696');
  await click('Закрыть запрос'); await at('503:2945'); await page.getByText('Закрыть запрос', {exact:true}).last().click(); await at('503:2842');
  const closed = await page.evaluate(() => JSON.parse(localStorage.getItem('the-mission-prototype-v1')).requests[0]);
  assert.equal(closed.closed, true);
  results.push('create, clarify, edit, persist, private draft, resume, regenerate without overwrite, publish without duplicates');

  await open('503:2497'); await click('Создать запрос с ИИ'); await at('838:7413');
  await page.getByLabel('С чем нужна помощь').fill('Нужен дизайнер логотипа');
  await click('Составить запрос'); await at('838:7528');
  await click('Вернуться к задаче'); await at('838:7413');
  await page.waitForTimeout(900); assert.match(page.url(), /838:7413/);
  assert.equal(await page.getByLabel('С чем нужна помощь').inputValue(), 'Нужен дизайнер логотипа');
  await click('Заполнить вручную'); await at('503:2596');
  assert.equal(await page.getByRole('textbox', { name: /Задача/ }).inputValue(), 'Нужен дизайнер логотипа');
  results.push('cancel pending generation, preserve raw task, manual fallback');

  await open('838:7644'); assert.equal(await page.getByLabel('Ваша задача').inputValue(), 'Нужен дизайнер логотипа');
  await click('Повторить'); await at('838:7580');
  assert.equal(await page.getByLabel('Заголовок', { exact: true }).inputValue(), 'Нужен дизайнер логотипа');
  results.push('error recovery without losing the task');

  for (const width of [320,360,393,430]) {
    await page.setViewportSize({ width, height: 852 });
    await open('838:7580'); await page.evaluate(() => document.fonts.ready);
    const overflow = await page.locator('.ai-request-screen').evaluate(n => n.scrollWidth > n.clientWidth);
    assert.equal(overflow, false, 'horizontal overflow at ' + width);
    for (const image of await page.locator('.ai-request-screen img').all()) assert.equal(await image.evaluate(i => i.complete && i.naturalWidth > 0), true);
  }
  await open('838:7580'); await click('Добавить бюджет, срок и формат');
  const scroll = page.locator('.ai-request-scroll'); await scroll.evaluate(n => n.scrollTop = n.scrollHeight);
  assert.equal(await page.getByRole('button', { name: 'Сохранить черновик' }).isVisible(), true);
  await page.setViewportSize({ width:393,height:852 });
  await page.goto('http://127.0.0.1:5173/?frame=1&screen=838%3A7580'); await at('838:7580');
  const geometry = await page.locator('.ai-request-primary').evaluate(n => ({button:n.clientWidth,glass:n.querySelector('.connection-glass').getBoundingClientRect().width}));
  assert.equal(geometry.glass,geometry.button,'glass must cover the entire button');
  await page.screenshot({ path: 'test-results/ai-request-review.png' });
  results.push('four phone widths, local assets, scrollable optional fields and Figma review capture');
  await open('838:7413'); await page.getByLabel('С чем нужна помощь').fill('Нужен дизайнер логотипа');
  await page.context().setOffline(true); await click('Составить запрос'); await at('838:7644');
  assert.equal(await page.getByLabel('Ваша задача').inputValue(),'Нужен дизайнер логотипа');
  await page.context().setOffline(false);
  results.push('offline error preserves task and supports recovery');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ results, errors }));
} finally { await writeFile('test-results/ai-request.json', JSON.stringify({ results, errors }, null, 2)); await browser.close(); }
