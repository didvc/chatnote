import crypto from "node:crypto";
import { db } from "./db";

export const SESSION_COOKIE = "chatnote_sid";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  const known = Buffer.from(hash, "hex");
  return known.length === test.length && crypto.timingSafeEqual(known, test);
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  await db.session.create({ data: { token, userId } });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token } });
}
