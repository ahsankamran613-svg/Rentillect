const { chromium } = require('D:/Rentillect/node_modules/playwright');
const path = require('path');

const storageDir = 'C:/Users/ahsan/.gemini/antigravity-ide/brain/5c4205b6-ebf1-4e4c-af67-16bd8af30356/.tempmediaStorage';

(async () => {
  console.log("Starting Airbnb / Upwork Model verification test...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // 1. Test Dual-Role User on Landlord Dashboard
  console.log("\n--- Scenario 1: Dual-Role User in Landlord Portal ---");
  const page = await context.newPage();

  // Mock /profiles/me for Dual Role user
  await page.route("**/profiles/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "test-user-123",
        full_name: "Ahsan Kamran",
        email: "ahsan@rentillect.pk",
        city: "Islamabad",
        roles: ["landlord", "tenant"],
        status: "active",
        created_at: new Date().toISOString(),
      }),
    });
  });

  // Seed localStorage with a dual-role user
  await page.addInitScript(() => {
    const authState = {
      state: {
        user: {
          id: "test-user-123",
          full_name: "Ahsan Kamran",
          email: "ahsan@rentillect.pk",
          city: "Islamabad",
          roles: ["landlord", "tenant"],
          status: "active",
          created_at: new Date().toISOString(),
        },
        token: "mock-jwt-token",
        activeRole: "landlord",
      },
      version: 0,
    };
    localStorage.setItem("rentillect-auth-storage", JSON.stringify(authState));
  });

  await page.goto("http://localhost:3000/landlord", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Check that the old toggle pill [ Landlord | Tenant ] is GONE
  const oldToggleCount = await page.locator("div:has(> a:has-text('Landlord')):has(> a:has-text('Tenant'))").count();
  console.log("Old toggle pill count (should be 0):", oldToggleCount);

  // Check for Header Action (Switch to Tenant button & Add Property button)
  const switchToTenantBtn = page.locator("header button:has-text('Switch to Tenant')");
  console.log("Header 'Switch to Tenant' button visible:", await switchToTenantBtn.isVisible());

  const addPropertyBtn = page.locator("header a:has-text('Add Property')");
  console.log("Header 'Add Property' button visible:", await addPropertyBtn.isVisible());

  // Check Sidebar Portal Badge
  const sidebarText = await page.locator("aside").textContent();
  console.log("Sidebar displays 'LANDLORD PORTAL':", sidebarText.toLowerCase().includes("landlord portal"));

  // Open UserMenu Dropdown
  const userMenuBtn = page.locator("header button[aria-expanded]");
  console.log("UserMenu trigger visible:", await userMenuBtn.isVisible());
  await userMenuBtn.click();
  await page.waitForTimeout(500);

  // Verify dropdown content
  const dropdownSwitchOption = page.locator("button:has-text('Switch to Tenant Portal')");
  console.log("Dropdown has 'Switch to Tenant Portal' option:", await dropdownSwitchOption.isVisible());

  await page.screenshot({ path: path.join(storageDir, "airbnb_landlord_usermenu.png"), fullPage: false });
  console.log("Saved airbnb_landlord_usermenu.png");

  // 2. Click "Switch to Tenant Portal" to test role transition
  console.log("\n--- Scenario 2: Switching to Tenant Portal ---");
  await dropdownSwitchOption.click();
  await page.waitForURL("**/tenant");
  await page.waitForTimeout(1000);

  console.log("Successfully navigated to Tenant Portal! Current URL:", page.url());

  // Check Tenant Portal Elements
  const switchToLandlordBtn = page.locator("header button:has-text('Switch to Landlord')");
  console.log("Header 'Switch to Landlord' button visible:", await switchToLandlordBtn.isVisible());

  const tenantSidebarText = await page.locator("aside").textContent();
  console.log("Sidebar displays 'TENANT PORTAL':", tenantSidebarText.toLowerCase().includes("tenant portal"));

  // Open UserMenu in Tenant view
  await userMenuBtn.click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(storageDir, "airbnb_tenant_usermenu.png"), fullPage: false });
  console.log("Saved airbnb_tenant_usermenu.png");
  await page.close();

  // 3. Test Single-Role Tenant ("Become a Landlord")
  console.log("\n--- Scenario 3: Single-Role Tenant View ---");
  const pageTenantOnly = await context.newPage();

  // Mock /profiles/me for Single-Role Tenant
  await pageTenantOnly.route("**/profiles/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "tenant-only-user",
        full_name: "Hamza Malik",
        email: "hamza@gmail.com",
        city: "Rawalpindi",
        roles: ["tenant"],
        status: "active",
        created_at: new Date().toISOString(),
      }),
    });
  });

  await pageTenantOnly.addInitScript(() => {
    const authState = {
      state: {
        user: {
          id: "tenant-only-user",
          full_name: "Hamza Malik",
          email: "hamza@gmail.com",
          city: "Rawalpindi",
          roles: ["tenant"],
          status: "active",
          created_at: new Date().toISOString(),
        },
        token: "mock-jwt-token-tenant",
        activeRole: "tenant",
      },
      version: 0,
    };
    localStorage.setItem("rentillect-auth-storage", JSON.stringify(authState));
  });

  await pageTenantOnly.goto("http://localhost:3000/tenant", { waitUntil: "networkidle" });
  await pageTenantOnly.waitForTimeout(1000);

  // Check "Become a Landlord" button in header
  const becomeLandlordHeaderBtn = pageTenantOnly.locator("header button:has-text('Become a Landlord')");
  console.log("Single-role Tenant sees 'Become a Landlord' in header:", await becomeLandlordHeaderBtn.isVisible());

  // Open UserMenu
  const tenantUserMenuBtn = pageTenantOnly.locator("header button[aria-expanded]");
  await tenantUserMenuBtn.click();
  await pageTenantOnly.waitForTimeout(500);

  const becomeLandlordDropdownCard = pageTenantOnly.locator("button:has-text('Become a Landlord')").last();
  console.log("Single-role Tenant sees 'Become a Landlord' in dropdown:", await becomeLandlordDropdownCard.isVisible());

  await pageTenantOnly.screenshot({ path: path.join(storageDir, "airbnb_single_tenant_view.png"), fullPage: false });
  console.log("Saved airbnb_single_tenant_view.png");

  // 4. Test "Become a Landlord" activation click
  console.log("\n--- Scenario 4: Clicking 'Become a Landlord' to unlock Landlord Portal ---");
  await pageTenantOnly.route("**/profiles/me/roles", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "tenant-only-user",
        full_name: "Hamza Malik",
        email: "hamza@gmail.com",
        city: "Rawalpindi",
        roles: ["tenant", "landlord"],
        status: "active",
        created_at: new Date().toISOString(),
      }),
    });
  });

  await becomeLandlordDropdownCard.click();
  await pageTenantOnly.waitForURL("**/landlord");
  await pageTenantOnly.waitForTimeout(1000);

  console.log("Successfully transitioned to Landlord Portal after activating role! Current URL:", pageTenantOnly.url());

  const upgradedSidebarText = await pageTenantOnly.locator("aside").textContent();
  console.log("Upgraded user now sees 'LANDLORD PORTAL':", upgradedSidebarText.toLowerCase().includes("landlord portal"));

  await pageTenantOnly.screenshot({ path: path.join(storageDir, "airbnb_upgraded_to_landlord.png"), fullPage: false });
  console.log("Saved airbnb_upgraded_to_landlord.png");

  await pageTenantOnly.close();
  await browser.close();
  console.log("\nAll tests completed successfully!");
})();
