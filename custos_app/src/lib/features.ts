const enabled = (value: string | undefined) => value?.trim().toLowerCase() === "true";

/**
 * Server-side master switch for unfinished product surfaces.
 * Falls back to NEXT_PUBLIC_* for backwards compatibility.
 */
export function isExperimentalFeaturesEnabled(): boolean {
  return enabled(process.env.CUSTOS_ENABLE_EXPERIMENTAL_FEATURES)
    || enabled(process.env.NEXT_PUBLIC_CUSTOS_ENABLE_EXPERIMENTAL_FEATURES);
}

/** Optional per-feature override for invoice upload/extraction. */
export function isInvoiceFeatureEnabled(): boolean {
  return enabled(process.env.CUSTOS_ENABLE_INVOICE_FEATURES) || isExperimentalFeaturesEnabled();
}

/** Optional per-feature override for agent API key generation. */
export function isAgentApiKeyFeatureEnabled(): boolean {
  return enabled(process.env.CUSTOS_ENABLE_AGENT_API_KEYS) || isExperimentalFeaturesEnabled();
}

/**
 * Client-side visibility switch for invoice surfaces.
 * Requires NEXT_PUBLIC_* in browser builds.
 */
export function isInvoiceFeatureEnabledClient(): boolean {
  return enabled(process.env.NEXT_PUBLIC_CUSTOS_ENABLE_INVOICE_FEATURES)
    || enabled(process.env.NEXT_PUBLIC_CUSTOS_ENABLE_EXPERIMENTAL_FEATURES);
}

/** Client-side visibility switch for API key surfaces. */
export function isAgentApiKeyFeatureEnabledClient(): boolean {
  return enabled(process.env.NEXT_PUBLIC_CUSTOS_ENABLE_AGENT_API_KEYS)
    || enabled(process.env.NEXT_PUBLIC_CUSTOS_ENABLE_EXPERIMENTAL_FEATURES);
}
