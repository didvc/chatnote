import net from "node:net";
import dns from "node:dns/promises";

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      a === 0
    );
  }
  const v = ip.toLowerCase();
  return v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v === "::";
}

// Fetch a URL's OpenGraph/title with SSRF protection. Returns null on any failure.
export async function unfurl(rawUrl: string): Promise<LinkPreview | null> {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;

  // Block private / internal targets (SSRF guard).
  try {
    const addrs = await dns.lookup(u.hostname, { all: true });
    if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) return null;
  } catch {
    return null;
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(u.toString(), {
      signal: ctrl.signal,
      redirect: "manual", // don't auto-follow into private space
      headers: { "user-agent": "chatnote-linkpreview/0.1" },
    });
    if (!res.ok) return null;
    const ctype = res.headers.get("content-type") || "";
    if (!ctype.includes("html")) return null;
    // Cap the body we read to 512 KB.
    const reader = res.body?.getReader();
    if (!reader) return null;
    let html = "";
    let total = 0;
    const dec = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      html += dec.decode(value, { stream: true });
      if (total > 512_000) {
        await reader.cancel();
        break;
      }
    }
    return { url: u.toString(), ...parseMeta(html) };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function parseMeta(html: string): Omit<LinkPreview, "url"> {
  const grab = (re: RegExp) => re.exec(html)?.[1]?.trim();
  const og = (p: string) =>
    grab(new RegExp(`<meta[^>]+property=["']og:${p}["'][^>]+content=["']([^"']+)["']`, "i")) ||
    grab(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${p}["']`, "i"));
  return {
    title: og("title") || grab(/<title[^>]*>([^<]+)<\/title>/i),
    description:
      og("description") ||
      grab(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i),
    image: og("image"),
  };
}
