import { NextResponse } from "next/server";
import type { Transaction } from "@/lib/types";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import {
  getTransactionById,
  listTransactions,
  resolveWorkspaceIdForSession,
  updateTransactionStatus,
} from "@/demo/server/repos/demoData";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { id } = await params;
    if (!(await ownsTransaction(workspaceId, id))) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }
    const tx = await getTransactionById(id);
    if (!tx) return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    return NextResponse.json(tx);
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { id } = await params;
    if (!(await ownsTransaction(workspaceId, id))) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }
    const body = await request.json();
    const tx: Transaction | null = await updateTransactionStatus(id, body.status ?? "pending_review");
    if (!tx) return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    return NextResponse.json(tx);
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}

async function ownsTransaction(workspaceId: string, transactionId: string) {
  const transactions = await listTransactions(workspaceId);
  return transactions.some((transaction) => transaction.id === transactionId);
}
