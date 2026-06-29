import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { config } from "../../../config";
import { hashPassword, createSession, SESSION_COOKIE } from "../../../lib/auth";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!config.require_password) return redirect("/");
  const form = await request.formData();
  const username = String(form.get("username") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  if (username.length < 2 || password.length < 6) {
    return redirect("/register?error=" + encodeURIComponent("username >=2 and password >=6 chars"));
  }
  const exists = await db.user.findUnique({ where: { username } });
  if (exists) return redirect("/register?error=" + encodeURIComponent("username taken"));

  const u = await db.user.create({ data: { username, password: hashPassword(password) } });
  const token = await createSession(u.id);
  cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return redirect("/");
};
