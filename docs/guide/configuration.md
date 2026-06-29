# Configuration

chatnote reads a TOML file at launch. Default path is `config.toml` in the working directory. Override with the `CHATNOTE_CONFIG` environment variable.

All options have safe defaults; you can start with an empty config.toml and add only what you need.

See [Config Reference](/reference/config) for the full option list with types and defaults.

## Typical personal-use config

```toml
require_password = true
allow_image_uploads = true
allow_link_previews = true
wipe_persistent_every = "off"

[caps]
max_rooms_per_user    = 200
max_messages_per_room = 5000
max_image_bytes       = 2000000
```

## Typical public-demo config

```toml
require_password      = false   # anonymous visitors get a room instantly
allow_image_uploads   = false   # remove the heap/abuse vector
allow_link_previews   = false
wipe_persistent_every = "1d"    # clean slate every day

[caps]
max_rooms_per_user    = 10
max_messages_per_room = 200
max_image_bytes       = 0
max_mem_room_bytes    = 5000000
```
