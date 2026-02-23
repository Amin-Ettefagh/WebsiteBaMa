# Deployment

## Docker Compose (recommended)

```bash
docker compose up --build -d
```

Application URL:

`http://localhost:3022`

Stop and remove containers:

```bash
docker compose down
```

## Manual Docker build and run

```bash
docker build -t websitebama .
```

```bash
docker run -d --name websitebama -p 3022:3022 websitebama
```

## GitHub CI

A CI workflow is available at `.github/workflows/ci.yml`.
It runs:

1. Dependency install
2. Legacy asset sync
3. Lint
4. Production build
5. Docker image build check

## Persistent contact data

To persist contact submissions outside the container:

```bash
docker run -d --name websitebama -p 3022:3022 -v ${PWD}/data:/app/data websitebama
```

## Pre-deploy checklist

- `npm run sync:assets`
- `npm run lint`
- `npm run build`
- `docker compose up --build -d`
- Open `http://localhost:3022` and verify key pages

## Troubleshooting

- Port in use: update port mapping in `docker-compose.yml`.
- Missing images: run `npm run sync:remote`, then rebuild.
- Missing legacy CSS/JS: run `npm run sync:assets`, then rebuild.