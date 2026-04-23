import { NextResponse } from "next/server";
import type { Transaction, PaginatedResponse } from "@/lib/types";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import {
  listTransactions,
  resolveWorkspaceIdForSession,
} from "@/demo/server/repos/demoData";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
    const data = await listTransactions(workspaceId, {
      status: searchParams.get("status") ?? undefined,
      walletId: searchParams.get("walletId") ?? undefined,
      agentId: searchParams.get("agentId") ?? undefined,
      category: searchParams.get("category") ?? undefined,
    });
    const total = data.length;
    const start = (page - 1) * pageSize;
    const paginated = data.slice(start, start + pageSize);
    const body: PaginatedResponse<Transaction> = {
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
