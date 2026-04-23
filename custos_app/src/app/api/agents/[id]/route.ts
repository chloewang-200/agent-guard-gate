import { NextResponse } from "next/server";
import type { Agent } from "@/lib/types";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import {
  deleteAgent,
  getAgentById,
  listAgents,
  resolveWorkspaceIdForSession,
  updateAgent,
} from "@/demo/server/repos/demoData";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { id } = await params;
    if (!(await ownsAgent(workspaceId, id))) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }
    const agent = await getAgentById(id);
    if (!agent) return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    return NextResponse.json(agent);
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
    if (!(await ownsAgent(workspaceId, id))) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }
    const body = await request.json();
    const agent: Agent | null = await updateAgent(id, {
      name: body.name,
      description: body.description,
      templateType: body.templateType,
      assignedWalletId: body.assignedWalletId,
      role: body.role,
      capabilities: body.capabilities,
      status: body.status,
    });
    if (!agent) return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    return NextResponse.json(agent);
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
    if (!(await ownsAgent(workspaceId, id))) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }
    await deleteAgent(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}

async function ownsAgent(workspaceId: string, agentId: string) {
  const agents = await listAgents(workspaceId);
  return agents.some((agent) => agent.id === agentId);
}
