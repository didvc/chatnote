# Contributing to chatnote

Thank you for your interest in contributing.

## Prerequisites

- Node.js 20+
- npm 9+

## Local setup

```bash
git clone https://github.com/didvc/chatnote
cd chatnote
npm install
cp config.example.toml config.toml
npm run db:push
npm run dev
```

## Development workflow

1. Fork the repo and create a branch from `main`.
2. Make your changes. Keep commits focused and atomic.
3. Run `npm run build` to confirm a clean production build before opening a PR.
4. Open a pull request against `main`. Fill in the PR template.

## Code style

- TypeScript throughout. No `any` in new code without a comment explaining why.
- No new comments that just restate what the code does. Comments are for non-obvious invariants or workarounds.
- Keep security in mind: never add raw SQL without parameterisation; always sanitize rendered HTML.

## Bug reports

Use the bug report issue template. Include steps to reproduce, expected behaviour, and actual behaviour.

## Feature requests

Open a feature request issue first and discuss before implementing. This avoids wasted effort on changes that don't fit the project's direction.

## Security vulnerabilities

See [SECURITY.md](SECURITY.md).

## License

By contributing you agree that your contributions will be licensed under [Apache-2.0](LICENSE).
