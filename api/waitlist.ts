type WaitlistBody = {
  email?: string;
};

const endpoint = process.env.WAITLIST_ENDPOINT;

const getEmailFromBody = (body: unknown): string | undefined => {
  if (!body) return undefined;
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body) as WaitlistBody;
      return parsed.email;
    } catch (error) {
      const params = new URLSearchParams(body);
      return params.get("email") ?? undefined;
    }
  }
  if (typeof body === "object") {
    return (body as WaitlistBody).email;
  }
  return undefined;
};

export default async function handler(req: any, res: any) {
  if (!endpoint) {
    res.status(500).json({ ok: false, error: "Missing WAITLIST_ENDPOINT." });
    return;
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    try {
      const response = await fetch(endpoint);
      const text = await response.text();
      if (!response.ok) {
        res.status(response.status).json({ ok: false, error: "Upstream waitlist failed.", details: text });
        return;
      }
      try {
        res.status(response.status).json(JSON.parse(text));
      } catch (error) {
        res.status(response.status).json({ ok: true, raw: text });
      }
      return;
    } catch (error) {
      console.error("Waitlist GET failed", error);
      res.status(500).json({ ok: false, error: "Failed to fetch waitlist." });
      return;
    }
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  const email = getEmailFromBody(req.body);
  if (!email) {
    res.status(400).json({ ok: false, error: "Missing email." });
    return;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: new URLSearchParams({ email }),
    });

    if (!response.ok) {
      const details = await response.text();
      res.status(502).json({ ok: false, error: "Upstream waitlist failed.", details });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Waitlist POST failed", error);
    res.status(500).json({ ok: false, error: "Server error." });
  }
}
