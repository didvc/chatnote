# Image Uploads

## Persistent rooms

Images uploaded in persistent rooms are written to `data/uploads/` with a random hex filename. They are served at `/uploads/<filename>` and referenced in messages as a normal URL.

Supported formats: PNG, JPEG, GIF, WebP.

## Ephemeral and incognito rooms

Images in in-memory rooms **never touch disk**. On upload, the server reads the file into a Buffer, encodes it as a base64 data-URL, and returns it to the client. The client embeds the data-URL directly in the message. No file is written anywhere.

This keeps the privacy guarantee intact but means every image byte lives in the Node heap. The `max_mem_room_bytes` cap limits total heap per room.

## Disabling uploads

Set `allow_image_uploads = false` in config.toml to disable the upload endpoint entirely. The image button disappears from the composer. Recommended on public demos.

## Size limit

Controlled by `caps.max_image_bytes` (default: 2 MB). Requests exceeding this limit receive a 413 response before any bytes are buffered into heap.
