# Security Model

## XSS — Markdown sanitization

All Markdown is rendered server-side with `markdown-it` (html: false — raw HTML in input is never passed through). The rendered HTML is then run through `sanitize-html` with an allowlist of safe tags and attributes. External links get `target="_blank" rel="noopener noreferrer nofollow"` automatically via a transform.

This is defense in depth: markdown-it with `html: false` already prevents raw HTML passthrough; sanitize-html is the second gate.

## SSRF — Link preview guard

Link previews (persistent rooms only) fetch external URLs server-side. Before making any HTTP request, the server resolves the hostname via DNS and rejects the request if any resolved IP is in a private range:

- `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x` (RFC 1918)
- `127.x.x.x` (loopback)
- `169.254.x.x` (link-local)
- `::1`, `fc00::/7`, `fe80::/10` (IPv6 private)

Additionally: 4-second timeout, 512 KB body cap, no redirect-following, no link previews in ephemeral or incognito rooms.

## Authentication

Sessions use a cryptographically random 32-byte hex token stored in an `HttpOnly; SameSite=Lax` cookie. Passwords are hashed with `scrypt` (salt: 16 random bytes, output: 64 bytes). Password comparison uses `crypto.timingSafeEqual` to prevent timing attacks.

## Demo mode (no_password)

When `require_password = false`, each unauthenticated visitor gets an anonymous user record and session minted automatically. The home page is immediately accessible. There is no credential to steal, but abuse is possible — use caps and scheduled wipes to limit impact.

## Path traversal — upload serving

The `/uploads/:file` route validates the filename against `/^[a-f0-9]+\.(png|jpg|gif|webp)$/` before reading from `data/uploads/`. `path.basename()` strips any directory components before that check.

## Caps

All user-configurable caps (rooms per user, messages per room, message character length, image byte size, mem room heap budget) are enforced server-side before any write occurs. Client-side UI is not the enforcement boundary.
