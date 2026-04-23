import { NextResponse } from "next/server";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";

export async function GET() {
  try {
    await requireSession();
    const template = {
      id: "invoice",
      name: "Invoice Agent",
      description: "Turn invoice uploads into payment requests with extraction and policy evaluation.",
      status: "available",
      workflowSteps: [
        "Upload invoice image or PDF",
        "Extract vendor, amount, due date, memo",
        "Review or correct extracted fields",
        "Submit payment request",
        "Receive policy decision (approved / blocked / pending review)",
      ],
    };
    return NextResponse.json(template);
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}
