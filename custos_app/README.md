# Custos

**Spend governance for AI agents.** Custos is the control layer and decisioning layer for agent payments. Connect AI agents, assign them to wallets, define policies and limits, and review transaction requests.

## Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS** + design tokens aligned with the marketing site (Plaid-inspired fintech)
- **shadcn/ui** (Radix primitives)
- **TanStack Query** for data fetching
- **react-hook-form + zod** for forms and validation
- **next-auth** (email magic link via SMTP + DynamoDB adapter)
- **next-themes** for dark mode support

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and set:

   - `NEXTAUTH_URL` (e.g. `http://localhost:3000` in dev; **HTTPS canonical URL in production**)
   - `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`)
   - Email / magic link: `EMAIL_SERVER_*`, `EMAIL_FROM`, plus `AWS_REGION` and `NEXTAUTH_DYNAMODB_TABLE` for the DynamoDB adapter
   - Optional: `NEXT_PUBLIC_API_URL` if the browser must call a different API host (otherwise same-origin `/api`)
   - Feature gates: `CUSTOS_ENABLE_EXPERIMENTAL_FEATURES=false` (plus optional `CUSTOS_ENABLE_INVOICE_FEATURES` / `CUSTOS_ENABLE_AGENT_API_KEYS` overrides)
   - Optional client-side UI mirrors: `NEXT_PUBLIC_CUSTOS_ENABLE_EXPERIMENTAL_FEATURES` (and optional per-feature `NEXT_PUBLIC_*` variants)
   - Optional rate limits: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for `POST /api/auth/signin/email`; optionally set `CUSTOS_ENABLE_API_RATE_LIMIT=true` to throttle non-auth `POST /api/*`
- Optional observability: `SENTRY_DSN` (plus optional `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`) to enable Sentry reporting from shared observability helpers

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to `/login`; after sign-in they land on `/overview`.

## Production checklist

- **Secrets:** Strong `NEXTAUTH_SECRET`; never commit `.env.local`.
- **URLs:** `NEXTAUTH_URL` matches the public HTTPS origin (including `www` vs apex).
- **Email:** SMTP/SES credentials and `EMAIL_FROM` aligned with your domain (SPF/DKIM/DMARC).
- **DynamoDB:** `NEXTAUTH_DYNAMODB_TABLE` exists; IAM role or keys follow least privilege.
- **Feature flags:** Leave `CUSTOS_ENABLE_EXPERIMENTAL_FEATURES=false` (and per-feature gates off) until invoice storage, OCR, and API key lifecycle are production-ready. Set `NEXT_PUBLIC_*` mirrors only if browser-only UI toggles must follow the same rollout.
- **Rate limits (recommended):** Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` so middleware can throttle `POST /api/auth/signin/email` (and optionally non-auth `POST /api/*` via `CUSTOS_ENABLE_API_RATE_LIMIT=true`).
- **Rate limits (fallback):** If Upstash is not configured yet, enforce equivalent limits at the edge/proxy layer (e.g. Cloudflare WAF rate limiting, Vercel Firewall/Edge Config rules) for `POST /api/auth/signin/email` at minimum.
- **Errors / APM:** 5xx paths call `captureException` in `@/lib/observability`; middleware denials emit low-cardinality notices via `captureMessage`. Without `SENTRY_DSN`, logs stay local (`console`). With `SENTRY_DSN`, events are sent to Sentry.
- **Marketing site:** If you use the `agent-guard-gate` repo, set `VITE_CUSTOS_APP_URL` to this app’s production URL for the “Try now” link.
- **Auth dependency note:** `next-auth@4` currently expects `nodemailer@^7`, so keep `nodemailer` on v7 until that peer range changes upstream; then re-evaluate upgrading and remove this constraint.

## Monorepo sync workflow

For now, treat this repo (`/Users/yb/workspace/custos_app`) as the source of truth for the product app.

After changing hardening/security files here, mirror them into `agent-guard-gate/custos_app`:

```bash
./scripts/sync-to-agent-guard-gate.sh
```

## Structure

- **`/app`** — Routes: auth (login), dashboard (overview, agents, wallets, transactions, review-queue, templates, invoice, settings).
- **`/components`** — Layout (AppShell, Sidebar, Topbar, AccountMenu), UI, domain components.
- **`/lib`** — Types, API client, validators, constants, auth config, `middleware.ts` entry for Next.
- **`/providers`** — SessionProvider, QueryClient, ThemeProvider.

## API

Route handlers under `/app/api` implement the typed JSON surface. Authenticated routes use `requireSession()` from `@/lib/server-auth`. Dashboard HTML routes are also protected by **`src/middleware.ts`** (JWT) in addition to the client layout.

Key endpoints (see `/lib/api` and `/app/api`):

- Agents: `GET/POST /api/agents`, `GET/PATCH/DELETE /api/agents/:id`, `POST /api/agents/:id/api-key` (API key route returns **501** unless experimental features are enabled)
- Wallets, transactions, review queue, templates
- Invoice: `POST /api/invoice/upload`, `POST /api/invoice/extract` (**501** unless experimental features are enabled)

## Go-live verification

- `npm run lint` and `npm run build` pass in CI and from a clean checkout.
- Runtime environment has NextAuth + email + Dynamo values configured (no dev-only placeholders).
- Magic-link flow works end to end (`/login` request, callback, dashboard load).
- A protected API returns `401` when called without an authenticated session.
- Marketing app points `VITE_CUSTOS_APP_URL` to the deployed HTTPS Custos URL.

## Design

Styles follow the marketing site (agent-guard-gate): Inter font, primary blue `hsl(217 91% 60%)`, slate neutrals, subtle shadows, `--radius: 0.625rem`. Use semantic classes: `bg-primary`, `text-foreground`, `border-border`, `rounded-lg`, etc.

## Testing mode

The **Add Funds** flow is explicitly in testing mode: it shows Venmo instructions and a placeholder for a QR code, with no real payment rails. The UI is built so real funding (e.g. Stripe) can replace this later.
