import { NextResponse } from "next/server";
import type { Transaction } from "@/lib/types";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import { createTransactionRequest, listWallets, resolveWorkspaceIdForSession } from "@/demo/server/repos/demoData";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const body = await request.json();
    const wallets = await listWallets(workspaceId);
    if (!wallets.some((wallet) => wallet.id === body.walletId)) {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }
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
      purpose: body.purpose,
      context: body.context,
      policyEvaluation: body.policyEvaluation,
      auditEvents: body.auditEvents,
      agentDecision: body.agentDecision,
      citedRules: body.citedRules,
      riskScore: body.riskScore,
      riskFlags: body.riskFlags,
      matchedPayee: body.matchedPayee,
      railType: body.railType,
      sourceKind: body.sourceKind,
      payoutStatus: body.payoutStatus,
      payoutProvider: body.payoutProvider,
      payoutExternalId: body.payoutExternalId,
      payoutError: body.payoutError,
      payoutAttemptedAt: body.payoutAttemptedAt,
    });
    return NextResponse.json(tx);
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}
