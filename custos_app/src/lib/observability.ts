import * as Sentry from "@sentry/nextjs";

type ObservabilityContext = Record<string, string | number | boolean | null | undefined>;

let sentryInitialized = false;

function parseSampleRate(rawValue: string | undefined): number {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function hasSentryDsn(): boolean {
  return Boolean(process.env.SENTRY_DSN?.trim());
}

export function initObservability(): void {
  if (sentryInitialized || !hasSentryDsn()) {
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enabled: process.env.NODE_ENV === "production",
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: parseSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE),
    sendDefaultPii: false,
  });

  sentryInitialized = true;
}

export function captureException(error: unknown, context?: ObservabilityContext): void {
  const normalizedError = toError(error);
  initObservability();

  if (hasSentryDsn()) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext("custos", context);
      }
      Sentry.captureException(normalizedError);
    });

    if (process.env.NODE_ENV !== "production") {
      console.error("[custos:error]", context, normalizedError);
    }
    return;
  }

  console.error("[custos:error]", context, normalizedError);
}

export function captureMessage(message: string, context?: ObservabilityContext): void {
  initObservability();

  if (hasSentryDsn()) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext("custos", context);
      }
      Sentry.captureMessage(message);
    });
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn("[custos:notice]", message, context);
  }
}
