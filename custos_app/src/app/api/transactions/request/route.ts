import { NextResponse } from "next/server";
import type { Transaction } from "@/lib/types";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import {
  createTransactionRequest,
  resolveWorkspaceIdForSession,
} from "@/demo/server/repos/demoData";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const body = await request.json();
    const tx: Transaction = await createTransactionRequest(workspaceId, {
      agentId: body.agentId ?? "",
      walletId: body.walletId ?? "",
      amount: Number(body.amount ?? 0),
      currency: body.currency ?? "USD",
      recipient: body.recipient,
      vendor: body.vendor,
      category: body.category,
      memo: body.memo,
      evidence: body.evidence,
      policyResult: "within_policy",
    });
    return NextResponse.json(tx);
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}
