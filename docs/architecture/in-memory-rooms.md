# In-Memory Room Design

## The two in-memory types

Both ephemeral and incognito rooms store their messages in a process-global `Map<string, MemRoom>` in the Node heap. Nothing is ever written to disk for these room types.

The distinction is in **how they are cleared**:

| | Ephemeral | Incognito |
|---|---|---|
| Clear trigger | TTL expires (background sweep every 30s) | Client fires `sendBeacon` on `pagehide` |
| TTL | Set at creation (blank = unlimited) | n/a — tied to tab lifetime |

## TTL is not a retention guarantee

An ephemeral room's TTL is a maximum lifetime, not a minimum. A server restart, OOM kill, or crash wipes all in-memory rooms immediately, regardless of remaining TTL. This is a deliberate design property, not a bug: ephemeral rooms are explicitly for throwaway content.

## Incognito and multi-tab

Incognito rooms are keyed by `ownerId` (session user). A `sendBeacon` to `/api/incognito/clear` wipes **all** incognito rooms for that user. If you open the same incognito room in two tabs and close one, all incognito rooms for your session are cleared. This is intentional — incognito means "gone when you're done".

## Memory budget

Each in-memory room tracks `bytes` — the sum of UTF-8 byte lengths of all message bodies and attachment URLs stored in it. New messages are rejected (400) once this exceeds `caps.max_mem_room_bytes` (default: 50 MB). This caps per-room heap use, not total heap.

For public demos, set `max_mem_room_bytes` to a much smaller value (e.g. 5 MB) to prevent a single session from exhausting memory.

## Images in in-memory rooms

Images uploaded to in-memory rooms are base64-encoded into a `data:` URL server-side and returned to the client. The data-URL is stored in the room's message list in heap. No file is written. This means image bytes live in heap and count against `max_mem_room_bytes`.

## Background sweep

A `setInterval` runs every 30 seconds to evict expired ephemeral rooms from the map. The interval is unref'd so it does not prevent process exit.
