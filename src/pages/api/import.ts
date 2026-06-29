import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { config } from "../../config";

// Imports a chatnote export JSON as new persistent rooms for the current user.
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return new Response("unauthorized", { status: 401 });

  const data = await request.json().catch(() => null);
  if (!data || data.app !== "chatnote" || !Array.isArray(data.rooms)) {
    return Response.json({ error: "not a chatnote export" }, { status: 400 });
  }

  const existing = await db.room.count({ where: { ownerId: user.id } });
  let imported = 0;

  for (const r of data.rooms) {
    if (existing + imported >= config.caps.max_rooms_per_user) break;
    const room = await db.room.create({
      data: { ownerId: user.id, name: String(r.name || "imported") },
    });
    imported++;

    const tags: string[] = Array.isArray(r.tags) ? r.tags.map(String) : [];
    for (const name of [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))]) {
      const tag = await db.tag.upsert({ where: { name }, create: { name }, update: {} });
      await db.roomTag.create({ data: { roomId: room.id, tagId: tag.id } });
    }

    const msgs = Array.isArray(r.messages) ? r.messages.slice(0, config.caps.max_messages_per_room) : [];
    for (const m of msgs) {
      await db.message.create({
        data: {
          roomId: room.id,
          body: String(m.body || "").slice(0, config.caps.max_message_chars),
          attach: Array.isArray(m.attach) && m.attach.length ? JSON.stringify(m.attach) : null,
          preview: m.preview ? JSON.stringify(m.preview) : null,
        },
      });
    }
  }

  return Response.json({ imported });
};
