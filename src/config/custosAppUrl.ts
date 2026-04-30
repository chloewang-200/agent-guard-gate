/**
 * Base URL for the Custos Next app (`custos_app`). Set `VITE_CUSTOS_APP_URL` for
 * production/preview builds (e.g. https://your-app.vercel.app). In dev, defaults
 * to port 8080 (Next dev); Vite marketing runs on 5173 to avoid clashing. Override
 * with `VITE_CUSTOS_APP_URL` in a root `.env.local` if needed.
 */
export function getCustosAppUrl(): string {
  const fromEnv = import.meta.env.VITE_CUSTOS_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:8080";
  return "";
}

/** Handoff URL for marketing “Try now” → platform sign-in (same tab). */
export function getCustosPlatformLoginUrl(): string {
  const base = getCustosAppUrl();
  if (!base) return "";
  return `${base}/login`;
}
