import type { APIRoute } from "astro";
import { db } from "../../lib/db";

// Exports persistent rooms (with messages + tags). In-memory rooms are not exported.
export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return new Response("unauthorized", { status: 401 });

  const rooms = await db.room.findMany({
    where: { ownerId: user.id },
    include: {
      tags: { include: { tag: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const payload = {
    app: "chatnote",
    version: 1,
    exportedAt: new Date().toISOString(),
    rooms: rooms.map((r) => ({
      name: r.name,
      createdAt: r.createdAt.toISOString(),
      tags: r.tags.map((t) => t.tag.name),
      messages: r.messages.map((m) => ({
        body: m.body,
        attach: m.attach ? JSON.parse(m.attach) : [],
        preview: m.preview ? JSON.parse(m.preview) : null,
        createdAt: m.createdAt.toISOString(),
      })),
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="chatnote-export-${Date.now()}.json"`,
    },
  });
};
