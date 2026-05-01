import { describe, expect, it } from "vitest";
import type { WalletPolicy } from "@/lib/types";
import { evaluateSpendPolicy } from "@/lib/policy/evaluateSpendPolicy";

function makePolicy(overrides?: Partial<WalletPolicy>): WalletPolicy {
  const mergedLimits = {
    perTransaction: 100,
    daily: 500,
    ...(overrides?.limits ?? {}),
  };
  return {
    approvalMode: "review",
    ...overrides,
    limits: mergedLimits,
  };
}

describe("evaluateSpendPolicy", () => {
  it("fails when amount exceeds per-transaction limit", () => {
    const result = evaluateSpendPolicy({
      policy: makePolicy(),
      amount: 101,
      todaySpend: 0,
      walletCurrency: "USD",
    });

    expect(result.policyResult).toBe("over_limit");
    expect(result.status).toBe("pending_review");
    expect(result.reviewState).toBe("pending");
    expect(result.flaggedReason).toContain("per-transaction limit");
  });

  it("fails when projected daily spend exceeds daily limit", () => {
    const result = evaluateSpendPolicy({
      policy: makePolicy(),
      amount: 60,
      todaySpend: 450,
      walletCurrency: "USD",
    });

    expect(result.policyResult).toBe("over_limit");
    expect(result.flaggedReason).toContain("daily limit");
  });

  it("fails with combined reason when both limits are exceeded", () => {
    const result = evaluateSpendPolicy({
      policy: makePolicy(),
      amount: 600,
      todaySpend: 100,
      walletCurrency: "USD",
    });

    expect(result.policyResult).toBe("over_limit");
    expect(result.flaggedReason).toContain("per-transaction limit");
    expect(result.flaggedReason).toContain("daily limit");
  });

  it("passes when transaction lands exactly on limits", () => {
    const result = evaluateSpendPolicy({
      policy: makePolicy(),
      amount: 100,
      todaySpend: 400,
      walletCurrency: "USD",
    });

    expect(result.policyResult).toBe("within_policy");
    expect(result.status).toBe("approved");
    expect(result.reviewState).toBe("approved");
    expect(result.flaggedReason).toBeUndefined();
  });

  it("blocks immediately in strict mode when over limit", () => {
    const result = evaluateSpendPolicy({
      policy: makePolicy({ approvalMode: "strict" }),
      amount: 101,
      todaySpend: 0,
      walletCurrency: "USD",
    });

    expect(result.policyResult).toBe("over_limit");
    expect(result.status).toBe("blocked");
    expect(result.reviewState).toBe("rejected");
    expect(result.flaggedReason).toContain("Rejected");
  });

  it("auto-approves strict mode transactions that are within limits", () => {
    const result = evaluateSpendPolicy({
      policy: makePolicy({ approvalMode: "strict" }),
      amount: 50,
      todaySpend: 100,
      walletCurrency: "USD",
    });

    expect(result.policyResult).toBe("within_policy");
    expect(result.status).toBe("approved");
    expect(result.reviewState).toBe("approved");
  });
});
