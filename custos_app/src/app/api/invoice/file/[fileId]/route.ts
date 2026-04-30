import { NextResponse } from "next/server";
import { isInvoiceFeatureEnabled } from "@/lib/features";
import {
  experimentalFeatureDisabledResponse,
  requireSession,
  toRouteErrorResponse,
} from "@/lib/server-auth";
import { readInvoiceUpload } from "@/lib/server/invoice-upload-store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    if (!isInvoiceFeatureEnabled()) {
      return experimentalFeatureDisabledResponse();
    }
    await requireSession();
    const { fileId } = await params;
    const decoded = decodeURIComponent(fileId);
    const data = await readInvoiceUpload(decoded);
    if (!data) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(data.buf), {
      headers: {
        "Content-Type": data.mimeType || "application/octet-stream",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}
