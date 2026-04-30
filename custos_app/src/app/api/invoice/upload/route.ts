import { NextResponse } from "next/server";
import { isInvoiceFeatureEnabled } from "@/lib/features";
import {
  experimentalFeatureDisabledResponse,
  requireSession,
  toRouteErrorResponse,
} from "@/lib/server-auth";
import { saveInvoiceUpload } from "@/lib/server/invoice-upload-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isInvoiceFeatureEnabled()) {
      return experimentalFeatureDisabledResponse();
    }
    await requireSession();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ message: "No file" }, { status: 400 });
    }
    const { id } = await saveInvoiceUpload(file);
    return NextResponse.json({ fileId: id, url: undefined });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    if (msg.includes("too large")) {
      return NextResponse.json({ message: msg }, { status: 413 });
    }
    return toRouteErrorResponse(e, "Upload failed");
  }
}
