import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

export const DEMO_TABLES = {
  users: process.env.CUSTOS_USERS_TABLE ?? "custos-users",
  workspaces: process.env.CUSTOS_WORKSPACES_TABLE ?? "custos-workspaces",
  wallets: process.env.CUSTOS_WALLETS_TABLE ?? "custos-wallets",
  agents: process.env.CUSTOS_AGENTS_TABLE ?? "custos-agents",
  transactions: process.env.CUSTOS_TRANSACTIONS_TABLE ?? "custos-transactions",
  vendors: process.env.CUSTOS_VENDORS_TABLE ?? "custos-vendors",
} as const;

const client = new DynamoDB({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export const demoDynamo = DynamoDBDocument.from(client, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

export function nowIso() {
  return new Date().toISOString();
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}
