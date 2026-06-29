# Import & Export

## Export

Click **export** in the top bar to download a JSON file of all your persistent rooms, including messages and tags. In-memory rooms (ephemeral/incognito) are not included — they are not persisted.

Format:

```json
{
  "app": "chatnote",
  "version": 1,
  "exportedAt": "2026-06-29T00:00:00.000Z",
  "rooms": [
    {
      "name": "My Notes",
      "createdAt": "...",
      "tags": ["work"],
      "messages": [
        { "body": "hello", "attach": [], "preview": null, "createdAt": "..." }
      ]
    }
  ]
}
```

## Import

Click **import json** on the home page and select a chatnote export file. Rooms are created as new persistent rooms under your account. Tags are preserved. Existing rooms are not modified.

The import respects all caps — if importing would exceed `max_rooms_per_user`, importing stops at the limit.

## Use cases

- **Backup**: export regularly, store the JSON file.
- **Migration**: export from one instance, import to another.
- **Demo cleanup**: export your notes before a scheduled wipe if you want to keep them.
