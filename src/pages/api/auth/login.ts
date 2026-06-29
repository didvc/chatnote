import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { config } from "../../../config";
import { verifyPassword, createSession, SESSION_COOKIE } from "../../../lib/auth";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!config.require_password) return redirect("/");
  const form = await request.formData();
  const username = String(form.get("username") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");

  const user = await db.user.findUnique({ where: { username } });
  if (!user || !user.password || !verifyPassword(password, user.password)) {
    return redirect("/login?error=" + encodeURIComponent("invalid credentials"));
  }
  const token = await createSession(user.id);
  cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return redirect("/");
};
