# FAQ

## Why does my ephemeral room disappear after a server restart?

By design. Ephemeral and incognito rooms live in the Node heap — they are not written to disk at any point. A server restart clears all in-memory state. This is intentional; the room types are documented as non-persistent.

## What does "TTL is not a retention guarantee" mean?

Setting a TTL of `1h` on an ephemeral room means it *may* live up to 1 hour. If the server restarts at the 30-minute mark, the room is gone. The TTL is a ceiling, not a floor.

## Can I use chatnote with multiple users?

Yes. Each registered account has its own rooms, tags, and sessions. `require_password = false` (demo mode) creates a new anonymous account per visitor, so every visitor has their own isolated space.

## Link previews aren't appearing

Check that `allow_link_previews = true` in config.toml. Previews only work in persistent rooms. The server fetches the URL server-side — if the URL's host resolves to a private IP (e.g. `localhost`, `192.168.x.x`), the preview is blocked for SSRF protection.

## Images aren't uploading

Check `allow_image_uploads = true` in config.toml. Also check `caps.max_image_bytes` — the default is 2 MB.

## Search doesn't find old messages

Search uses SQLite `LIKE` queries, which are case-insensitive but don't do stemming or fuzzy matching. The search string must be a substring of the room name, message body, or tag name.

## Can I export in-memory room content?

No. Ephemeral and incognito rooms are not persisted. The JSON export only covers persistent rooms.

## How do I back up my data?

Copy `data/chatnote.db` (SQLite) and the `data/uploads/` directory. The database file is the single source of truth for all persistent data.
