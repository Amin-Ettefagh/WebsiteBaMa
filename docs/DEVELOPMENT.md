# Development

## Prerequisites

- Node.js 20+
- npm

## Local setup

```bash
npm install
npm run sync:assets
npm run dev
```

Open `http://localhost:3022`.

## Common commands

- `npm run lint`
- `npm run build`
- `npm run start`
- `npm run sync:assets`
- `npm run sync:remote`
- `npm run sync:all`

## Working with legacy content

1. Update files under `legacy/`.
2. Run `npm run sync:assets` to refresh `public/legacy`.
3. If external URLs changed, run `npm run sync:remote`.

## Contact API output

Submissions are appended to `data/contact-requests.jsonl`.

## Coding standards

- Keep code comments in English.
- Keep docs in English.
- Reuse constants from `lib/site.ts` instead of hardcoding brand/domain values.