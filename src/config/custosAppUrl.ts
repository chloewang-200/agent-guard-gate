/**
 * URL for the Custos Next app (`custos_app` workspace). Set `VITE_CUSTOS_APP_URL`
 * for production builds; in dev, falls back to the default `next dev` origin.
 */
export function getCustosAppUrl(): string {
  const fromEnv = import.meta.env.VITE_CUSTOS_APP_URL?.trim();
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return "http://localhost:3000";
  return "";
}
