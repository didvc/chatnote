import { db } from "./db";
import { config } from "../config";
import { renderMarkdown } from "./markdown";
import {
  createMemRoom,
  getMemRoom,
  listMemRooms,
  deleteMemRoom,
  addMemMessage,
  byteLen,
  type Attachment,
  type MemMessage,
} from "./memstore";

export type RoomKind = "persistent" | "ephemeral" | "incognito";

export interface RoomSummary {
  id: string;
  name: string;
  kind: RoomKind;
  createdAt: number;
  tags: string[];
  messageCount: number;
}

export interface ViewMessage {
  id: string;
  body: string;
  html: string;
  attach: Attachment[];
  preview: { url: string; title?: string; description?: string; image?: string } | null;
  createdAt: number;
}

export interface RoomView extends RoomSummary {
  messages: ViewMessage[];
}

const isMem = (id: string) => id.startsWith("mem_");

export async function listRooms(userId: string, q?: string): Promise<RoomSummary[]> {
  const where: any = { ownerId: userId };
  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q } },
      { messages: { some: { body: { contains: q } } } },
      { tags: { some: { tag: { name: { contains: q } } } } },
    ];
  }
  const dbRooms = await db.room.findMany({
    where,
    include: { tags: { include: { tag: true } }, _count: { select: { messages: true } } },
    orderBy: { createdAt: "desc" },
  });

  const persistent: RoomSummary[] = dbRooms.map((r) => ({
    id: r.id,
    name: r.name,
    kind: "persistent",
    createdAt: r.createdAt.getTime(),
    tags: r.tags.map((t) => t.tag.name),
    messageCount: r._count.messages,
  }));

  const ql = q?.trim().toLowerCase();
  const mem: RoomSummary[] = listMemRooms(userId)
    .filter(
      (r) =>
        !ql ||
        r.name.toLowerCase().includes(ql) ||
        r.messages.some((m) => m.body.toLowerCase().includes(ql)),
    )
    .map((r) => ({
      id: r.id,
      name: r.name,
      kind: r.type,
      createdAt: r.createdAt,
      tags: [],
      messageCount: r.messages.length,
    }));

  return [...mem, ...persistent].sort((a, b) => b.createdAt - a.createdAt);
}

export async function createRoom(
  userId: string,
  name: string,
  kind: RoomKind,
  ttlMs: number | null,
): Promise<{ id: string } | { error: string }> {
  name = name.trim() || "untitled";
  if (kind === "persistent") {
    const count = await db.room.count({ where: { ownerId: userId } });
    if (count >= config.caps.max_rooms_per_user) return { error: "room limit reached" };
    const r = await db.room.create({ data: { ownerId: userId, name } });
    return { id: r.id };
  }
  const r = createMemRoom(userId, name, kind, ttlMs);
  return { id: r.id };
}

export async function deleteRoom(userId: string, id: string): Promise<boolean> {
  if (isMem(id)) return deleteMemRoom(id, userId);
  const r = await db.room.findFirst({ where: { id, ownerId: userId } });
  if (!r) return false;
  await db.room.delete({ where: { id } });
  return true;
}

export async function getRoom(userId: string, id: string): Promise<RoomView | null> {
  if (isMem(id)) {
    const r = getMemRoom(id, userId);
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      kind: r.type,
      createdAt: r.createdAt,
      tags: [],
      messageCount: r.messages.length,
      messages: r.messages.map(memToView),
    };
  }
  const r = await db.room.findFirst({
    where: { id, ownerId: userId },
    include: {
      tags: { include: { tag: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    kind: "persistent",
    createdAt: r.createdAt.getTime(),
    tags: r.tags.map((t) => t.tag.name),
    messageCount: r.messages.length,
    messages: r.messages.map((m) => ({
      id: m.id,
      body: m.body,
      html: renderMarkdown(m.body),
      attach: m.attach ? (JSON.parse(m.attach) as Attachment[]) : [],
      preview: m.preview ? JSON.parse(m.preview) : null,
      createdAt: m.createdAt.getTime(),
    })),
  };
}

function memToView(m: MemMessage): ViewMessage {
  return {
    id: m.id,
    body: m.body,
    html: renderMarkdown(m.body),
    attach: m.attach,
    preview: null, // previews disabled in ephemeral/incognito by design
    createdAt: m.createdAt,
  };
}

export async function addMessage(
  userId: string,
  roomId: string,
  body: string,
  attach: Attachment[],
  preview: object | null,
): Promise<{ id: string } | { error: string }> {
  if (body.length > config.caps.max_message_chars) return { error: "message too long" };

  if (isMem(roomId)) {
    const r = getMemRoom(roomId, userId);
    if (!r) return { error: "not found" };
    const incoming = Buffer.byteLength(body) + attach.reduce((n, a) => n + a.url.length, 0);
    if (r.bytes + incoming > config.caps.max_mem_room_bytes)
      return { error: "room memory budget exceeded" };
    const m = addMemMessage(r, body, attach);
    return { id: m.id };
  }

  const room = await db.room.findFirst({ where: { id: roomId, ownerId: userId } });
  if (!room) return { error: "not found" };
  const count = await db.message.count({ where: { roomId } });
  if (count >= config.caps.max_messages_per_room) return { error: "message limit reached" };
  const m = await db.message.create({
    data: {
      roomId,
      body,
      attach: attach.length ? JSON.stringify(attach) : null,
      preview: preview ? JSON.stringify(preview) : null,
    },
  });
  return { id: m.id };
}

export async function deleteMessage(userId: string, msgId: string): Promise<boolean> {
  const m = await db.message.findFirst({ where: { id: msgId, room: { ownerId: userId } } });
  if (!m) return false;
  await db.message.delete({ where: { id: msgId } });
  return true;
}

// --- tags (persistent rooms only) ---
export async function setRoomTags(userId: string, roomId: string, names: string[]): Promise<boolean> {
  const room = await db.room.findFirst({ where: { id: roomId, ownerId: userId } });
  if (!room) return false;
  const clean = [...new Set(names.map((n) => n.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
  await db.roomTag.deleteMany({ where: { roomId } });
  for (const name of clean) {
    const tag = await db.tag.upsert({ where: { name }, create: { name }, update: {} });
    await db.roomTag.create({ data: { roomId, tagId: tag.id } });
  }
  return true;
}

export { byteLen };
