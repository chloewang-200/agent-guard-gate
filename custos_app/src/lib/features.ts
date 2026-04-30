const enabled = (value: string | undefined) => value?.trim().toLowerCase() === "true";

/** Explicit opt-out (useful when invoice defaults on in development). */
const disabled = (value: string | undefined) => value?.trim().toLowerCase() === "false";

/**
 * Server-side master switch for unfinished product surfaces.
 * Falls back to NEXT_PUBLIC_* for backwards compatibility.
 */
export function isExperimentalFeaturesEnabled(): boolean {
  return enabled(process.env.CUSTOS_ENABLE_EXPERIMENTAL_FEATURES)
    || enabled(process.env.NEXT_PUBLIC_CUSTOS_ENABLE_EXPERIMENTAL_FEATURES);
}

/**
 * Invoice upload / extraction surfaces.
 * Defaults ON when `NODE_ENV === "development"` so local `next dev` shows entry points without env.
 * In production builds, set `CUSTOS_ENABLE_INVOICE_FEATURES=true` or `NEXT_PUBLIC_*` on the client.
 */
export function isInvoiceFeatureEnabled(): boolean {
  if (disabled(process.env.CUSTOS_ENABLE_INVOICE_FEATURES)) return false;
  if (enabled(process.env.CUSTOS_ENABLE_INVOICE_FEATURES)) return true;
  if (isExperimentalFeaturesEnabled()) return true;
  return process.env.NODE_ENV === "development";
}

/** Optional per-feature override for agent API key generation. */
export function isAgentApiKeyFeatureEnabled(): boolean {
  return enabled(process.env.CUSTOS_ENABLE_AGENT_API_KEYS) || isExperimentalFeaturesEnabled();
}

/**
 * Client-side visibility switch for invoice surfaces.
 * Defaults ON in development builds (same as server). Production requires env flags.
 */
export function isInvoiceFeatureEnabledClient(): boolean {
  if (disabled(process.env.NEXT_PUBLIC_CUSTOS_ENABLE_INVOICE_FEATURES)) return false;
  if (enabled(process.env.NEXT_PUBLIC_CUSTOS_ENABLE_INVOICE_FEATURES)) return true;
  if (enabled(process.env.NEXT_PUBLIC_CUSTOS_ENABLE_EXPERIMENTAL_FEATURES)) return true;
  return process.env.NODE_ENV === "development";
}

/** Client-side visibility switch for API key surfaces. */
export function isAgentApiKeyFeatureEnabledClient(): boolean {
  return enabled(process.env.NEXT_PUBLIC_CUSTOS_ENABLE_AGENT_API_KEYS)
    || enabled(process.env.NEXT_PUBLIC_CUSTOS_ENABLE_EXPERIMENTAL_FEATURES);
}
