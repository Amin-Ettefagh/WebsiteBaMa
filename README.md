# Website Bama

A production-ready Next.js application that renders a legacy HTML archive with modern routing, branding normalization, and deployable Docker artifacts.

## Why this project exists

The original website content is stored as static legacy HTML. This project keeps that content as the source of truth while applying runtime transformations so the final site is consistent with the new Website Bama brand.

## Key capabilities

- Catch-all route rendering for legacy pages with Next.js App Router
- Automatic URL and asset rewriting to local paths
- Brand normalization from old Mihan Shop variants to Website Bama
- Theme token overrides for a consistent visual identity
- Docker multi-stage production build
- CI-ready repository layout for GitHub

## Tech stack

- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Node.js 20+
- Docker / Docker Compose

## Default runtime port

`3022`

## Quick start

```bash
npm install
npm run sync:assets
npm run dev
```

Open `http://localhost:3022`.

## Production build

```bash
npm run build
npm run start
```

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build -d
```

Open `http://localhost:3022`.

Stop:

```bash
docker compose down
```

## Scripts

- `npm run dev`: start development server on port `3022`
- `npm run build`: create production build
- `npm run start`: run production server on port `3022`
- `npm run lint`: run lint checks
- `npm run sync:assets`: copy legacy assets into `public/legacy`
- `npm run sync:remote`: download remote legacy assets into `public/remote`
- `npm run sync:all`: run both sync jobs

## Environment variables

Use `.env.example` as reference.

- `PORT`: server port (default: `3022`)

## Project structure

```text
.
+- app/
¦  +- [[...slug]]/page.tsx       # Catch-all page renderer
¦  +- api/contact/route.ts       # Contact endpoint (JSONL storage)
¦  +- globals.css                # Global theme and compatibility styles
¦  +- layout.tsx                 # Metadata and legacy stylesheet preload
+- components/                   # Shared UI/client helpers
+- docs/                         # Architecture, config, development, deployment
+- legacy/                       # Raw archived HTML sources
+- lib/
¦  +- legacy.ts                  # Transformation pipeline
¦  +- site.ts                    # Branding/domain/site constants
+- public/
¦  +- legacy/                    # Synced static assets from legacy archive
¦  +- remote/                    # Downloaded external assets
+- scripts/                      # Asset sync and normalization scripts
+- Dockerfile
+- docker-compose.yml
+- README.md
```

## GitHub readiness checklist

- TypeScript strict mode enabled
- Dockerfile and Compose included
- CI workflow included in `.github/workflows/ci.yml`
- English docs in `README.md` and `docs/*`
- Consistent branding/domain constants in `lib/site.ts`

## Contact form storage

Submissions are appended to `data/contact-requests.jsonl` as JSON Lines.

## Additional documentation

- `docs/ARCHITECTURE.md`
- `docs/CONFIGURATION.md`
- `docs/DEVELOPMENT.md`
- `docs/DEPLOYMENT.md`

## Contributing

See `CONTRIBUTING.md`.