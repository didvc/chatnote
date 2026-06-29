# Config Reference

All options live in a TOML file (default: `config.toml`). Loaded once at server launch. Set `CHATNOTE_CONFIG=/path/to/config.toml` to override the path.

## Top-level options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `require_password` | bool | `true` | Require login. `false` = anonymous per-visitor users, no login screen (demo mode). |
| `allow_image_uploads` | bool | `true` | Enable the image upload endpoint. Set `false` on public demos. |
| `allow_link_previews` | bool | `true` | Enable server-side link unfurling for persistent rooms. Never applies to in-memory rooms. |
| `wipe_persistent_every` | string | `"off"` | Scheduled full wipe interval. Accepts `"off"` or a duration like `"1d"`, `"12h"`, `"30m"`. |

## `[caps]` section

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `max_rooms_per_user` | int | `200` | Maximum persistent rooms per user account. |
| `max_messages_per_room` | int | `5000` | Maximum messages in a persistent room. |
| `max_message_chars` | int | `20000` | Maximum character length of a single message body. |
| `max_image_bytes` | int | `2000000` | Maximum size in bytes of a single uploaded image (2 MB default). |
| `max_mem_room_bytes` | int | `50000000` | Maximum heap bytes consumed by a single in-memory room (50 MB default). |

## Duration format

`wipe_persistent_every` accepts: `"off"`, `"30s"`, `"30m"`, `"12h"`, `"1d"`. Any other value is treated as `"off"`.

## Environment variable

```bash
CHATNOTE_CONFIG=/etc/chatnote/config.toml node dist/server/entry.mjs
```
