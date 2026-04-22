import { NextResponse } from "next/server";
import type { Wallet } from "@/lib/types";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import { fundWallet, listWallets, resolveWorkspaceIdForSession } from "@/demo/server/repos/demoData";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { id } = await params;
    const wallets = await listWallets(workspaceId);
    if (!wallets.some((wallet) => wallet.id === id)) {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }
    const body = await request.json();
    const amount = Number(body?.amount) || 0;
    const wallet: Wallet | null = await fundWallet(id, amount);
    if (!wallet) {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }
    return NextResponse.json(wallet);
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}
