import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const at = id => page.waitForSelector(`[data-screen="${id}"][data-loaded=true]`);
  const open = async () => {
    await page.goto('http://127.0.0.1:5173/?screen=488:2076');
    await at('488:2076');
  };
  for (const [width, height] of [[320, 667], [360, 740], [393, 852], [430, 932], [560, 980]]) {
    await page.setViewportSize({ width, height });
    await open();
    const presets = page.locator('[data-amount-choice]');
    const input = page.getByRole('textbox', { name: 'Другая сумма', exact: true });
    await input.fill('80000');
    assert.equal(await page.locator('[data-amount-choice][aria-pressed=true]').count(), 0);
    await page.locator('[data-amount-choice="500"]').click();
    assert.equal(await input.inputValue(), '', 'preset selection clears the custom amount');
    assert.equal(await page.locator('[data-amount-choice][aria-pressed=true]').count(), 1);
    assert.match(await page.locator('[data-node-id="488:2116"]').innerText(), /К оплате 500 ₽/);
    for (const preset of await presets.all()) {
      const layout = await preset.evaluate(n => {
        const b = n.getBoundingClientRect(), p = n.querySelector('p').getBoundingClientRect();
        return { height: b.height, centerOffset: Math.abs(b.y + b.height / 2 - p.y - p.height / 2) };
      });
      assert.equal(layout.height, 48);
      assert.ok(layout.centerOffset < 1, 'amount text should be vertically centered');
    }
    const links = page.locator('.funding-detail-link');
    assert.equal(await links.count(), 2);
    for (const link of await links.all()) {
      await link.scrollIntoViewIfNeeded();
      const box = await link.boundingBox();
      const cta = await page.locator('.connection-cta').boundingBox();
      assert.ok(box.height >= 56 && box.x >= 0 && box.x + box.width <= width);
      assert.ok(box.y + box.height <= cta.y, 'payment CTA must not cover a detail link');
      await link.locator('img').evaluate(image => image.decode());
    }
    await links.first().locator('img').click();
    await at('506:4293');
    await open();
    await page.locator('.funding-detail-link').last().locator('img').click();
    await at('673:5844');
  }
  await page.setViewportSize({ width: 393, height: 852 });
  await open();
  await page.screenshot({ path: 'test-results/funding-form-polish.png' });
  assert.deepEqual(errors, []);
  console.log('Funding form: 5 viewports, centered presets, custom/preset consistency, unclipped detail rows and both icon routes passed');
} finally {
  await browser.close();
}
