import { NextResponse } from "next/server";
import { WAITLIST_ADMIN_COOKIE, waitlistAdminCredentials, waitlistAdminSessionToken } from "@/lib/waitlist-admin-auth";

export async function POST(request: Request) {
  const creds = waitlistAdminCredentials();

  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const username = body.username?.trim();
  const password = body.password?.trim();
  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "Missing credentials" }, { status: 400 });
  }
  if (!creds) {
    return NextResponse.json({ ok: false, error: "Admin not configured" }, { status: 503 });
  }
  if (username !== creds.user || password !== creds.pass) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let token: string;
  try {
    token = waitlistAdminSessionToken(creds.user, creds.pass);
  } catch {
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(WAITLIST_ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
