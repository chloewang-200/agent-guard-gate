import { NextResponse } from "next/server";
import type { ReviewItem } from "@/lib/types";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import {
  listReviewQueue,
  resolveWorkspaceIdForSession,
} from "@/demo/server/repos/demoData";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
    const data: ReviewItem[] = await listReviewQueue(workspaceId);
    const total = data.length;
    const start = (page - 1) * pageSize;
    const paginated = data.slice(start, start + pageSize);
    return NextResponse.json({ data: paginated, total });
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}
