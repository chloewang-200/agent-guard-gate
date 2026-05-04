import { NextResponse } from "next/server";
import { isWaitlistAdminRequest } from "@/lib/waitlist-admin-auth";

const endpoint = process.env.WAITLIST_ENDPOINT;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseTable = process.env.SUPABASE_WAITLIST_TABLE || "waitlist";

const hasSupabase = Boolean(supabaseUrl && supabaseKey);

/** Public POST may come from the Vite marketing site (another origin); keep responses readable to the browser. */
const waitlistPostCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

async function readJsonLoose(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: waitlistPostCors });
}

/** Admin-only: list signups (Supabase or upstream GET). */
export async function GET() {
  const authed = await isWaitlistAdminRequest();
  if (!authed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!endpoint && !hasSupabase) {
    return NextResponse.json({ ok: false, error: "Missing WAITLIST_ENDPOINT or Supabase." }, { status: 500 });
  }

  try {
    if (hasSupabase) {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/${supabaseTable}?select=email,created_at&order=created_at.desc`,
        {
          headers: {
            apikey: supabaseKey as string,
            Authorization: `Bearer ${supabaseKey}`,
          },
        },
      );
      const data = await readJsonLoose(response);
      if (!response.ok) {
        return NextResponse.json(
          { ok: false, error: "Supabase waitlist failed.", details: data },
          { status: response.status },
        );
      }
      return NextResponse.json(data);
    }

    const response = await fetch(endpoint as string);
    const text = await response.text();
    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: "Upstream waitlist failed.", details: text },
        { status: response.status },
      );
    }
    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ ok: true, raw: text });
    }
  } catch (e) {
    console.error("Waitlist GET failed", e);
    return NextResponse.json({ ok: false, error: "Failed to fetch waitlist." }, { status: 500 });
  }
}

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
    return NextResponse.json(
      { ok: false, error: "Invalid body" },
      { status: 400, headers: waitlistPostCors },
    );
  }

  if (!email?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Missing email" },
      { status: 400, headers: waitlistPostCors },
    );
  }

  const trimmed = email.trim();

  if (!endpoint && !hasSupabase) {
    return NextResponse.json(
      {
        ok: true,
        persisted: false,
        warning:
          "Nothing was saved: this server has no WAITLIST_ENDPOINT and no Supabase credentials (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).",
      },
      { headers: waitlistPostCors },
    );
  }

  try {
    if (hasSupabase) {
      const response = await fetch(`${supabaseUrl}/rest/v1/${supabaseTable}`, {
        method: "POST",
        headers: {
          apikey: supabaseKey as string,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await readJsonLoose(response);
      if (!response.ok) {
        return NextResponse.json(
          { ok: false, error: "Supabase waitlist failed.", details: data },
          { status: response.status, headers: waitlistPostCors },
        );
      }

      return NextResponse.json(
        { ok: true, persisted: true, ...(data != null ? { data } : {}) },
        { headers: waitlistPostCors },
      );
    }

    const response = await fetch(endpoint as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: new URLSearchParams({ email: trimmed }),
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json(
        { ok: false, error: "Upstream waitlist failed.", details },
        { status: 502, headers: waitlistPostCors },
      );
    }

    return NextResponse.json({ ok: true, persisted: true }, { headers: waitlistPostCors });
  } catch (e) {
    console.error("Waitlist POST failed", e);
    return NextResponse.json(
      { ok: false, error: "Server error." },
      { status: 500, headers: waitlistPostCors },
    );
  }
}
