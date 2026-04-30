# Agent Guard Gate + Custos (Single App Runtime)

This repository now runs as a single Next.js application from `custos_app`, with the marketing landing and product app served together.

## Local Development

```sh
npm install
npm run dev              # Vite marketing site (Custos landing)
npm run dev:custos     # Custos Next.js app — run in a second terminal for “Try now”
```

- **Marketing (Vite):** `http://localhost:8080` — root `npm run dev`
- **Custos (Next):** `http://localhost:3000` — `npm run dev:custos` (API + `/login`, `/overview`, …)
- **Try now** on the marketing header links to `http://localhost:3000/login` in dev (or `VITE_CUSTOS_APP_URL` if set).

For a **single-host** production deploy, use the **Custos** Vercel project (`custos_app` root directory); the unified Next app serves landing + product on one URL.

## Scripts

- `npm run dev` / `npm run dev:marketing` — Vite marketing dev server on port **8080**
- `npm run dev:custos` — Next.js (`custos_app`) dev server on port **3000**
- `npm run build` — build the unified Next.js app (`custos_app`)
- `npm run preview` — production Next.js server on port **3000**

Legacy marketing build:

- `npm run build:marketing`
- `npm run preview:marketing`
