import type { APIRoute } from "astro";
import { clearIncognitoForOwner } from "../../../lib/memstore";

// Fired by the client (sendBeacon) when an incognito room's tab closes.
export const POST: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return new Response(null, { status: 204 });
  clearIncognitoForOwner(user.id);
  return new Response(null, { status: 204 });
};
