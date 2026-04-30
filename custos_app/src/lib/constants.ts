export const AGENT_STATUSES = [
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
  { value: "paused", label: "Paused" },
  { value: "needs_setup", label: "Needs setup" },
] as const;

export const AGENT_ROLES = [
  { value: "viewer", label: "Viewer" },
  { value: "requester", label: "Requester" },
  { value: "approver", label: "Approver" },
  { value: "admin", label: "Admin" },
] as const;

export const AGENT_TEMPLATE_TYPES = [
  { value: "invoice", label: "Invoice Agent" },
  { value: "procurement", label: "Procurement Agent" },
  { value: "travel", label: "Travel Agent" },
  { value: "reimbursement", label: "Reimbursement Agent" },
  { value: "vendor_payout", label: "Vendor Payout Agent" },
  { value: "custom", label: "Custom Agent" },
] as const;

/** Capability ids stored on agents; labels shown in UI and policy tooling. */
export const AGENT_CAPABILITY_OPTIONS = [
  { id: "submit_payment_requests", name: "Submit payment requests" },
  { id: "request_vendor_changes", name: "Request vendor changes" },
  { id: "view_balances", name: "View balances" },
  { id: "approve_under_threshold", name: "Approve under threshold" },
] as const;

export const WALLET_STATUSES = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "restricted", label: "Restricted" },
] as const;

export const APPROVAL_MODES = [
  { value: "auto", label: "Auto" },
  { value: "review", label: "Review" },
  { value: "strict", label: "Strict" },
] as const;

export const TRANSACTION_STATUSES = [
  { value: "approved", label: "Approved" },
  { value: "blocked", label: "Blocked" },
  { value: "pending_review", label: "Pending Review" },
  { value: "settled", label: "Settled" },
  { value: "canceled", label: "Canceled" },
] as const;

export const POLICY_RESULTS = [
  { value: "within_policy", label: "Within policy" },
  { value: "over_limit", label: "Over limit" },
  { value: "vendor_restricted", label: "Vendor restricted" },
  { value: "missing_proof", label: "Missing proof" },
  { value: "needs_manual_approval", label: "Needs manual approval" },
  { value: "category_not_allowed", label: "Category not allowed" },
  { value: "agent_capability_not_allowed", label: "Agent capability not allowed" },
] as const;

export const CATEGORIES = [
  "Software",
  "Travel",
  "Office supplies",
  "Vendor payments",
  "Utilities",
  "Marketing",
  "Professional services",
  "Other",
];
