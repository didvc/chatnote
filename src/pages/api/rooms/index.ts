import type { APIRoute } from "astro";
import { createRoom, type RoomKind } from "../../../lib/store";
import { parseDuration } from "../../../config";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user) return new Response("unauthorized", { status: 401 });

  const form = await request.formData();
  const name = String(form.get("name") || "");
  const kind = String(form.get("kind") || "persistent") as RoomKind;
  const ttlRaw = String(form.get("ttl") || "").trim(); // "" => null (until restart)

  if (!["persistent", "ephemeral", "incognito"].includes(kind)) {
    return new Response("bad kind", { status: 400 });
  }
  const ttlMs = kind === "ephemeral" && ttlRaw ? parseDuration(ttlRaw) : null;

  const result = await createRoom(user.id, name, kind, ttlMs);
  if ("error" in result) return redirect("/?error=" + encodeURIComponent(result.error));
  return redirect("/room/" + result.id);
};
