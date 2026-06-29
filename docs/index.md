---
layout: home

hero:
  name: chatnote
  text: Note-to-self chatrooms
  tagline: Infinite rooms. Three memory models. Self-hosted, Astro SSR + SQLite.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/didvc/chatnote

features:
  - title: Three room types
    details: Persistent rooms save to SQLite. Ephemeral rooms live in Node heap with optional TTL. Incognito rooms clear when the tab closes — none of the three write to disk.
  - title: Markdown + images
    details: Messages render server-side Markdown (sanitized). Attach images — disk-backed for persistent rooms, inline data-URL for in-memory ones.
  - title: Tags, search, import/export
    details: Tag rooms, search across names, messages, and tags. Export persistent rooms to JSON, import them back on any instance.
  - title: Demo-ready config
    details: require_password = false gives anonymous visitors a room without a login screen. Scheduled wipes and per-user caps keep public demos safe.
---
