import fs from "node:fs";
import path from "node:path";
import { config, parseDuration } from "../config";
import { db } from "./db";

export const DATA_DIR = path.resolve(process.cwd(), "data");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

const g = globalThis as unknown as { __chatnoteInit?: boolean };

export function ensureStarted(): void {
  if (g.__chatnoteInit) return;
  g.__chatnoteInit = true;

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  // Scheduled full wipe of persistent data (handy for public demos).
  const ms = parseDuration(config.wipe_persistent_every);
  if (ms && ms > 0) {
    const wipe = async () => {
      try {
        await db.message.deleteMany({});
        await db.roomTag.deleteMany({});
        await db.room.deleteMany({});
        await db.tag.deleteMany({});
        // Drop anonymous users + their sessions; keep real accounts.
        await db.user.deleteMany({ where: { anonymous: true } });
        for (const f of fs.readdirSync(UPLOADS_DIR)) fs.rmSync(path.join(UPLOADS_DIR, f), { force: true });
      } catch (e) {
        console.error("[chatnote] wipe failed", e);
      }
    };
    setInterval(wipe, ms).unref?.();
    console.log(`[chatnote] scheduled persistent wipe every ${config.wipe_persistent_every}`);
  }
}
