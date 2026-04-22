import { NextResponse } from "next/server";
import type { Agent, PaginatedResponse } from "@/lib/types";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import {
  createAgent,
  listAgents,
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
    const walletId = searchParams.get("walletId") ?? undefined;
    const data = await listAgents(workspaceId, { status, walletId });
    const total = data.length;
    const start = (page - 1) * pageSize;
    const paginated = data.slice(start, start + pageSize);
    const body: PaginatedResponse<Agent> = {
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
    const agent: Agent = await createAgent(workspaceId, {
      name: body.name ?? "New Agent",
      description: body.description,
      templateType: body.templateType ?? "custom",
      assignedWalletId: body.assignedWalletId ?? "",
      role: body.role ?? "requester",
      capabilities: body.capabilities ?? [],
      status: body.status ?? "active",
    });
    return NextResponse.json(agent);
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}
