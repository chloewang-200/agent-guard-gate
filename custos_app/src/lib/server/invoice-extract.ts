import type { InvoiceExtractionResult } from "@/lib/types";

const JSON_PROMPT =
  "Extract invoice fields as JSON only, no markdown. Keys: vendor (string), invoiceNumber (string), amount (number USD), dueDate (YYYY-MM-DD or empty), memo (string), paymentHints (short string describing how to pay).";

function parseInvoiceJson(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function inferRailFromText(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("venmo") || /@venmo|venmo\.com/i.test(text)) return "venmo_p2p";
  if (t.includes("ach") || t.includes("routing") || t.includes("account number")) return "ach";
  if (t.includes("wire") || t.includes("swift")) return "wire";
  if (t.includes("paypal")) return "paypal";
  return "merchant_card";
}

function sanitizeMultipartFilename(name: string): string {
  const base = name.trim() || "invoice";
  return base.replace(/[^\w.\-()+]/g, "_").slice(0, 128);
}

export function normalizeParsedInvoice(
  parsed: Record<string, unknown>,
  sourceFileId: string,
  confidence: number
): InvoiceExtractionResult {
  const amountRaw = parsed.amount;
  const amount =
    typeof amountRaw === "number"
      ? amountRaw
      : typeof amountRaw === "string"
        ? Number(amountRaw)
        : NaN;
  const vendor = String(parsed.vendor ?? "").trim();
  const paymentHints = String(parsed.paymentHints ?? parsed.memo ?? "");
  const rail =
    typeof parsed.railType === "string" && parsed.railType.trim()
      ? parsed.railType.trim()
      : inferRailFromText(`${vendor} ${paymentHints}`);

  return {
    vendor: vendor || undefined,
    invoiceNumber: String(parsed.invoiceNumber ?? "").trim() || undefined,
    amount: Number.isFinite(amount) ? amount : undefined,
    dueDate:
      typeof parsed.dueDate === "string" && parsed.dueDate.trim()
        ? parsed.dueDate.trim()
        : undefined,
    memo: String(parsed.memo ?? "").trim() || undefined,
    confidence,
    sourceFileId,
    railType: rail,
    rawFields: parsed,
  };
}

function placeholderExtraction(fileId: string, reason: string): InvoiceExtractionResult {
  return {
    memo: reason,
    confidence: 0.25,
    sourceFileId: fileId,
  };
}

async function forwardToInvoiceAgent(
  agentUrl: string,
  buf: Buffer,
  mimeType: string,
  filename: string,
  fileId: string
): Promise<InvoiceExtractionResult | null> {
  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(buf)], { type: mimeType }),
    sanitizeMultipartFilename(filename)
  );
  const r = await fetch(agentUrl, { method: "POST", body: form });
  if (!r.ok) return null;
  const data = (await r.json()) as Record<string, unknown>;
  return normalizeParsedInvoice(data, fileId, 0.88);
}

async function extractRawWithAnthropic(buf: Buffer, mime: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.CLAUDE_API_KEY;
  if (!apiKey) return null;

  const model =
    process.env.ANTHROPIC_MODEL ??
    process.env.CLAUDE_MODEL ??
    "claude-sonnet-4-20250514";
  const b64 = buf.toString("base64");

  let content: unknown[];
  if (mime === "application/pdf") {
    content = [
      {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: b64,
        },
      },
      { type: "text", text: JSON_PROMPT },
    ];
  } else if (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mime)) {
    content = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: mime,
          data: b64,
        },
      },
      { type: "text", text: JSON_PROMPT },
    ];
  } else {
    return null;
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) return null;
  const payload = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  return (
    payload.content
      ?.filter((item) => item.type === "text")
      .map((item) => item.text ?? "")
      .join("\n") ?? null
  );
}

async function extractRawWithOpenAI(buf: Buffer, mime: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mime)) return null;

  const model = process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini";
  const b64 = buf.toString("base64");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: JSON_PROMPT },
            { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
          ],
        },
      ],
      max_tokens: 700,
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  return data.choices?.[0]?.message?.content ?? null;
}

/**
 * Empire-style pipeline: optional microservice (`CUSTOS_INVOICE_AGENT_URL`), then Claude, then OpenAI (images), then placeholder.
 */
export async function runInvoiceExtractionPipeline(input: {
  fileId: string;
  buf: Buffer;
  mimeType: string;
  originalName: string;
}): Promise<InvoiceExtractionResult> {
  const { fileId, buf, mimeType, originalName } = input;

  const agentUrl = process.env.CUSTOS_INVOICE_AGENT_URL?.trim();
  if (agentUrl) {
    try {
      const fromAgent = await forwardToInvoiceAgent(agentUrl, buf, mimeType, originalName, fileId);
      if (fromAgent) return fromAgent;
    } catch {
      /* fall through */
    }
  }

  const anthropicRaw = await extractRawWithAnthropic(buf, mimeType);
  if (anthropicRaw) {
    const parsed = parseInvoiceJson(anthropicRaw);
    return normalizeParsedInvoice(parsed, fileId, 0.88);
  }

  const openaiRaw = await extractRawWithOpenAI(buf, mimeType);
  if (openaiRaw) {
    const parsed = parseInvoiceJson(openaiRaw);
    return normalizeParsedInvoice(parsed, fileId, 0.85);
  }

  const hints: string[] = [];
  if (!agentUrl) hints.push("Set CUSTOS_INVOICE_AGENT_URL to the invoice microservice POST /extract (e.g. custos_agents/invoice).");
  if (!(process.env.ANTHROPIC_API_KEY ?? process.env.CLAUDE_API_KEY)) {
    hints.push("Or set ANTHROPIC_API_KEY (or CLAUDE_API_KEY) for PDF and images.");
  }
  if (!process.env.OPENAI_API_KEY) {
    hints.push("Or set OPENAI_API_KEY for image uploads (not PDF).");
  }
  if (agentUrl) hints.unshift("Invoice agent URL returned an error — check the service logs.");

  return placeholderExtraction(fileId, hints.join(" "));
}
