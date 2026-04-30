import { NextResponse } from "next/server";

/** Minimal waitlist endpoint so marketing CTAs succeed without extra infra. Extend with Supabase / webhook later. */
export async function POST(request: Request) {
  let email: string | null = null;
  const ct = request.headers.get("content-type") ?? "";

  try {
    if (ct.includes("application/x-www-form-urlencoded")) {
      const body = await request.text();
      email = new URLSearchParams(body).get("email");
    } else if (ct.includes("application/json")) {
      const json = (await request.json()) as { email?: string };
      email = json.email ?? null;
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  if (!email?.trim()) {
    return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
