# Getting Started

## Requirements

- Node.js 20+
- npm 9+

## Install

```bash
git clone https://github.com/didvc/chatnote
cd chatnote
npm install
```

## Configure

```bash
cp config.example.toml config.toml
```

Edit `config.toml` as needed. The defaults (password required, uploads on, previews on, no scheduled wipe) are appropriate for personal self-hosted use.

## Initialize the database

```bash
npm run db:push
```

This creates `data/chatnote.db` (SQLite). The `data/` directory is created automatically.

## Run (development)

```bash
npm run dev
# → http://localhost:4321
```

## Run (production)

```bash
npm run build
npm start
# → http://localhost:4321 (or PORT env var)
```

Register an account on first visit, then create rooms and start writing.
