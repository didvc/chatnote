// In-heap storage for ephemeral & incognito rooms. Never touches disk.
//  - incognito: cleared when the client's tab closes (beacon) or session ends.
//  - ephemeral: wiped by TTL sweeper (ttlMs=null means "until the process restarts").
// Note: TTL is a best-effort lifespan, NOT a retention guarantee — a restart/crash
// wipes everything in here regardless of remaining TTL.
import crypto from "node:crypto";

export type MemRoomType = "ephemeral" | "incognito";

export interface Attachment {
  url: string; // data: URL for in-memory rooms, /uploads/... for persistent
  name: string;
  mime: string;
}

export interface MemMessage {
  id: string;
  body: string;
  attach: Attachment[];
  createdAt: number;
}

export interface MemRoom {
  id: string;
  ownerId: string;
  name: string;
  type: MemRoomType;
  ttlMs: number | null;
  createdAt: number;
  messages: MemMessage[];
  bytes: number; // tracked against caps.max_mem_room_bytes
}

const g = globalThis as unknown as { __memrooms?: Map<string, MemRoom> };
const rooms: Map<string, MemRoom> = g.__memrooms ?? new Map();
if (!g.__memrooms) g.__memrooms = rooms;

export function createMemRoom(
  ownerId: string,
  name: string,
  type: MemRoomType,
  ttlMs: number | null,
): MemRoom {
  const room: MemRoom = {
    id: "mem_" + crypto.randomBytes(8).toString("hex"),
    ownerId,
    name,
    type,
    ttlMs,
    createdAt: Date.now(),
    messages: [],
    bytes: 0,
  };
  rooms.set(room.id, room);
  return room;
}

export function getMemRoom(id: string, ownerId: string): MemRoom | null {
  const r = rooms.get(id);
  if (!r || r.ownerId !== ownerId) return null;
  if (expired(r)) {
    rooms.delete(id);
    return null;
  }
  return r;
}

export function listMemRooms(ownerId: string): MemRoom[] {
  sweep();
  return [...rooms.values()]
    .filter((r) => r.ownerId === ownerId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function deleteMemRoom(id: string, ownerId: string): boolean {
  const r = rooms.get(id);
  if (!r || r.ownerId !== ownerId) return false;
  return rooms.delete(id);
}

export function clearIncognitoForOwner(ownerId: string): void {
  for (const [id, r] of rooms) {
    if (r.ownerId === ownerId && r.type === "incognito") rooms.delete(id);
  }
}

export function addMemMessage(room: MemRoom, body: string, attach: Attachment[]): MemMessage {
  const msg: MemMessage = {
    id: "m_" + crypto.randomBytes(8).toString("hex"),
    body,
    attach,
    createdAt: Date.now(),
  };
  room.messages.push(msg);
  room.bytes += byteLen(msg);
  return msg;
}

export function byteLen(msg: MemMessage): number {
  let n = Buffer.byteLength(msg.body, "utf8");
  for (const a of msg.attach) n += Buffer.byteLength(a.url, "utf8") + a.name.length;
  return n;
}

function expired(r: MemRoom): boolean {
  return r.ttlMs != null && Date.now() - r.createdAt > r.ttlMs;
}

export function sweep(): void {
  for (const [id, r] of rooms) if (expired(r)) rooms.delete(id);
}

// Background TTL sweeper (idempotent across HMR).
const gi = globalThis as unknown as { __memsweep?: NodeJS.Timeout };
if (!gi.__memsweep) gi.__memsweep = setInterval(sweep, 30_000).unref?.() ?? setInterval(sweep, 30_000);
