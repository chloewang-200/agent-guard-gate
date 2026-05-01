import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import type {
  Agent,
  AgentCapability,
  Evidence,
  PolicyEvaluationItem,
  ReviewItem,
  Transaction,
  TransactionStatus,
  Wallet,
  WalletPolicy,
} from "@/lib/types";
import { DEMO_TABLES, demoDynamo, newId, nowIso } from "@/demo/server/dynamo/client";
import { evaluateSpendPolicy } from "@/lib/policy/evaluateSpendPolicy";

type TransactionExtendedPayload = {
  purpose?: Transaction["purpose"];
  context?: Transaction["context"];
  riskScore?: number;
  riskFlags?: string[];
  citedRules?: Transaction["citedRules"];
  agentDecision?: Transaction["agentDecision"];
  matchedPayee?: Transaction["matchedPayee"];
  policyEvaluation?: Transaction["policyEvaluation"];
  auditEvents?: Transaction["auditEvents"];
  railType?: string;
  sourceKind?: string;
  payoutStatus?: string;
  payoutProvider?: string;
  payoutExternalId?: string;
  payoutError?: string;
  payoutAttemptedAt?: string;
};

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
  flaggedReason?: string;
  policyEvaluationJson?: string;
  reviewState?: "pending" | "approved" | "rejected";
  recipient?: string;
  vendor?: string;
  category?: string;
  memo?: string;
  evidenceJson?: string;
  /** JSON blob: audit/policy/context/evidence-adjacent fields (additive on custos-transactions items). */
  extendedPayloadJson?: string;
  createdAt: string;
  updatedAt: string;
  settledAt?: string;
};

function utcDayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function countsTowardDailyLimit(status: string | undefined): boolean {
  return status === "approved" || status === "settled";
}

function extendedPayloadFromItem(item: TransactionItem): TransactionExtendedPayload | null {
  const raw = item.extendedPayloadJson;
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const p = JSON.parse(raw) as TransactionExtendedPayload;
    return Object.keys(p).length === 0 ? null : p;
  } catch {
    return null;
  }
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeEvidenceFromJson(evidenceJson: string | undefined, createdAt: string): Evidence[] {
  const raw = parseJson(evidenceJson, [] as unknown[]);
  if (!Array.isArray(raw)) return [];
  return raw.map((e, i) => {
    const o = e && typeof e === "object" ? (e as Record<string, unknown>) : {};
    return {
      id: typeof o.id === "string" ? o.id : `ev_${i}_${createdAt}`,
      type: typeof o.type === "string" ? o.type : "attachment",
      url: typeof o.url === "string" ? o.url : undefined,
      filename: typeof o.filename === "string" ? o.filename : undefined,
      fileId: typeof o.fileId === "string" ? o.fileId : undefined,
      extractedFields:
        o.extractedFields && typeof o.extractedFields === "object"
          ? (o.extractedFields as Record<string, unknown>)
          : undefined,
      confidence: typeof o.confidence === "number" ? o.confidence : undefined,
      uploadedAt: typeof o.uploadedAt === "string" ? o.uploadedAt : createdAt,
    };
  });
}

function normalizeEvidenceInput(evidence: Evidence[] | undefined, createdAt: string): Evidence[] {
  if (!evidence?.length) return [];
  return evidence.map((e, i) => ({
    id: e.id ?? `ev_${i}_${createdAt}`,
    type: e.type,
    url: e.url,
    filename: e.filename,
    fileId: e.fileId,
    extractedFields: e.extractedFields,
    confidence: e.confidence,
    uploadedAt: e.uploadedAt ?? createdAt,
  }));
}

