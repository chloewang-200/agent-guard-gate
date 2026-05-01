import type { PolicyEvaluationItem, PolicyResult, TransactionStatus, WalletPolicy } from "@/lib/types";

type SpendDecisionInput = {
  policy: WalletPolicy;
  amount: number;
  walletCurrency: string;
  todaySpend: number;
};

export type SpendPolicyDecision = {
  policyResult: PolicyResult;
  status: TransactionStatus;
  reviewState: "pending" | "approved" | "rejected";
  flaggedReason?: string;
  policyEvaluation: PolicyEvaluationItem[];
};

export function evaluateSpendPolicy(input: SpendDecisionInput): SpendPolicyDecision {
  const { policy, amount, todaySpend, walletCurrency } = input;
  const perTxLimit = policy.limits.perTransaction;
  const dailyLimit = policy.limits.daily;

  const perTxExceeded = perTxLimit != null && amount > perTxLimit;
  const dailyExceeded = dailyLimit != null && todaySpend + amount > dailyLimit;
  const isOverLimit = perTxExceeded || dailyExceeded;

  const policyEvaluation: PolicyEvaluationItem[] = [
    {
      check: "Per-transaction spend limit",
      result: perTxExceeded ? "fail" : "pass",
      detail:
        perTxLimit == null
          ? "No per-transaction limit configured."
          : `Request ${amount.toFixed(2)} ${walletCurrency} vs max ${perTxLimit.toFixed(2)} ${walletCurrency}.`,
    },
    {
      check: "Daily wallet spend limit",
      result: dailyExceeded ? "fail" : "pass",
      detail:
        dailyLimit == null
          ? "No daily spend limit configured."
          : `Projected daily total ${(todaySpend + amount).toFixed(2)} ${walletCurrency} vs max ${dailyLimit.toFixed(2)} ${walletCurrency}.`,
    },
  ];

  if (!isOverLimit) {
    return {
      policyResult: "within_policy",
      status: "approved",
      reviewState: "approved",
      policyEvaluation,
    };
  }

  const exceededChecks: string[] = [];
  if (perTxExceeded) exceededChecks.push("per-transaction limit");
  if (dailyExceeded) exceededChecks.push("daily limit");

  if (policy.approvalMode === "strict") {
    return {
      policyResult: "over_limit",
      status: "blocked",
      reviewState: "rejected",
      flaggedReason: `Rejected for exceeding wallet ${exceededChecks.join(" and ")}.`,
      policyEvaluation,
    };
  }

  return {
    policyResult: "over_limit",
    status: "pending_review",
    reviewState: "pending",
    flaggedReason: `Sent to review for exceeding wallet ${exceededChecks.join(" and ")}.`,
    policyEvaluation,
  };
}
