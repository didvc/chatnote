import type { APIRoute } from "astro";
import { addMessage } from "../../../../lib/store";
import { config } from "../../../../config";
import { unfurl } from "../../../../lib/preview";
import { renderMarkdown } from "../../../../lib/markdown";
import type { Attachment } from "../../../../lib/memstore";

const isMem = (id: string) => id.startsWith("mem_");

export const POST: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user;
  if (!user) return new Response("unauthorized", { status: 401 });
  const roomId = params.id!;

  const data = await request.json().catch(() => ({}));
  const body = String(data.body ?? "");
  const attach: Attachment[] = Array.isArray(data.attach) ? data.attach : [];
  if (!body.trim() && attach.length === 0) {
    return Response.json({ error: "empty message" }, { status: 400 });
  }

  // Link previews: persistent rooms only, opt-in via config. Never for in-memory rooms.
  let preview: object | null = null;
  if (!isMem(roomId) && config.allow_link_previews) {
    const m = body.match(/https?:\/\/[^\s)]+/);
    if (m) preview = await unfurl(m[0]);
  }

  const result = await addMessage(user.id, roomId, body, attach, preview);
  if ("error" in result) return Response.json(result, { status: 400 });
  return Response.json({ id: result.id, html: renderMarkdown(body), attach, preview });
};