function compactExtendedPayload(input: Partial<Transaction>): TransactionExtendedPayload {
  const p: TransactionExtendedPayload = {};
  if (input.purpose !== undefined) p.purpose = input.purpose;
  if (input.context !== undefined) p.context = input.context;
  if (input.riskScore !== undefined) p.riskScore = input.riskScore;
  if (input.riskFlags !== undefined) p.riskFlags = input.riskFlags;
  if (input.citedRules !== undefined) p.citedRules = input.citedRules;
  if (input.agentDecision !== undefined) p.agentDecision = input.agentDecision;
  if (input.matchedPayee !== undefined) p.matchedPayee = input.matchedPayee;
  if (input.policyEvaluation !== undefined) p.policyEvaluation = input.policyEvaluation;
  if (input.auditEvents !== undefined) p.auditEvents = input.auditEvents;
  if (input.railType !== undefined) p.railType = input.railType;
  if (input.sourceKind !== undefined) p.sourceKind = input.sourceKind;
  if (input.payoutStatus !== undefined) p.payoutStatus = input.payoutStatus;
  if (input.payoutProvider !== undefined) p.payoutProvider = input.payoutProvider;
  if (input.payoutExternalId !== undefined) p.payoutExternalId = input.payoutExternalId;
  if (input.payoutError !== undefined) p.payoutError = input.payoutError;
  if (input.payoutAttemptedAt !== undefined) p.payoutAttemptedAt = input.payoutAttemptedAt;
  return p;
}

function mergeTxWithExtended(tx: Transaction, ext: TransactionExtendedPayload | null): Transaction {
  if (!ext || Object.keys(ext).length === 0) return tx;
  return {
    ...tx,
    purpose: ext.purpose ?? tx.purpose,
    context: ext.context ?? tx.context,
    riskScore: ext.riskScore ?? tx.riskScore,
    riskFlags: ext.riskFlags ?? tx.riskFlags,
    citedRules: ext.citedRules ?? tx.citedRules,
    agentDecision: ext.agentDecision ?? tx.agentDecision,
    matchedPayee: ext.matchedPayee ?? tx.matchedPayee,
    policyEvaluation: ext.policyEvaluation ?? tx.policyEvaluation,
    auditEvents: ext.auditEvents ?? tx.auditEvents,
    railType: ext.railType ?? tx.railType,
    sourceKind: ext.sourceKind ?? tx.sourceKind,
    payoutStatus: ext.payoutStatus ?? tx.payoutStatus,
    payoutProvider: ext.payoutProvider ?? tx.payoutProvider,
    payoutExternalId: ext.payoutExternalId ?? tx.payoutExternalId,
    payoutError: ext.payoutError ?? tx.payoutError,
    payoutAttemptedAt: ext.payoutAttemptedAt ?? tx.payoutAttemptedAt,
  };
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

export async function getWalletWorkspaceId(walletId: string): Promise<string | null> {
  const result = await demoDynamo.send(
    new GetCommand({
      TableName: DEMO_TABLES.wallets,
      Key: { id: walletId },
    })
  );
  const item = result.Item as WalletItem | undefined;
  return item?.workspaceId ?? null;
}

function isConditionalCheckFailed(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "name" in e &&
    (e as { name: string }).name === "ConditionalCheckFailedException"
  );
}

/** Returns true if this PaymentIntent id was claimed for crediting (first writer wins). */
export async function claimStripeCreditForPaymentIntent(paymentIntentId: string): Promise<boolean> {
  try {
    await demoDynamo.send(
      new PutCommand({
        TableName: DEMO_TABLES.stripeCredits,
        Item: { paymentIntentId, createdAt: nowIso() },
        ConditionExpression: "attribute_not_exists(paymentIntentId)",
      })
    );
    return true;
  } catch (e: unknown) {
    if (isConditionalCheckFailed(e)) return false;
    throw e;
  }
}

