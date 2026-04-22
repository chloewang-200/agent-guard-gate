import { NextResponse } from "next/server";
import type { Wallet } from "@/lib/types";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import {
  deleteWallet,
  getWalletById,
  listWallets,
  resolveWorkspaceIdForSession,
  updateWallet,
} from "@/demo/server/repos/demoData";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { id } = await params;
    const wallet = await getWalletById(id);
    if (!wallet || !(await ownsWallet(workspaceId, id))) {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }
    return NextResponse.json(wallet);
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
    if (!(await ownsWallet(workspaceId, id))) {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }
    const body = await request.json();
    const wallet: Wallet | null = await updateWallet(id, {
      name: body.name,
      currency: body.currency,
      balance: body.balance != null ? Number(body.balance) : undefined,
      policy: body.policy,
      status: body.status,
    });
    if (!wallet) {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }
    return NextResponse.json(wallet);
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { id } = await params;
    if (!(await ownsWallet(workspaceId, id))) {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }
    await deleteWallet(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}

async function ownsWallet(workspaceId: string, walletId: string) {
  const wallets = await listWallets(workspaceId);
  return wallets.some((wallet) => wallet.id === walletId);
}
