import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { captureException } from "@/lib/observability";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export function toRouteErrorResponse(error: unknown, fallback = "Server error") {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
  captureException(error instanceof Error ? error : new Error(String(error)));
  return NextResponse.json(
    { message: error instanceof Error ? error.message : fallback },
    { status: 500 }
  );
}

/** When feature-flagged routes are disabled for this deployment. */
export function experimentalFeatureDisabledResponse() {
  return NextResponse.json(
    {
      code: "NOT_ENABLED",
      message:
        "This feature is disabled for this deployment. Enable CUSTOS_ENABLE_EXPERIMENTAL_FEATURES (or per-feature flags) after wiring storage and key management.",
    },
    { status: 501 },
  );
}
