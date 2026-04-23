import type { InvoiceExtractionResult } from "@/lib/types";
import { apiPost, getBaseUrl } from "./client";

export async function uploadInvoice(file: File): Promise<{ fileId: string; url?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/invoice/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function extractInvoice(fileId: string): Promise<InvoiceExtractionResult> {
  return apiPost<InvoiceExtractionResult>("/api/invoice/extract", { fileId });
}
