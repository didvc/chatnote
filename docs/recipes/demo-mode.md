# Demo Mode

chatnote can run as a public demo where anyone visits and gets a room immediately, without a login screen.

## Minimal demo config

```toml
require_password      = false
allow_image_uploads   = false
allow_link_previews   = false
wipe_persistent_every = "1d"

[caps]
max_rooms_per_user    = 10
max_messages_per_room = 100
max_message_chars     = 2000
max_image_bytes       = 0
max_mem_room_bytes    = 5000000
```

## What happens with `require_password = false`

- Every unauthenticated visitor receives an anonymous user record and session cookie on first request.
- There is no login or register screen.
- Anonymous users can create and use all three room types.
- Anonymous user records accumulate in SQLite; `wipe_persistent_every` cleans them along with all persistent rooms.

## Scheduled wipe

`wipe_persistent_every` accepts a duration string: `"1d"`, `"12h"`, `"30m"`. The wipe deletes all messages, rooms, tags, and anonymous user records. Named (registered) user accounts are not deleted. The wipe also removes all files in `data/uploads/`.

Set to `"off"` (the default) to disable.

## Demo on GitHub Pages / Railway / Fly.io

Build the app (`npm run build`), set config via `CHATNOTE_CONFIG` env var pointing to a config file, or bake the config into the image. The app listens on `PORT` env var (default 4321).
