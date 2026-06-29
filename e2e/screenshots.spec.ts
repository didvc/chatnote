import { test, expect } from "@playwright/test";
import path from "node:path";

const OUT = path.resolve("screenshots");
const W = 1280;
const H = 800;

test("capture UI screenshots", async ({ page }) => {
  await page.setViewportSize({ width: W, height: H });

  // --- Register ---
  await page.goto("/register");
  await page.fill('input[name="username"]', "yuis");
  await page.fill('input[name="password"]', "secret123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/$/);

  // --- Create a few rooms ---
  // Persistent: Daily Notes
  await page.fill('input[name="name"]', "Daily Notes");
  await page.selectOption("#kind", "persistent");
  await page.click('button:has-text("create")');
  await expect(page).toHaveURL(/\/room\//);
  const dailyRoomUrl = page.url();

  // Send messages to Daily Notes
  const messages = [
    "## Monday standup\n- Finished the auth flow\n- Reviewing PRs today\n- Blocked on design feedback",
    "**Reminder:** deploy to staging before EOD",
    "Links to check later:\nhttps://github.com/didvc/chatnote\n\nGot the server config sorted, everything looks good now.",
    "```js\nconst greet = (name) => `Hello, ${name}!`\nconsole.log(greet('world'))\n```",
  ];
  for (const msg of messages) {
    await page.fill("#input", msg);
    await page.click("#send");
    await page.waitForTimeout(300);
  }
  // Set tags
  await page.fill("#tags", "work, standup");
  await page.click("#saveTags");
  await page.waitForTimeout(500);

  // Screenshot: persistent room with messages
  await page.screenshot({ path: `${OUT}/room-messages.png`, fullPage: false });

  // --- Back to home, create more rooms ---
  await page.goto("/");

  // Persistent: Ideas
  await page.fill('input[name="name"]', "Ideas & Inspiration");
  await page.selectOption("#kind", "persistent");
  await page.click('button:has-text("create")');
  await expect(page).toHaveURL(/\/room\//);
  await page.fill("#input", "Build a CLI tool that watches file changes and notifies via desktop notification");
  await page.click("#send");
  await page.waitForTimeout(300);
  await page.fill("#input", "**Side project ideas:**\n- Self-hosted Spotify scrobbler\n- Terminal markdown viewer\n- Lightweight bookmark manager");
  await page.click("#send");
  await page.waitForTimeout(300);
  await page.fill("#tags", "ideas, projects");
  await page.click("#saveTags");
  await page.waitForTimeout(400);

  // Ephemeral room
  await page.goto("/");
  await page.fill('input[name="name"]', "Scratch Pad");
  await page.selectOption("#kind", "ephemeral");
  await page.fill('input[name="ttl"]', "2h");
  await page.click('button:has-text("create")');
  await expect(page).toHaveURL(/\/room\//);
  await page.fill("#input", "Temp notes — TTL 2h, gone on restart");
  await page.click("#send");
  await page.waitForTimeout(300);

  // Incognito room
  await page.goto("/");
  await page.fill('input[name="name"]', "Private Thought");
  await page.selectOption("#kind", "incognito");
  await page.click('button:has-text("create")');
  await expect(page).toHaveURL(/\/room\//);
  await page.fill("#input", "Clears when this tab closes — never touches disk");
  await page.click("#send");
  await page.waitForTimeout(300);

  // Screenshot: home/room list showing all room types
  await page.goto("/");
  await page.waitForSelector(".room-list");
  await page.screenshot({ path: `${OUT}/room-list.png`, fullPage: false });

  // Screenshot: search
  await page.fill('input[name="q"]', "standup");
  await page.click('button:has-text("search")');
  await page.waitForSelector(".room-item");
  await page.screenshot({ path: `${OUT}/search.png`, fullPage: false });

  // Screenshot: Daily Notes room (already has messages)
  await page.goto(dailyRoomUrl);
  await page.waitForSelector(".msg");
  await page.screenshot({ path: `${OUT}/room-messages.png`, fullPage: false });

  // Screenshot: composer focused (Ctrl+click → type without sending)
  await page.fill("#input", "Another thought — **Ctrl+Enter** to send");
  await page.screenshot({ path: `${OUT}/composer.png`, fullPage: false });

  // Clear the input
  await page.fill("#input", "");

  // Screenshot: login page
  await page.goto("/login");
  await page.screenshot({ path: `${OUT}/login.png`, fullPage: false });
});
