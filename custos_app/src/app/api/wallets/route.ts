import { NextResponse } from "next/server";
import type { Wallet, PaginatedResponse } from "@/lib/types";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import {
  createWallet,
  listWallets,
  resolveWorkspaceIdForSession,
} from "@/demo/server/repos/demoData";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
    const status = searchParams.get("status") ?? undefined;
    const data = await listWallets(workspaceId, status);
    const total = data.length;
    const start = (page - 1) * pageSize;
    const paginated = data.slice(start, start + pageSize);
    const body: PaginatedResponse<Wallet> = {
      data: paginated,
      total,
      page,
      pageSize,
      hasMore: start + pageSize < total,
    };
    return NextResponse.json(body);
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const body = await request.json();
    const wallet: Wallet = await createWallet(workspaceId, {
      name: body.name ?? "New Wallet",
      currency: body.currency ?? "USD",
      balance: Number(body.balance ?? body.policy?.limits?.daily ?? 0),
      policy: body.policy ?? {
        approvalMode: "review",
        limits: {},
      },
      status: body.status ?? "active",
    });
    return NextResponse.json(wallet);
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}
