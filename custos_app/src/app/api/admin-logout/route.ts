import { NextResponse } from "next/server";
import { WAITLIST_ADMIN_COOKIE } from "@/lib/waitlist-admin-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(WAITLIST_ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return res;
}