export async function creditWalletFromStripePaymentIntent(pi: {
  id: string;
  metadata?: Record<string, string> | null;
  amount_received?: number | null;
  amount: number;
}): Promise<{ credited: boolean; reason?: string }> {
  const walletId = pi.metadata?.walletId;
  const workspaceId = pi.metadata?.workspaceId;
  if (!walletId || !workspaceId) return { credited: false, reason: "missing_metadata" };
  const ws = await getWalletWorkspaceId(walletId);
  if (ws !== workspaceId) return { credited: false, reason: "workspace_mismatch" };
  const amountCents = pi.amount_received ?? pi.amount;
  if (amountCents < 1) return { credited: false, reason: "zero_amount" };
  const claimed = await claimStripeCreditForPaymentIntent(pi.id);
  if (!claimed) return { credited: false, reason: "already_processed" };
  await fundWallet(walletId, amountCents / 100);
  return { credited: true };
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
  const policyEvaluation = parseJson<PolicyEvaluationItem[]>(item.policyEvaluationJson, []);
  const core: Transaction = {
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
    evidence: normalizeEvidenceFromJson(item.evidenceJson, item.createdAt),
    policyEvaluation: policyEvaluation.length > 0 ? policyEvaluation : undefined,
    settledAt: item.settledAt,
  };
  return mergeTxWithExtended(core, extendedPayloadFromItem(item));
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
  const wallet = input.walletId ? await getWalletById(input.walletId) : null;
  const walletPolicy = wallet?.policy ?? { approvalMode: "review", limits: {} };
  const walletCurrency = wallet?.currency ?? input.currency ?? "USD";
  const amount = Number(input.amount ?? 0);

  let todaySpend = 0;
  if (input.walletId) {
    const txQuery = await demoDynamo.send(
      new QueryCommand({
        TableName: DEMO_TABLES.transactions,
        IndexName: "walletId-createdAt-index",
        KeyConditionExpression: "walletId = :walletId",
        ExpressionAttributeValues: { ":walletId": input.walletId },
        ScanIndexForward: false,
      })
    );
    const todayKey = utcDayKey(nowIso());
    todaySpend = ((txQuery.Items ?? []) as TransactionItem[])
      .filter(
        (item) =>
          item.workspaceId === workspaceId &&
          utcDayKey(item.createdAt) === todayKey &&
          countsTowardDailyLimit(item.status)
      )
      .reduce((sum, item) => sum + (item.amountCents ?? 0) / 100, 0);
  }

  const decision = evaluateSpendPolicy({
    policy: walletPolicy,
    amount,
    walletCurrency,
    todaySpend,
  });

  const now = nowIso();
  const evidenceNorm = normalizeEvidenceInput(input.evidence, now);
  const extended = compactExtendedPayload(input);
  const item: TransactionItem = {
    id: newId("tx"),
    workspaceId,
    walletId: input.walletId ?? "",
    agentId: input.agentId ?? "",
    amountCents: Math.round(amount * 100),
    currency: walletCurrency,
    status: decision.status,
    policyResult: decision.policyResult,
    flaggedReason: decision.flaggedReason,
    policyEvaluationJson: JSON.stringify(decision.policyEvaluation),
    reviewState: decision.reviewState,
    recipient: input.recipient,
    vendor: input.vendor,
    category: input.category,
    memo: input.memo,
    evidenceJson: JSON.stringify(evidenceNorm),
    ...(Object.keys(extended).length > 0 ? { extendedPayloadJson: JSON.stringify(extended) } : {}),
    createdAt: now,
    updatedAt: now,
  };
  await demoDynamo.send(
    new PutCommand({
      TableName: DEMO_TABLES.transactions,
      Item: item,
    })
  );

  const full = await getTransactionById(item.id);
  if (!full) throw new Error("Failed to load transaction after create");
  return full;
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
  decision: "approve" | "reject",
  opts?: { note?: string; actor?: string }
): Promise<Transaction | null> {
  const current = await demoDynamo.send(
    new GetCommand({
      TableName: DEMO_TABLES.transactions,
      Key: { id },
    })
  );
  const existing = current.Item as TransactionItem | undefined;
  if (!existing) return null;

  const status = decision === "approve" ? "approved" : "blocked";
  const prevExt: TransactionExtendedPayload = extendedPayloadFromItem(existing) ?? {};
  const events = [...(prevExt.auditEvents ?? [])];
  events.push({
    id: newId("evt"),
    timestamp: nowIso(),
    action: decision === "approve" ? "Approved by reviewer" : "Declined by reviewer",
    type: "human",
    actor: opts?.actor,
    detail: opts?.note,
  });

  const updated: TransactionItem = {
    ...existing,
    status,
    reviewState:
      status === "approved"
        ? "approved"
        : status === "blocked"
          ? "rejected"
          : existing.reviewState,
    extendedPayloadJson: JSON.stringify({ ...prevExt, auditEvents: events }),
    updatedAt: nowIso(),
  };

  await demoDynamo.send(
    new PutCommand({
      TableName: DEMO_TABLES.transactions,
      Item: updated,
    })
  );

  return getTransactionById(id);
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
        flaggedReason: item.flaggedReason,
        ageMinutes,
        reviewerStatus: "pending" as const,
      };
    })
  );
  queue.sort((a, b) => b.transaction.requestedAt.localeCompare(a.transaction.requestedAt));
  return queue;
}
