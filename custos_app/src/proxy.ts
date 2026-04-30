import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { captureMessage } from "@/lib/observability";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const signInEmailLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(8, "15 m"),
      prefix: "custos:ratelimit:auth:signin-email",
    })
  : null;

const apiPostLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "1 m"),
      prefix: "custos:ratelimit:api-post",
    })
  : null;

const enableApiRateLimit = process.env.CUSTOS_ENABLE_API_RATE_LIMIT === "true";

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getRequestIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

async function authRateLimitKey(req: NextRequest): Promise<string> {
  const ip = getRequestIp(req);

  if (req.nextUrl.pathname === "/api/auth/signin/email" && req.method === "POST") {
    const contentType = req.headers.get("content-type") ?? "";
    try {
      if (contentType.includes("application/x-www-form-urlencoded")) {
        const text = await req.clone().text();
        const email = new URLSearchParams(text).get("email");
        if (email) {
          return `auth:${ip}:${await sha256Hex(email.trim().toLowerCase())}`;
        }
      }
    } catch {
      // If body parsing fails, keep rate limiting by IP only.
    }
  }

  return `auth:${ip}`;
}

function apiRateLimitKey(req: NextRequest): string {
  return `api:${getRequestIp(req)}`;
}

/**
 * Next.js 16 runs this file on the Edge. `next-auth/jwt`'s `getToken()` here often disagrees with
 * Node `/api/auth/session` on Vercel (cookie / decoding differences), which caused infinite
 * login ↔ dashboard redirects. Dashboard auth is enforced client-side + API `requireSession()`.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/api/auth/signin/email" && req.method === "POST") {
    if (signInEmailLimiter) {
      const { success, reset } = await signInEmailLimiter.limit(await authRateLimitKey(req));
      if (!success) {
        captureMessage("auth_signin_rate_limited", { route: "/api/auth/signin/email" });
        const response = NextResponse.json(
          { message: "Too many auth requests. Try again later." },
          { status: 429 },
        );
        const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
        response.headers.set("Retry-After", retryAfterSeconds.toString());
        return response;
      }
    }
    return NextResponse.next();
  }

  if (
    enableApiRateLimit &&
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/") &&
    req.method === "POST" &&
    apiPostLimiter
  ) {
    const { success, reset } = await apiPostLimiter.limit(apiRateLimitKey(req));
    if (!success) {
      captureMessage("api_post_rate_limited", { route: "/api/*", method: "POST" });
      const response = NextResponse.json(
        { message: "Too many API requests. Try again later." },
        { status: 429 },
      );
      const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      response.headers.set("Retry-After", retryAfterSeconds.toString());
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/api/auth/:path*",
    "/api/:path*",
  ],
};
