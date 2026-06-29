# Room Types

chatnote has three room types, each with different storage and lifetime semantics.

## Persistent

- **Storage**: SQLite (disk)
- **Lifetime**: until you delete it
- **Features**: all — tags, link previews, image uploads to disk, JSON export

This is the default. Use it for notes you want to keep.

## Ephemeral

- **Storage**: Node.js heap (RAM)
- **Lifetime**: TTL you set at creation, or until the server process restarts (blank TTL = unlimited)
- **Features**: Markdown, images (inline data-URL); no link previews, no tags, no export

Ephemeral rooms have a **best-effort** lifespan. A TTL of `1h` means the room *may* last up to 1 hour, but a server restart or crash wipes it immediately regardless of remaining TTL. Do not rely on ephemeral rooms for retention guarantees.

## Incognito

- **Storage**: Node.js heap (RAM)
- **Lifetime**: until the tab closes
- **Features**: same as ephemeral

Incognito rooms fire a `sendBeacon` to the server when the tab's `pagehide` event fires, wiping all incognito rooms for your session. Nothing about an incognito room's content is written to disk at any point.

## Comparison

| | Persistent | Ephemeral | Incognito |
|---|---|---|---|
| Storage | SQLite (disk) | Node heap | Node heap |
| Survives restart | ✓ | ✗ | ✗ |
| TTL | — | optional | until tab closes |
| Tags | ✓ | ✗ | ✗ |
| Link previews | ✓ | ✗ | ✗ |
| Images on disk | ✓ | ✗ | ✗ |
| Export | ✓ | ✗ | ✗ |
