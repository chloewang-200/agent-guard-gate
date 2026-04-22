import { NextResponse } from "next/server";
import type { ApiKeyResponse } from "@/lib/types";
import { isAgentApiKeyFeatureEnabled } from "@/lib/features";
import {
  experimentalFeatureDisabledResponse,
  requireSession,
  toRouteErrorResponse,
} from "@/lib/server-auth";
import { listAgents, resolveWorkspaceIdForSession } from "@/demo/server/repos/demoData";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAgentApiKeyFeatureEnabled()) {
      return experimentalFeatureDisabledResponse();
    }
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { id } = await params;
    const agents = await listAgents(workspaceId);
    if (!agents.some((agent) => agent.id === id)) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }
    // TODO: Generate key server-side and return once. Never store full key in DB.
    const response: ApiKeyResponse = {
      keyPrefix: "custos_****",
      fullKey: `custos_${Math.random().toString(36).slice(2)}_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json(response);
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}
