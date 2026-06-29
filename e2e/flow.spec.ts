import { test, expect } from "@playwright/test";

// Unique user per run so reruns don't collide.
const user = "e2e_" + Date.now().toString(36);

test("full flow: register, rooms, markdown, image, delete, tags, incognito", async ({ page }) => {
  // --- register via UI ---
  await page.goto("/register");
  await page.fill('input[name="username"]', user);
  await page.fill('input[name="password"]', "secret123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/$|\/\?/);
  await expect(page.locator(".topbar .who")).toHaveText(user);

  // --- create a persistent room ---
  await page.fill('input[name="name"]', "My Notes");
  await page.selectOption("#kind", "persistent");
  await page.click('button:has-text("create")');
  await expect(page).toHaveURL(/\/room\//);
  await expect(page.locator("h2")).toContainText("My Notes");
  await expect(page.locator(".badge.persistent")).toBeVisible();

  // --- send a markdown message; assert it renders client-side ---
  await page.fill("#input", "**bold** and `code`");
  await page.click("#send");
  const msg = page.locator(".msg").last();
  await expect(msg.locator(".body strong")).toHaveText("bold");
  await expect(msg.locator(".body code")).toHaveText("code");

  // --- image attach via the composer file input ---
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGNgAAAAAgABc3UBGAAAAABJRU5ErkJggg==",
    "base64",
  );
  await page.setInputFiles("#imgInput", { name: "px.png", mimeType: "image/png", buffer: png });
  await expect(page.locator("#pending")).toContainText("px.png");
  await page.fill("#input", "with image");
  await page.click("#send");
  await expect(page.locator(".msg").last().locator(".attach img")).toBeVisible();

  // --- delete a message ---
  const before = await page.locator(".msg").count();
  page.once("dialog", (d) => d.accept()); // none expected for msg delete, but safe
  await page.locator(".msg").last().locator(".msg-del").click();
  await expect(page.locator(".msg")).toHaveCount(before - 1);

  // --- save tags ---
  await page.fill("#tags", "work, ideas");
  await page.click("#saveTags");
  await expect(page.locator("#saveTags")).toHaveText("saved ✓");

  // --- back to list: room shows tags + survives reload (persistent) ---
  await page.goto("/");
  await expect(page.locator(".room-item", { hasText: "My Notes" })).toContainText("#work");

  // --- create an incognito room and post ---
  await page.fill('input[name="name"]', "Secret");
  await page.selectOption("#kind", "incognito");
  await page.click('button:has-text("create")');
  await expect(page.locator(".badge.incognito")).toBeVisible();
  await page.fill("#input", "ephemeral thought");
  await page.click("#send");
  await expect(page.locator(".msg").last()).toContainText("ephemeral thought");
});
