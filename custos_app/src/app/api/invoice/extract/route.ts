import { NextResponse } from "next/server";
import type { InvoiceExtractionResult } from "@/lib/types";
import { isInvoiceFeatureEnabled } from "@/lib/features";
import {
  experimentalFeatureDisabledResponse,
  requireSession,
  toRouteErrorResponse,
} from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    if (!isInvoiceFeatureEnabled()) {
      return experimentalFeatureDisabledResponse();
    }
    await requireSession();
    const body = await request.json();
    const fileId = body?.fileId as string | undefined;
    if (!fileId) {
      return NextResponse.json({ message: "fileId required" }, { status: 400 });
    }
    // TODO: Call OCR/extraction service; return typed result
    const result: InvoiceExtractionResult = {
      vendor: "Acme Corp",
      invoiceNumber: "INV-2024-001",
      amount: 1250.0,
      dueDate: "2024-04-15",
      memo: "Q1 services",
      confidence: 0.92,
      sourceFileId: fileId,
    };
    return NextResponse.json(result);
  } catch (e) {
    return toRouteErrorResponse(e, "Extract failed");
  }
}
