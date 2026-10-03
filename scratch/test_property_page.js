const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Test with Silver Oaks 3-Bed property
  const propertyId = 'e718c11e-d61f-4775-84ab-eb0bb31ea4a0';
  console.log(`Navigating to http://localhost:3000/properties/${propertyId}...`);
  
  await page.goto(`http://localhost:3000/properties/${propertyId}`, {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Wait for main title or content
  await page.waitForSelector('h1', { timeout: 10000 });
  await page.waitForTimeout(1000); // let animations / maps settle

  const screenshotDir = 'C:\\Users\\ahsan\\.gemini\\antigravity-ide\\brain\\5c4205b6-ebf1-4e4c-af67-16bd8af30356\\.tempmediaStorage';
  const fullPagePath = path.join(screenshotDir, 'property_detail_redesigned.png');
  await page.screenshot({ path: fullPagePath, fullPage: true });
  console.log('Saved redesigned full page screenshot to:', fullPagePath);

  // Locate the "Call Landlord" button and click it
  const callButton = page.locator('button:has-text("Call Landlord")');
  if (await callButton.isVisible()) {
    console.log('Clicking "Call Landlord" button...');
    await callButton.click();
    await page.waitForTimeout(500);

    // Look for the Copy button inside the popover
    const copyButton = page.locator('button:has-text("Copy")');
    if (await copyButton.isVisible()) {
      console.log('Clicking "Copy" button in popover...');
      await copyButton.click();
      await page.waitForTimeout(300);
    }

    const popoverPath = path.join(screenshotDir, 'property_detail_call_popover.png');
    await page.screenshot({ path: popoverPath });
    console.log('Saved popover screenshot to:', popoverPath);
  } else {
    console.warn('Could not find "Call Landlord" button!');
  }

  await browser.close();
  console.log('Done testing!');
})();
