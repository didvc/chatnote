import { defineMiddleware } from "astro:middleware";
import * as cookie from "cookie";
import { db } from "./lib/db";
import { config } from "./config";
import { SESSION_COOKIE, createSession } from "./lib/auth";
import { ensureStarted } from "./lib/init";

const PUBLIC_PREFIXES = ["/login", "/register", "/api/auth/", "/uploads/", "/_", "/favicon"];

export const onRequest = defineMiddleware(async (context, next) => {
  ensureStarted();

  const cookies = cookie.parse(context.request.headers.get("cookie") || "");
  const token = cookies[SESSION_COOKIE];
  let user: App.Locals["user"] = null;

  if (token) {
    const session = await db.session.findUnique({ where: { token }, include: { user: true } });
    if (session) {
      user = {
        id: session.user.id,
        username: session.user.username,
        anonymous: session.user.anonymous,
      };
    }
  }

  // No-password (demo) mode: mint an anonymous user per visitor automatically.
  if (!user && !config.require_password) {
    const u = await db.user.create({
      data: { username: "anon_" + Math.random().toString(36).slice(2, 10), anonymous: true },
    });
    const newToken = await createSession(u.id);
    context.cookies.set(SESSION_COOKIE, newToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    user = { id: u.id, username: u.username, anonymous: true };
  }

  context.locals.user = user;

  const path = context.url.pathname;
  const isPublic = PUBLIC_PREFIXES.some((p) => path.startsWith(p));
  if (!user && !isPublic) {
    return context.redirect("/login");
  }

  return next();
});
