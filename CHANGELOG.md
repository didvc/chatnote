# Changelog

All notable changes to chatnote will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-06-29

### Added
- Three room types: persistent (SQLite), ephemeral (in-memory TTL), incognito (tab-scoped)
- Multi-user accounts with password auth; `require_password = false` demo mode for anonymous visitors
- Markdown messages rendered server-side with sanitize-html (XSS-safe)
- Image attachments — disk-backed for persistent rooms, inline data-URL for in-memory rooms
- Server-side link previews for persistent rooms with SSRF guard (private IP block, 4s timeout, 512 KB cap)
- Room tags and full-text search across rooms, messages, and tags
- JSON export and import for persistent rooms
- Per-user, per-room, per-image, and per-mem-room-heap caps
- `wipe_persistent_every` scheduled full wipe for demo deployments
- TOML config loaded at server launch (`config.example.toml`)
- Apache 2.0 license
