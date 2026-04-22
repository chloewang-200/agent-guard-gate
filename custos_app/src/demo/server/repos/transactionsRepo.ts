import { listTransactions } from "@/demo/server/repos/demoData";

export interface DemoTransactionRecord {
  id: string;
  createdAt: string;
  status: "pending_review" | "approved" | "rejected";
}

export async function listDemoTransactions(): Promise<DemoTransactionRecord[]> {
  const workspaceId = process.env.CUSTOS_DEFAULT_WORKSPACE_ID;
  if (!workspaceId) return [];
  const rows = await listTransactions(workspaceId);
  const toDemoStatus = (status: string): DemoTransactionRecord["status"] => {
    if (status === "approved") return "approved";
    if (status === "blocked") return "rejected";
    return "pending_review";
  };
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.requestedAt,
    status: toDemoStatus(row.status),
  }));
}
