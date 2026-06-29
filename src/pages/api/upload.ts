import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { config } from "../../config";
import { UPLOADS_DIR } from "../../lib/init";

const OK_MIME = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return new Response("unauthorized", { status: 401 });
  if (!config.allow_image_uploads) return Response.json({ error: "uploads disabled" }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  const roomId = String(form.get("roomId") || "");
  if (!(file instanceof File)) return Response.json({ error: "no file" }, { status: 400 });
  if (!OK_MIME.includes(file.type)) return Response.json({ error: "unsupported type" }, { status: 400 });
  if (file.size > config.caps.max_image_bytes) return Response.json({ error: "image too large" }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());

  // In-memory rooms must not touch disk -> return a data URL the client embeds inline.
  if (roomId.startsWith("mem_")) {
    const url = `data:${file.type};base64,${buf.toString("base64")}`;
    return Response.json({ url, name: file.name, mime: file.type });
  }

  // Persistent rooms -> write to disk under data/uploads.
  const ext = { "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp" }[file.type]!;
  const fname = crypto.randomBytes(12).toString("hex") + "." + ext;
  await fs.writeFile(path.join(UPLOADS_DIR, fname), buf);
  return Response.json({ url: "/uploads/" + fname, name: file.name, mime: file.type });
};
