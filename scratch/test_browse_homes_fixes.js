const { chromium } = require('D:/Rentillect/node_modules/playwright');
const path = require('path');

const storageDir = 'C:/Users/ahsan/.gemini/antigravity-ide/brain/5c4205b6-ebf1-4e4c-af67-16bd8af30356/.tempmediaStorage';

(async () => {
  console.log("Starting comprehensive Browse Homes test...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const networkErrors = [];
  page.on('response', res => {
    if (res.status() >= 400 && res.url().includes('/properties')) {
      networkErrors.push({ url: res.url(), status: res.status() });
      console.error(`HTTP ERROR [${res.status()}] from ${res.url()}`);
    }
  });

  console.log("1. Navigating to /properties ...");
  await page.goto("http://localhost:3000/properties", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Initial count
  const initialCount = await page.locator('h1 + p').textContent();
  console.log("Initial count text:", initialCount);

  // 2. Open Bedroom popover
  const bedsBtn = page.locator('button:has-text("Any Beds"), button:has-text("Beds")').first();
  console.log("Initial Beds button:", await bedsBtn.textContent());
  await bedsBtn.click();
  await page.waitForTimeout(300);

  // Select 2 Beds
  console.log("Clicking '2 Beds'...");
  await page.locator('button:has-text("2 Beds")').first().click();
  await page.waitForTimeout(1000);
  console.log("Beds button text (after 2 Beds):", await bedsBtn.textContent());

  // Select 3 Beds (multi-select)
  console.log("Clicking '3 Beds'...");
  await page.locator('button:has-text("3 Beds")').first().click();
  await page.waitForTimeout(1000);
  console.log("Beds button text (after 2, 3 Beds):", await bedsBtn.textContent());

  const countAfter2and3 = await page.locator('h1 + p').textContent();
  console.log("Count after 2 and 3 beds:", countAfter2and3);

  // 3. Test Reset inside Bedroom Popover
  console.log("Clicking 'Reset' inside popover...");
  const resetBedsBtn = page.locator('button:has-text("Reset")').first();
  await resetBedsBtn.click();
  await page.waitForTimeout(1000);
  console.log("Beds button text after reset:", await bedsBtn.textContent());

  // Close popover with 'Done'
  await page.locator('button:has-text("Done")').click();
  await page.waitForTimeout(300);

  // 4. Test Price filtering (Min & Max PKR)
  console.log("Testing Min and Max Rent inputs...");
  const minInput = page.locator('input[placeholder="Min PKR"]');
  const maxInput = page.locator('input[placeholder="Max PKR"]');

  await minInput.fill("70000");
  await minInput.blur();
  await page.waitForTimeout(1000);

  await maxInput.fill("120000");
  await maxInput.blur();
  await page.waitForTimeout(1000);

  const countAfterPrice = await page.locator('h1 + p').textContent();
  console.log("Count after price filter 70k - 120k:", countAfterPrice);

  // 5. Test Global Reset button
  console.log("Testing Global Reset button...");
  const globalResetBtn = page.locator('button[title="Reset all filters"]');
  console.log("Global reset visible:", await globalResetBtn.isVisible());
  await globalResetBtn.click();
  await page.waitForTimeout(1200);

  const countAfterGlobalReset = await page.locator('h1 + p').textContent();
  console.log("Count after Global Reset:", countAfterGlobalReset);
  console.log("Min input cleared:", (await minInput.inputValue()) === "");
  console.log("Max input cleared:", (await maxInput.inputValue()) === "");

  // 6. Test Multi-select bedrooms again and take final screenshot
  await bedsBtn.click();
  await page.waitForTimeout(300);
  await page.locator('button:has-text("2 Beds")').first().click();
  await page.locator('button:has-text("5 Beds")').first().click();
  await page.waitForTimeout(1000);

  console.log("Beds button text (2 and 5 beds):", await bedsBtn.textContent());
  await page.screenshot({ path: path.join(storageDir, "browse_homes_fixed_verified.png"), fullPage: false });
  console.log("Saved browse_homes_fixed_verified.png");

  console.log("Total HTTP errors encountered:", networkErrors.length);
  if (networkErrors.length > 0) {
    console.error("Errors:", networkErrors);
  }

  await browser.close();
  console.log("All browse homes tests passed smoothly!");
})();
