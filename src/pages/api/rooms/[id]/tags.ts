import type { APIRoute } from "astro";
import { setRoomTags } from "../../../../lib/store";

export const POST: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user;
  if (!user) return new Response("unauthorized", { status: 401 });
  const data = await request.json().catch(() => ({}));
  const names: string[] = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const ok = await setRoomTags(user.id, params.id!, names);
  return new Response(null, { status: ok ? 204 : 404 });
};
