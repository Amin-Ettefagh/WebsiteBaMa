# Configuration

## Site identity

Main site configuration lives in `lib/site.ts`.

- `SITE_NAME`
- `SITE_NAME_FA`
- `SITE_TAGLINE`
- `SITE_DESCRIPTION`
- `SITE_PHONE`
- `SITE_SUPPORT_EMAIL`
- `SITE_LANG`
- `SITE_DIR`

## Domains

Canonical domains are defined in `DOMAINS` in `lib/site.ts`.
Legacy aliases from old hosts are mapped in `LEGACY_HOST_ALIASES`.

## Theme

- Global CSS tokens and compatibility overrides are in `app/globals.css`.
- Initial theme mode is controlled in `app/layout.tsx` via `data-theme`.
- Client-side toggle logic is implemented in `components/ThemeToggleClient.tsx`.

## Port

- Runtime port is configured with `PORT`.
- Default value is `3022`.
- `package.json`, `Dockerfile`, and `docker-compose.yml` are aligned to this port.

## Environment variables

Copy `.env.example` to `.env` and adjust values as needed.