import { PrismaClient } from "@prisma/client";

// Reuse a single client across HMR reloads in dev.
const g = globalThis as unknown as { __prisma?: PrismaClient };
export const db = g.__prisma ?? new PrismaClient();
if (!g.__prisma) g.__prisma = db;
