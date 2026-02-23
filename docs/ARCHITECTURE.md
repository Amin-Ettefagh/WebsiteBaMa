# Architecture

## Overview

This project serves a legacy Website Bama archive through a modern Next.js runtime.
The server reads raw HTML files from `legacy/`, transforms them, and returns clean output through App Router pages.

## Runtime flow

1. `app/[[...slug]]/page.tsx` captures all routes.
2. `getLegacyPage` in `lib/legacy.ts` resolves the best matching source HTML file.
3. `transformLegacyHtml` normalizes links, assets, metadata, colors, and branding.
4. The transformed HTML is injected into the response.

## Core modules

- `lib/site.ts`
  - Centralized site metadata
  - Canonical domain configuration
  - Legacy host alias mapping
  - Shared paths for legacy stylesheet preload

- `lib/legacy.ts`
  - Route-to-file resolution
  - Host/path normalization
  - Asset local fallback logic (`public/legacy`, `public/remote`)
  - Brand replacement for legacy variants
  - Theme/color adaptation

- `scripts/sync-legacy-assets.js`
  - Copies required static directories from `legacy/` to `public/legacy/`
  - Supports both old and new domain source folders

- `scripts/sync-remote-assets.js`
  - Scans legacy text files for remote image URLs
  - Downloads and mirrors them in `public/remote/`

## Data handling

- Contact submissions are stored in `data/contact-requests.jsonl`.
- Each line is one JSON object with a timestamp.

## Caching strategy

`getLegacyPage` is wrapped with React `cache()` to reduce repeated disk reads and HTML parsing overhead.