# Agent Guard Gate + Custos (Single App Runtime)

This repository now runs as a single Next.js application from `custos_app`, with the marketing landing and product app served together.

## Local Development

```sh
npm install
npm run dev
```

- App URL: `http://localhost:8080`
- Marketing landing: `/`
- Product auth/dashboard: `/login`, `/overview`, and other existing Custos routes
- Landing page "Try now" points to `/login` in the same app

## Scripts

- `npm run dev` - start the unified Next.js app (`custos_app`) on port `8080`
- `npm run build` - build the unified Next.js app
- `npm run preview` - start the production Next.js server on port `8080`

Legacy marketing-only Vite scripts are still available temporarily:

- `npm run dev:marketing`
- `npm run build:marketing`
- `npm run preview:marketing`
