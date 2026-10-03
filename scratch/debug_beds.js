const { chromium } = require('D:/Rentillect/node_modules/playwright');
const path = require('path');

const storageDir = 'C:/Users/ahsan/.gemini/antigravity-ide/brain/5c4205b6-ebf1-4e4c-af67-16bd8af30356/.tempmediaStorage';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('request', req => {
    if (req.url().includes('/properties')) {
      console.log('REQUEST URL:', req.url());
    }
  });
  page.on('response', async res => {
    if (res.url().includes('/properties') && res.request().method() === 'GET') {
      try {
        const text = await res.text();
        console.log(`RESPONSE [${res.status()}] from ${res.url()}: length ${text.length}`);
      } catch (e) {}
    }
  });

  console.log("Navigating to /properties ...");
  await page.goto("http://localhost:3000/properties", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Look for the beds button
  const bedsBtn = page.locator('button:has-text("Any Beds"), button:has-text("Beds")').first();
  console.log("Beds button text:", await bedsBtn.textContent());

  // Click beds button to open dropdown
  console.log("Clicking beds button...");
  await bedsBtn.click();
  await page.waitForTimeout(500);

  // Check popover visibility
  const popover = page.locator('div:has-text("Number of Bedrooms")').last();
  console.log("Popover visible:", await popover.isVisible());

  // Click '2 Beds'
  console.log("Clicking '2 Beds'...");
  const bed2 = page.locator('button:has-text("2 Beds")').first();
  await bed2.click();
  await page.waitForTimeout(1000);

  console.log("Beds button text after clicking 2 Beds:", await bedsBtn.textContent());

  // Click '3 Beds' as well
  console.log("Clicking '3 Beds'...");
  const bed3 = page.locator('button:has-text("3 Beds")').first();
  await bed3.click();
  await page.waitForTimeout(1000);

  console.log("Beds button text after clicking 3 Beds:", await bedsBtn.textContent());

  // Check showing count
  const countText = await page.locator('h1 + p').textContent();
  console.log("Results count text:", countText);

  await page.screenshot({ path: path.join(storageDir, "debug_beds_selection.png") });
  console.log("Saved debug_beds_selection.png");

  await browser.close();
})();
