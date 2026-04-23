import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import type {
  Agent,
  AgentCapability,
  ReviewItem,
  Transaction,
  TransactionStatus,
  Wallet,
  WalletPolicy,
} from "@/lib/types";
import { DEMO_TABLES, demoDynamo, newId, nowIso } from "@/demo/server/dynamo/client";

type SessionLike = { user?: { email?: string | null } } | null;

type UserItem = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
};

type WorkspaceItem = {
  id: string;
  userId: string;
  name: string;
  spendMode?: string;
  fundingPreference?: string;
  createdAt: string;
  updatedAt: string;
};

type WalletItem = {
  id: string;
  workspaceId: string;
  name: string;
  currency: string;
  balanceCents: number;
  policyJson?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type AgentItem = {
  id: string;
  workspaceId: string;
  walletId: string;
  name: string;
  description?: string;
  templateType: string;
  role: string;
  capabilitiesJson?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type TransactionItem = {
  id: string;
  workspaceId: string;
  walletId: string;
  agentId: string;
  amountCents: number;
  currency: string;
  status: string;
  policyResult?: string;
  reviewState?: "pending" | "approved" | "rejected";
  recipient?: string;
  vendor?: string;
  category?: string;
  memo?: string;
  evidenceJson?: string;
  createdAt: string;
  updatedAt: string;
  settledAt?: string;
};

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function getOrCreateUserByEmail(email: string): Promise<UserItem> {
  const query = await demoDynamo.send(
    new QueryCommand({
      TableName: DEMO_TABLES.users,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
      Limit: 1,
    })
  );
  const existing = query.Items?.[0] as UserItem | undefined;
  if (existing) return existing;

  const now = nowIso();
  const created: UserItem = {
    id: newId("usr"),
    email,
    createdAt: now,
    updatedAt: now,
    name: null,
    image: null,
  };
  await demoDynamo.send(
    new PutCommand({
      TableName: DEMO_TABLES.users,
      Item: created,
    })
  );
  return created;
}

async function getOrCreateWorkspaceByUser(userId: string): Promise<WorkspaceItem> {
  const query = await demoDynamo.send(
    new QueryCommand({
      TableName: DEMO_TABLES.workspaces,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
      Limit: 1,
    })
  );
  const existing = query.Items?.[0] as WorkspaceItem | undefined;
  if (existing) return existing;

  const now = nowIso();
  const created: WorkspaceItem = {
    id: newId("wsp"),
    userId,
    name: "Default Workspace",
    spendMode: "governed",
    fundingPreference: "manual",
    createdAt: now,
    updatedAt: now,
  };
  await demoDynamo.send(
    new PutCommand({
      TableName: DEMO_TABLES.workspaces,
      Item: created,
    })
  );
  return created;
}

export async function resolveWorkspaceIdForSession(session: SessionLike): Promise<string> {
  const email = session?.user?.email;
  if (!email) {
    throw new Error("No session email found.");
  }
  const user = await getOrCreateUserByEmail(email);
  const workspace = await getOrCreateWorkspaceByUser(user.id);
  return workspace.id;
}

function walletFromItem(item: WalletItem, assignedAgentsCount = 0): Wallet {
  const policy = parseJson<WalletPolicy>(item.policyJson, {
    approvalMode: "review",
    limits: {},
  });
  return {
    id: item.id,
    name: item.name,
    currency: item.currency ?? "USD",
    balance: (item.balanceCents ?? 0) / 100,
    policy,
    assignedAgentsCount,
    status: (item.status as Wallet["status"]) ?? "active",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function getAgentCountsByWallet(workspaceId: string) {
  const query = await demoDynamo.send(
    new QueryCommand({
      TableName: DEMO_TABLES.agents,
      IndexName: "workspaceId-index",
      KeyConditionExpression: "workspaceId = :workspaceId",
      ExpressionAttributeValues: { ":workspaceId": workspaceId },
    })
  );
  const counts = new Map<string, number>();
  for (const item of (query.Items ?? []) as AgentItem[]) {
    counts.set(item.walletId, (counts.get(item.walletId) ?? 0) + 1);
  }
  return counts;
}

export async function listWallets(workspaceId: string, status?: string): Promise<Wallet[]> {
  const query = await demoDynamo.send(
    new QueryCommand({
      TableName: DEMO_TABLES.wallets,
      IndexName: "workspaceId-index",
      KeyConditionExpression: "workspaceId = :workspaceId",
      ExpressionAttributeValues: { ":workspaceId": workspaceId },
    })
  );
  const counts = await getAgentCountsByWallet(workspaceId);
  let wallets = ((query.Items ?? []) as WalletItem[]).map((item) =>
    walletFromItem(item, counts.get(item.id) ?? 0)
  );
  if (status) wallets = wallets.filter((wallet) => wallet.status === status);
  wallets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return wallets;
}

export async function getWalletById(id: string): Promise<Wallet | null> {
  const result = await demoDynamo.send(
    new GetCommand({
      TableName: DEMO_TABLES.wallets,
      Key: { id },
    })
  );
  const item = result.Item as WalletItem | undefined;
  if (!item) return null;
  return walletFromItem(item);
}

export async function createWallet(
  workspaceId: string,
  input: Partial<Wallet>
): Promise<Wallet> {
  const now = nowIso();
  const item: WalletItem = {
    id: newId("wal"),
    workspaceId,
    name: input.name ?? "New Wallet",
    currency: input.currency ?? "USD",
    balanceCents: Math.round((input.balance ?? 0) * 100),
    policyJson: JSON.stringify(input.policy ?? { approvalMode: "review", limits: {} }),
    status: input.status ?? "active",
    createdAt: now,
    updatedAt: now,
  };
  await demoDynamo.send(
    new PutCommand({
      TableName: DEMO_TABLES.wallets,
      Item: item,
    })
  );
  return walletFromItem(item, 0);
}

export async function updateWallet(id: string, input: Partial<Wallet>): Promise<Wallet | null> {
  const current = await demoDynamo.send(
    new GetCommand({
      TableName: DEMO_TABLES.wallets,
      Key: { id },
    })
  );
  const existing = current.Item as WalletItem | undefined;
  if (!existing) return null;

  const updated: WalletItem = {
    ...existing,
    name: input.name ?? existing.name,
    currency: input.currency ?? existing.currency,
    balanceCents:
      input.balance != null ? Math.round(input.balance * 100) : existing.balanceCents,
    policyJson:
      input.policy != null ? JSON.stringify(input.policy) : existing.policyJson,
    status: input.status ?? existing.status,
    updatedAt: nowIso(),
  };

  await demoDynamo.send(
    new PutCommand({
      TableName: DEMO_TABLES.wallets,
      Item: updated,
    })
  );
  return walletFromItem(updated);
}

export async function fundWallet(id: string, amount: number): Promise<Wallet | null> {
  const current = await demoDynamo.send(
    new GetCommand({
      TableName: DEMO_TABLES.wallets,
      Key: { id },
    })
  );
  const existing = current.Item as WalletItem | undefined;
  if (!existing) return null;
  const updated: WalletItem = {
    ...existing,
    balanceCents: (existing.balanceCents ?? 0) + Math.round(amount * 100),
    updatedAt: nowIso(),
  };
  await demoDynamo.send(
    new PutCommand({
      TableName: DEMO_TABLES.wallets,
      Item: updated,
    })
  );
  return walletFromItem(updated);
}

export async function deleteWallet(id: string) {
  await demoDynamo.send(
    new DeleteCommand({
      TableName: DEMO_TABLES.wallets,
      Key: { id },
    })
  );
}

function agentFromItem(item: AgentItem): Agent {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    templateType: item.templateType,
    assignedWalletId: item.walletId,
    role: (item.role as Agent["role"]) ?? "requester",
    capabilities: parseJson<AgentCapability[]>(item.capabilitiesJson, []),
    status: (item.status as Agent["status"]) ?? "active",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function listAgents(
  workspaceId: string,
  filters?: { walletId?: string; status?: string }
): Promise<Agent[]> {
  const byWallet = filters?.walletId;
  const query = await demoDynamo.send(
    new QueryCommand({
      TableName: DEMO_TABLES.agents,
      IndexName: byWallet ? "walletId-index" : "workspaceId-index",
      KeyConditionExpression: byWallet
        ? "walletId = :walletId"
        : "workspaceId = :workspaceId",
      ExpressionAttributeValues: byWallet
        ? { ":walletId": byWallet }
        : { ":workspaceId": workspaceId },
    })
  );
  let agents = ((query.Items ?? []) as AgentItem[])
    .filter((item) => item.workspaceId === workspaceId)
    .map(agentFromItem);
  if (filters?.status) agents = agents.filter((agent) => agent.status === filters.status);
  agents.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return agents;
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const result = await demoDynamo.send(
    new GetCommand({
      TableName: DEMO_TABLES.agents,
      Key: { id },
    })
  );
  const item = result.Item as AgentItem | undefined;
  if (!item) return null;
  return agentFromItem(item);
}

export async function createAgent(
  workspaceId: string,
  input: Partial<Agent>
): Promise<Agent> {
  const now = nowIso();
  const item: AgentItem = {
    id: newId("agt"),
    workspaceId,
    walletId: input.assignedWalletId ?? "",
    name: input.name ?? "New Agent",
    description: input.description,
    templateType: input.templateType ?? "custom",
    role: input.role ?? "requester",
    capabilitiesJson: JSON.stringify(input.capabilities ?? []),
    status: input.status ?? "active",
    createdAt: now,
    updatedAt: now,
  };
  await demoDynamo.send(
    new PutCommand({
      TableName: DEMO_TABLES.agents,
      Item: item,
    })
  );
  return agentFromItem(item);
}

export async function updateAgent(id: string, input: Partial<Agent>): Promise<Agent | null> {
  const current = await demoDynamo.send(
    new GetCommand({
      TableName: DEMO_TABLES.agents,
      Key: { id },
    })
  );
  const existing = current.Item as AgentItem | undefined;
  if (!existing) return null;

  const updated: AgentItem = {
    ...existing,
    walletId: input.assignedWalletId ?? existing.walletId,
    name: input.name ?? existing.name,
    description: input.description ?? existing.description,
    templateType: input.templateType ?? existing.templateType,
    role: input.role ?? existing.role,
    capabilitiesJson:
      input.capabilities != null
        ? JSON.stringify(input.capabilities)
        : existing.capabilitiesJson,
    status: input.status ?? existing.status,
    updatedAt: nowIso(),
  };

  await demoDynamo.send(
    new PutCommand({
      TableName: DEMO_TABLES.agents,
      Item: updated,
    })
  );
  return agentFromItem(updated);
}

export async function deleteAgent(id: string) {
  await demoDynamo.send(
    new DeleteCommand({
      TableName: DEMO_TABLES.agents,
      Key: { id },
    })
  );
}

function txFromItem(
  item: TransactionItem,
  extras?: { agentName?: string; walletName?: string }
): Transaction {
  return {
    id: item.id,
    requestedAt: item.createdAt,
    agentId: item.agentId,
    agentName: extras?.agentName ?? "Agent",
    walletId: item.walletId,
    walletName: extras?.walletName ?? "Wallet",
    recipient: item.recipient,
    vendor: item.vendor,
    category: item.category,
    amount: (item.amountCents ?? 0) / 100,
    currency: item.currency ?? "USD",
    memo: item.memo,
    status: (item.status as TransactionStatus) ?? "pending_review",
    policyResult: (item.policyResult as Transaction["policyResult"]) ?? "within_policy",
    reviewState: item.reviewState,
    evidence: parseJson(item.evidenceJson, []),
    settledAt: item.settledAt,
  };
}

async function getWalletName(walletId: string) {
  const wallet = await getWalletById(walletId);
  return wallet?.name ?? "Wallet";
}

async function getAgentName(agentId: string) {
  const agent = await getAgentById(agentId);
  return agent?.name ?? "Agent";
}

export async function listTransactions(
  workspaceId: string,
  filters?: {
    agentId?: string;
    walletId?: string;
    status?: string;
    category?: string;
  }
): Promise<Transaction[]> {
  const indexName = filters?.agentId
    ? "agentId-createdAt-index"
    : filters?.walletId
      ? "walletId-createdAt-index"
      : "workspaceId-createdAt-index";
  const key = filters?.agentId
    ? "agentId"
    : filters?.walletId
      ? "walletId"
      : "workspaceId";
  const keyValue = filters?.agentId ?? filters?.walletId ?? workspaceId;

  const query = await demoDynamo.send(
    new QueryCommand({
      TableName: DEMO_TABLES.transactions,
      IndexName: indexName,
      KeyConditionExpression: `${key} = :keyValue`,
      ExpressionAttributeValues: { ":keyValue": keyValue },
      ScanIndexForward: false,
    })
  );

  let items = (query.Items ?? []) as TransactionItem[];
  items = items.filter((item) => item.workspaceId === workspaceId);
  if (filters?.status) items = items.filter((item) => item.status === filters.status);
  if (filters?.category) items = items.filter((item) => item.category === filters.category);

  const transactions = await Promise.all(
    items.map(async (item) =>
      txFromItem(item, {
        agentName: await getAgentName(item.agentId),
        walletName: await getWalletName(item.walletId),
      })
    )
  );
  return transactions;
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const result = await demoDynamo.send(
    new GetCommand({
      TableName: DEMO_TABLES.transactions,
      Key: { id },
    })
  );
  const item = result.Item as TransactionItem | undefined;
  if (!item) return null;
  return txFromItem(item, {
    agentName: await getAgentName(item.agentId),
    walletName: await getWalletName(item.walletId),
  });
}

export async function createTransactionRequest(
  workspaceId: string,
  input: Partial<Transaction>
): Promise<Transaction> {
  const now = nowIso();
  const item: TransactionItem = {
    id: newId("tx"),
    workspaceId,
    walletId: input.walletId ?? "",
    agentId: input.agentId ?? "",
    amountCents: Math.round((input.amount ?? 0) * 100),
    currency: input.currency ?? "USD",
    status: "pending_review",
    policyResult: input.policyResult ?? "within_policy",
    reviewState: "pending",
    recipient: input.recipient,
    vendor: input.vendor,
    category: input.category,
    memo: input.memo,
    evidenceJson: JSON.stringify(input.evidence ?? []),
    createdAt: now,
    updatedAt: now,
  };
  await demoDynamo.send(
    new PutCommand({
      TableName: DEMO_TABLES.transactions,
      Item: item,
    })
  );
  return txFromItem(item, {
    agentName: await getAgentName(item.agentId),
    walletName: await getWalletName(item.walletId),
  });
}

export async function updateTransactionStatus(
  id: string,
  status: TransactionStatus
): Promise<Transaction | null> {
  const current = await demoDynamo.send(
    new GetCommand({
      TableName: DEMO_TABLES.transactions,
      Key: { id },
    })
  );
  const existing = current.Item as TransactionItem | undefined;
  if (!existing) return null;
  const updated: TransactionItem = {
    ...existing,
    status,
    reviewState:
      status === "approved"
        ? "approved"
        : status === "blocked"
          ? "rejected"
          : existing.reviewState,
    settledAt: status === "settled" ? nowIso() : existing.settledAt,
    updatedAt: nowIso(),
  };
  await demoDynamo.send(
    new PutCommand({
      TableName: DEMO_TABLES.transactions,
      Item: updated,
    })
  );
  return txFromItem(updated, {
    agentName: await getAgentName(updated.agentId),
    walletName: await getWalletName(updated.walletId),
  });
}

export async function reviewTransaction(
  id: string,
  decision: "approve" | "reject"
): Promise<Transaction | null> {
  return updateTransactionStatus(id, decision === "approve" ? "approved" : "blocked");
}

export async function listReviewQueue(workspaceId: string): Promise<ReviewItem[]> {
  let items: TransactionItem[] = [];
  try {
    const byReviewState = await demoDynamo.send(
      new QueryCommand({
        TableName: DEMO_TABLES.transactions,
        IndexName: "workspaceId-reviewState-index",
        KeyConditionExpression: "workspaceId = :workspaceId AND reviewState = :reviewState",
        ExpressionAttributeValues: {
          ":workspaceId": workspaceId,
          ":reviewState": "pending",
        },
      })
    );
    items = (byReviewState.Items ?? []) as TransactionItem[];
  } catch {
    const fallback = await demoDynamo.send(
      new QueryCommand({
        TableName: DEMO_TABLES.transactions,
        IndexName: "workspaceId-createdAt-index",
        KeyConditionExpression: "workspaceId = :workspaceId",
        ExpressionAttributeValues: {
          ":workspaceId": workspaceId,
        },
        ScanIndexForward: false,
      })
    );
    items = ((fallback.Items ?? []) as TransactionItem[]).filter(
      (item) => item.reviewState === "pending" || item.status === "pending_review"
    );
  }

  const now = Date.now();
  const queue = await Promise.all(
    items.map(async (item) => {
      const tx = txFromItem(item, {
        agentName: await getAgentName(item.agentId),
        walletName: await getWalletName(item.walletId),
      });
      const ageMinutes = Math.max(
        0,
        Math.floor((now - new Date(item.createdAt).getTime()) / (1000 * 60))
      );
      return {
        transactionId: tx.id,
        transaction: tx,
        ageMinutes,
        reviewerStatus: "pending" as const,
      };
    })
  );
  queue.sort((a, b) => b.transaction.requestedAt.localeCompare(a.transaction.requestedAt));
  return queue;
}
