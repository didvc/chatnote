import fs from "node:fs";
import path from "node:path";
import TOML from "@iarna/toml";

export interface Caps {
  max_rooms_per_user: number;
  max_messages_per_room: number;
  max_message_chars: number;
  max_image_bytes: number;
  max_mem_room_bytes: number;
}

export interface Config {
  require_password: boolean;
  allow_image_uploads: boolean;
  allow_link_previews: boolean;
  wipe_persistent_every: string; // "off" | "1d" | "12h" | "30m" ...
  caps: Caps;
}

const DEFAULTS: Config = {
  require_password: true,
  allow_image_uploads: true,
  allow_link_previews: true,
  wipe_persistent_every: "off",
  caps: {
    max_rooms_per_user: 200,
    max_messages_per_room: 5000,
    max_message_chars: 20000,
    max_image_bytes: 2_000_000,
    max_mem_room_bytes: 50_000_000,
  },
};

function load(): Config {
  const file = process.env.CHATNOTE_CONFIG || path.resolve(process.cwd(), "config.toml");
  let raw: Record<string, unknown> = {};
  try {
    raw = TOML.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
  } catch {
    // No config.toml -> use defaults (secure: password required).
  }
  const caps = { ...DEFAULTS.caps, ...((raw.caps as object) || {}) };
  return { ...DEFAULTS, ...raw, caps } as Config;
}

export const config = load();

/** Parse "1d" | "12h" | "30m" | "45s" -> ms, or null for "off"/invalid. */
export function parseDuration(s: string): number | null {
  const m = /^(\d+)\s*([smhd])$/.exec(s.trim());
  if (!m) return null;
  const n = Number(m[1]);
  const mult = { s: 1e3, m: 60e3, h: 3600e3, d: 86400e3 }[m[2] as "s" | "m" | "h" | "d"];
  return n * mult;
}
