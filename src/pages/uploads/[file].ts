import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR } from "../../lib/init";

const MIME: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", gif: "image/gif", webp: "image/webp",
};

export const GET: APIRoute = async ({ params }) => {
  const name = path.basename(params.file || ""); // prevent traversal
  if (!/^[a-f0-9]+\.(png|jpg|gif|webp)$/.test(name)) return new Response("not found", { status: 404 });
  try {
    const buf = await fs.readFile(path.join(UPLOADS_DIR, name));
    const ext = name.split(".").pop()!;
    return new Response(buf, {
      headers: { "content-type": MIME[ext], "cache-control": "private, max-age=86400" },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
};
