import { listDemoTransactions } from "@/demo/server/repos/transactionsRepo";

export async function getTryNowSummary() {
  const transactions = await listDemoTransactions();
  return {
    transactionsCount: transactions.length,
  };
}
