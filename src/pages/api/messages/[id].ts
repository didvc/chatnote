import type { APIRoute } from "astro";
import { deleteMessage } from "../../../lib/store";

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return new Response("unauthorized", { status: 401 });
  const ok = await deleteMessage(user.id, params.id!);
  return new Response(null, { status: ok ? 204 : 404 });
};
