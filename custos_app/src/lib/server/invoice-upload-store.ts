import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const ROOT = path.join(process.cwd(), ".invoice-uploads");

/** Prevent path traversal — IDs we generate always match this. */
const SAFE_ID = /^inv_[a-zA-Z0-9_-]+$/;

export function isSafeInvoiceFileId(id: string): boolean {
  return SAFE_ID.test(id) && !id.includes("..");
}

const MAX_BYTES = 10 * 1024 * 1024;

const OBJECT_KEY_DOCUMENT = "document";
const OBJECT_KEY_META = "meta.json";

function useSupabaseInvoiceStorage(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

let supabaseAdmin: SupabaseClient | null | undefined;

function getSupabaseAdmin(): SupabaseClient | null {
  if (!useSupabaseInvoiceStorage()) return null;
  if (supabaseAdmin !== undefined) return supabaseAdmin;

  const url = process.env.SUPABASE_URL!.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  supabaseAdmin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabaseAdmin;
}

function invoiceBucket(): string {
  return process.env.SUPABASE_INVOICE_BUCKET?.trim() || "invoice-uploads";
}

async function blobToBuffer(blob: Blob): Promise<Buffer> {
  return Buffer.from(await blob.arrayBuffer());
}

export async function saveInvoiceUpload(file: File): Promise<{ id: string }> {
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    throw new Error("File too large (max 10MB)");
  }

  const meta = {
    originalName: file.name.replace(/[^\w.\-()+ ]/g, "_").slice(0, 240),
    mimeType: file.type?.trim() || "application/octet-stream",
  };

  const id = `inv_${Date.now()}_${randomBytes(4).toString("hex")}`;
  const admin = getSupabaseAdmin();

  if (admin) {
    const bucket = invoiceBucket();
    const basePath = `${id}/${OBJECT_KEY_DOCUMENT}`;
    const metaPath = `${id}/${OBJECT_KEY_META}`;

    const { error: docErr } = await admin.storage.from(bucket).upload(basePath, buf, {
      contentType: meta.mimeType,
      upsert: false,
    });
    if (docErr) {
      throw new Error(
        docErr.message.includes("Bucket not found")
          ? `Supabase Storage bucket "${bucket}" missing — create it (private) in the Supabase dashboard.`
          : docErr.message
      );
    }

    const { error: metaErr } = await admin.storage.from(bucket).upload(
      metaPath,
      Buffer.from(JSON.stringify(meta)),
      { contentType: "application/json", upsert: false }
    );
    if (metaErr) {
      await admin.storage.from(bucket).remove([basePath]).catch(() => undefined);
      throw new Error(metaErr.message);
    }

    return { id };
  }

  await mkdir(ROOT, { recursive: true });
  await writeFile(path.join(ROOT, `${id}.bin`), buf);
  await writeFile(path.join(ROOT, `${id}.json`), JSON.stringify(meta));
  return { id };
}

export async function readInvoiceUpload(
  id: string
): Promise<{ buf: Buffer; mimeType: string; originalName: string } | null> {
  if (!isSafeInvoiceFileId(id)) return null;

  const admin = getSupabaseAdmin();
  if (admin) {
    const bucket = invoiceBucket();
    const docPath = `${id}/${OBJECT_KEY_DOCUMENT}`;
    const metaPath = `${id}/${OBJECT_KEY_META}`;

    const { data: metaBlob, error: metaErr } = await admin.storage.from(bucket).download(metaPath);
    const { data: docBlob, error: docErr } = await admin.storage.from(bucket).download(docPath);
    if (metaErr || docErr || !metaBlob || !docBlob) {
      return null;
    }

    try {
      const metaText = await metaBlob.text();
      const meta = JSON.parse(metaText) as { originalName: string; mimeType: string };
      const buf = await blobToBuffer(docBlob);
      return {
        buf,
        mimeType: meta.mimeType || "application/octet-stream",
        originalName: meta.originalName || "invoice",
      };
    } catch {
      return null;
    }
  }

  try {
    const metaRaw = await readFile(path.join(ROOT, `${id}.json`), "utf8");
    const meta = JSON.parse(metaRaw) as { originalName: string; mimeType: string };
    const buf = await readFile(path.join(ROOT, `${id}.bin`));
    return { buf, mimeType: meta.mimeType, originalName: meta.originalName };
  } catch {
    return null;
  }
}

/** Where invoice blobs are stored (for logs / health checks). */
export function invoiceUploadStorageMode(): "supabase" | "local" {
  return useSupabaseInvoiceStorage() ? "supabase" : "local";
}
