# Architecture Overview

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 4 (SSR, Node standalone adapter) |
| Database | SQLite via Prisma ORM |
| In-memory store | Node.js heap (`Map`, process-global singleton) |
| Markdown | markdown-it + sanitize-html |
| Config | TOML, loaded once at server launch |

## Why Astro SSR?

Astro's island architecture compiles to minimal JavaScript. For a note-taking app with server-rendered Markdown, this means the client receives already-rendered HTML with no client-side rendering framework overhead. Interactive islands (the composer, delete buttons, tag editor) are progressively enhanced with vanilla JS.

The Node standalone adapter produces a single `dist/server/entry.mjs` that can run behind any reverse proxy (nginx, Caddy, Apache).

## Why SQLite?

Self-hosted single-user tools don't need a server database. SQLite is:
- Zero-ops: one file, trivially backed up (`cp data/chatnote.db backup.db`)
- Fast enough: single user, low concurrency, small data
- Prisma-compatible: all CRUD and relations work; only FTS5 full-text search would need `$queryRaw` (not yet implemented — `LIKE` search is used instead, which is sufficient for typical note volumes)

## Request flow

```
Browser → HTTP → Astro SSR middleware
                    → auth check (session cookie → Prisma → User)
                    → route handler (page or API)
                        → Prisma (persistent rooms)
                        OR memstore Map (ephemeral/incognito rooms)
                    → response (HTML page or JSON)
```

Markdown rendering happens server-side in the API route that accepts a new message. The rendered HTML is returned in the JSON response so the client can append it without a page reload.
