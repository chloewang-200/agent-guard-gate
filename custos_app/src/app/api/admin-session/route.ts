import { NextResponse } from "next/server";
import { isWaitlistAdminRequest } from "@/lib/waitlist-admin-auth";

export async function GET() {
  if (await isWaitlistAdminRequest()) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
