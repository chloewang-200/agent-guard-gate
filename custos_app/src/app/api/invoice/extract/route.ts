import { NextResponse } from "next/server";
import { isInvoiceFeatureEnabled } from "@/lib/features";
import {
  experimentalFeatureDisabledResponse,
  requireSession,
  toRouteErrorResponse,
} from "@/lib/server-auth";
import { readInvoiceUpload } from "@/lib/server/invoice-upload-store";
import { runInvoiceExtractionPipeline } from "@/lib/server/invoice-extract";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isInvoiceFeatureEnabled()) {
      return experimentalFeatureDisabledResponse();
    }
    await requireSession();
    const body = await request.json();
    const fileId = body?.fileId as string | undefined;
    if (!fileId?.trim()) {
      return NextResponse.json({ message: "fileId required" }, { status: 400 });
    }

    const stored = await readInvoiceUpload(fileId.trim());
    if (!stored) {
      return NextResponse.json({ message: "Upload not found — upload again." }, { status: 404 });
    }

    const result = await runInvoiceExtractionPipeline({
      fileId: fileId.trim(),
      buf: stored.buf,
      mimeType: stored.mimeType,
      originalName: stored.originalName,
    });
    return NextResponse.json(result);
  } catch (e) {
    return toRouteErrorResponse(e, "Extract failed");
  }
}
