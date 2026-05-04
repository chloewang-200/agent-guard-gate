import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/** HttpOnly cookie used for GET /api/waitlist (admin export). Set by POST /api/admin-login. */
export const WAITLIST_ADMIN_COOKIE = "custos_waitlist_admin";

function signingSecret(): string {
  return (
    process.env.CUSTOS_WAITLIST_ADMIN_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    ""
  );
}

/** Username/password for /admin and GET /api/waitlist (also accepts legacy ADMIN_USER / ADMIN_PASS). */
export function waitlistAdminCredentials(): { user: string; pass: string } | null {
  const user =
    process.env.CUSTOS_WAITLIST_ADMIN_USER?.trim() ||
    process.env.ADMIN_USER?.trim() ||
    "";
  const pass =
    process.env.CUSTOS_WAITLIST_ADMIN_PASSWORD?.trim() ||
    process.env.ADMIN_PASS?.trim() ||
    "";
  if (!user || !pass) {
    return null;
  }
  return { user, pass };
}

/** Deterministic session value for a valid username + password (never send to the client except via Set-Cookie). */
export function waitlistAdminSessionToken(username: string, password: string): string {
  const secret = signingSecret();
  if (!secret) {
    throw new Error("Missing signing secret (CUSTOS_WAITLIST_ADMIN_SECRET, ADMIN_SESSION_SECRET, or NEXTAUTH_SECRET)");
  }
  return createHmac("sha256", secret).update(`${username}\n${password}`, "utf8").digest("hex");
}

export async function isWaitlistAdminRequest(): Promise<boolean> {
  const creds = waitlistAdminCredentials();
  const secret = signingSecret();
  if (!creds || !secret) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(WAITLIST_ADMIN_COOKIE)?.value;
  if (!token) {
    return false;
  }

  let expected: string;
  try {
    expected = waitlistAdminSessionToken(creds.user, creds.pass);
  } catch {
    return false;
  }

  try {
    const a = Buffer.from(token, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
