import { NextResponse } from "next/server";
import type { Transaction } from "@/lib/types";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import {
  listTransactions,
  resolveWorkspaceIdForSession,
  reviewTransaction,
} from "@/demo/server/repos/demoData";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { id } = await params;
    const transactions = await listTransactions(workspaceId);
    if (!transactions.some((transaction) => transaction.id === id)) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }
    const body = await request.json();
    const tx: Transaction | null = await reviewTransaction(
      id,
      body?.decision === "approve" ? "approve" : "reject"
    );
    if (!tx) return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    return NextResponse.json(tx);
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}
