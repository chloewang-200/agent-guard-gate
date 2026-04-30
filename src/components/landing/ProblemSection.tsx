import { motion, useInView } from "framer-motion";
import { AlertTriangle, Bot, CheckCircle2, Clock3, DollarSign, ShieldCheck, FileText, Building2, Shield } from "lucide-react";
import { useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const adminTasks = [
  "book flights and hotels",
  "order office supplies",
  "manage SaaS tools",
  "collect receipts for taxes",
  "follow up on approvals",
];

const risksWithoutCustos = [
  "agents share credentials",
  "spending rules live in prompts",
  "ownership is unclear",
  "tax documentation is incomplete",
  "finance has no real-time visibility",
];

const dashboardMetrics = [
  { label: "Total Spend (7d)", value: "$58,420", icon: DollarSign },
  { label: "Active Agents", value: "12", icon: Bot },
  { label: "Policy Declines", value: "6", icon: ShieldCheck },
  { label: "Pending Approvals", value: "4", icon: Clock3 },
  { label: "Open Alerts", value: "3", icon: AlertTriangle },
];

const spendTrend = [
  { day: "Mon", amount: 4200 },
  { day: "Tue", amount: 6200 },
  { day: "Wed", amount: 5100 },
  { day: "Thu", amount: 8400 },
  { day: "Fri", amount: 7200 },
  { day: "Sat", amount: 3900 },
  { day: "Sun", amount: 4800 },
];

const spendByAgent = [
  { agent: "TravelAgent", amount: 18200 },
  { agent: "CloudProvisioner", amount: 14800 },
  { agent: "SaaSBuyer", amount: 9200 },
  { agent: "OfficeSupplyRunner", amount: 3600 },
];

const alertsPreview = [
  {
    title: "Spend drift on CloudProvisioner",
    note: "22% above baseline in the last 48 hours.",
    severity: "warning",
  },
  {
    title: "Unapproved vendor attempt",
    note: "TravelAgent requested payment to SkyLux Charter.",
    severity: "critical",
  },
  {
    title: "Approval SLA nearing deadline",
    note: "SaaSBuyer request expires in 1h 12m.",
    severity: "info",
  },
];

const transactionsPreview = [
  { vendor: "Delta", agent: "TravelAgent", amount: "$1,980", status: "approved" },
  { vendor: "Figma", agent: "SaaSBuyer", amount: "$420", status: "pending" },
  { vendor: "AWS", agent: "CloudProvisioner", amount: "$2,750", status: "review" },
  { vendor: "Staples", agent: "OfficeSupplyRunner", amount: "$320", status: "approved" },
];

const statusClasses: Record<string, string> = {
  approved: "bg-[#eefa79] text-slate-900 border-slate-900",
  pending: "bg-orange-300 text-slate-900 border-slate-900",
  review: "bg-slate-100 text-slate-700 border-slate-900",
};

const severityClasses: Record<string, string> = {
  critical: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-slate-100 text-slate-700",
};

const workflowSteps = [
  {
    id: 1,
    title: "Register agents",
    shortDesc: "Set up unique identities, virtual cards, and access controls.",
    details: [
      "unique agent identity",
      "virtual card or wallet",
      "owner + business unit",
      "access controls",
    ],
  },
  {
    id: 2,
    title: "Define policies",
    shortDesc: "Set budgets, approval thresholds, and vendor rules.",
    details: [
      "spend modes: auto, approval, simulated",
      "monthly budgets",
      "per-transaction caps",
      "vendor + category rules",
    ],
  },
  {
    id: 3,
    title: "Monitor & enforce",
    shortDesc: "Real-time tracking, approvals, and audit-ready records.",
    details: [
      "live spend tracking",
      "risk signals",
      "policy checks",
      "audit-ready metadata",
      "auto-approved within policy",
      "route to humans when needed",
      "receipts and tax tags",
      "immutable audit trails",
    ],
  },
];

const agents = [
  ["TravelAgent", "Flights & Hotels", "Operations", "Marcus Johnson", "Deployed", "Auto", "$4,250 / $15,000", "Low"],
  ["OfficeSupplyRunner", "Office Supplies", "Operations", "Marcus Johnson", "Deployed", "Auto", "$320 / $1,500", "Low"],
  ["SaaSBuyer", "Tools & Subscriptions", "Marketing", "Sarah Chen", "Deployed", "Approval Only", "$1,850 / $3,000", "Medium"],
  ["CloudProvisioner", "Infrastructure", "Engineering", "Alex Kim", "Deployed", "Auto", "$38,500 / $50,000", "Medium"],
  ["VendorPayBot", "Rent & Services", "Finance", "Emily Rodriguez", "Paused", "Approval Only", "$12,800 / $25,000", "Low"],
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });
  const [activeStep, setActiveStep] = useState<number | null>(1);

  const policiesPreview = [
    {
      name: "Travel Policy",
      description: "Corporate travel spend governance",
             rules: [
               { type: "Budget Cap", label: "Budget Cap", value: "$15,000/month" },
               { type: "Vendor Allowlist", label: "Vendor Allowlist", value: "Delta, United, Marriott" },
               { type: "Approval Threshold", label: "Approval Threshold", value: "$2,000/transaction" },
             ],
      appliesTo: "TravelAgent",
      enabled: true,
    },
    {
      name: "Cloud Infrastructure Policy",
      description: "Engineering cloud spend controls",
             rules: [
               { type: "Budget Cap", label: "Budget Cap", value: "$50,000/month" },
               { type: "Vendor Allowlist", label: "Vendor Allowlist", value: "AWS, GCP, Azure" },
               { type: "Per-Transaction Cap", label: "Per-Transaction Cap", value: "$5,000" },
             ],
      appliesTo: "CloudProvisioner",
      enabled: true,
    },
  ];

  const auditTrailPreview = [
    {
      id: "txn-001",
      timestamp: "2025-01-15 14:32",
      agent: "TravelAgent",
      owner: "Marcus Johnson",
      vendor: "Delta",
      amount: "$1,980",
      category: "Travel",
      status: "approved",
      justification: "Round-trip flights for team offsite, within policy limits",
      policyDecision: "Auto-approved: within budget and vendor allowlist",
      riskSignals: [],
    },
    {
      id: "txn-002",
      timestamp: "2025-01-15 11:15",
      agent: "CloudProvisioner",
      owner: "Alex Kim",
      vendor: "AWS",
      amount: "$2,750",
      category: "Infrastructure",
      status: "approved",
      justification: "EC2 instance provisioning for Q1 project",
      policyDecision: "Auto-approved: within monthly budget",
      riskSignals: [],
    },
  ];

  return (
    <section className="bg-slate-50 py-24 md:py-32">
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-7xl"
        >
          {/* How Custos Works - Simplified */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How Custos Works</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
              A step-by-step system to launch, control, and scale spend-capable agents with finance confidence.
            </p>
          </div>

          {/* Simplified Workflow Steps - Clickable */}
          <div className="mb-12">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {workflowSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                  className={`rounded-lg border border-slate-900 bg-white p-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-left transition-all hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] cursor-pointer ${
                    activeStep === step.id ? 'bg-[#eefa79]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg font-semibold text-sm border border-slate-900 shadow-[1px_1px_0_0_rgba(0,0,0,1)] ${
                      activeStep === step.id ? 'bg-transparent text-slate-900' : 'bg-transparent text-slate-900'
                    }`}>
                      {step.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                  </div>
                </button>
              ))}
            </div>

            {/* Detailed Step Content - Show Prototype Content */}
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-950">Create Agent Wallet</h3>
                  <p className="mt-0.5 text-sm text-slate-600">Register a new agent and create a virtual wallet for spend control.</p>
                </div>
                <div className="rounded-xl border border-slate-900 bg-white p-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)] space-y-3">
                  <div className="grid gap-2.5 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-900">Agent Name</label>
                      <div className="rounded-lg border border-slate-900 bg-white px-3 py-2 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                        <span className="text-sm text-slate-600">TravelAgent</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-900">Owner</label>
                      <div className="rounded-lg border border-slate-900 bg-white px-3 py-2 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                        <span className="text-sm text-slate-600">Marcus Johnson</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-900">Business Unit</label>
                      <div className="rounded-lg border border-slate-900 bg-white px-3 py-2 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                        <span className="text-sm text-slate-600">Operations</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-900">Function</label>
                      <div className="rounded-lg border border-slate-900 bg-white px-3 py-2 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                        <span className="text-sm text-slate-600">Flights & Hotels</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-2.5">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Virtual Wallet Details</h4>
                    <div className="grid gap-2.5 md:grid-cols-2">
                      <div className="rounded-lg border border-slate-900 bg-white p-2.5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Shield className="w-4 h-4 text-slate-900" />
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wallet ID</span>
                        </div>
                        <p className="text-sm font-mono text-slate-900">wallet_7x9k2m4p</p>
                      </div>
                      <div className="rounded-lg border border-slate-900 bg-white p-2.5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-slate-900" />
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
                        </div>
                        <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-[#eefa79] text-slate-900 border border-slate-900">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-900 bg-[#eefa79] p-2.5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-slate-900" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-900">Access Controls</span>
                    </div>
                    <ul className="space-y-0.5 text-sm text-slate-900">
                      <li className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900 flex-shrink-0" />
                        Virtual card provisioning enabled
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900 flex-shrink-0" />
                        Real-time spend tracking active
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900 flex-shrink-0" />
                        Policy enforcement enabled
              </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Spending Rules</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">Policy-based governance</h3>
                  <p className="mt-0.5 text-sm text-slate-600">
                    Define budgets, vendor allowlists, approval thresholds, and tax-safe rules in readable policies.
                  </p>
                </div>
                <div className="grid gap-3">
                  {policiesPreview.map((policy) => (
                    <div key={policy.name} className="rounded-xl border border-slate-900 bg-white p-3 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${policy.enabled ? "bg-slate-100 text-slate-900" : "bg-slate-100 text-slate-400"}`}>
                            <Shield className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-semibold text-slate-900">{policy.name}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${policy.enabled ? "bg-slate-100 text-slate-900" : "bg-slate-100 text-slate-600"}`}>
                                {policy.enabled ? "Active" : "Disabled"}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-slate-600">{policy.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {policy.rules.map((rule, i) => (
                                <div key={i} className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-white px-2.5 py-1 text-xs shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                                  <span className="font-medium text-slate-700">{rule.label}:</span>
                                  <span className="text-slate-600">{rule.value}</span>
                                </div>
                              ))}
                            </div>
                            <p className="mt-1.5 text-xs text-slate-500">Applies to: <strong className="text-slate-700">{policy.appliesTo}</strong></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Audit Trails</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">Complete transaction context</h3>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Every transaction includes agent identity, policy decisions, justifications, and tax-ready metadata.
                  </p>
                </div>
                <div>
                  {auditTrailPreview.slice(0, 1).map((audit) => (
                    <div key={audit.id} className="rounded-xl border border-slate-900 bg-white p-3 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-slate-900" />
                          <div>
                            <p className="text-xs font-medium text-slate-900">Audit Packet: {audit.id}</p>
                            <p className="text-[10px] text-slate-500">{audit.timestamp}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${audit.status === "approved" ? "bg-[#eefa79] text-slate-900 border border-slate-900" : "bg-orange-300 text-slate-900 border border-slate-900"}`}>
                          {audit.status}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2.5 mb-2.5">
                        <div className="rounded-lg border border-slate-900 bg-white p-2.5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Bot className="w-3.5 h-3.5 text-slate-900" />
                            <span className="text-xs font-medium text-slate-900">Agent Identity</span>
                          </div>
                          <div className="text-xs space-y-0.5 text-slate-600">
                            <p><span className="text-slate-500">Name:</span> {audit.agent}</p>
                            <p><span className="text-slate-500">Owner:</span> {audit.owner}</p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-900 bg-white p-2.5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-900" />
                            <span className="text-xs font-medium text-slate-900">Transaction</span>
                          </div>
                          <div className="text-xs space-y-0.5 text-slate-600">
                            <p><span className="text-slate-500">Vendor:</span> {audit.vendor}</p>
                            <p><span className="text-slate-500">Amount:</span> {audit.amount}</p>
                            <p><span className="text-slate-500">Category:</span> {audit.category}</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-900 bg-white p-2.5 mb-2.5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                        <p className="text-xs font-medium text-slate-900 mb-1">Model Justification</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{audit.justification}</p>
                      </div>
                      <div className="rounded-lg border border-slate-900 bg-white p-2.5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Shield className="w-3.5 h-3.5 text-slate-900" />
                          <span className="text-xs font-medium text-slate-900">Policy Decision</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{audit.policyDecision}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Spending Rules Section - Hidden when any step is active */}
          {activeStep === null && (
          <div className="overflow-hidden rounded-3xl border border-slate-900 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <div className="border-b border-slate-900 bg-slate-50/80 px-8 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Spending Rules</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Policy-based governance</h3>
              <p className="mt-1 text-sm text-slate-600">
                Define budgets, vendor allowlists, approval thresholds, and tax-safe rules in readable policies.
              </p>
            </div>
            <div className="grid gap-4 px-8 py-6">
              {policiesPreview.map((policy) => (
                <div key={policy.name} className="rounded-xl border border-slate-900 bg-slate-50/60 p-5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${policy.enabled ? "bg-slate-100 text-slate-900" : "bg-slate-100 text-slate-400"}`}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-slate-900">{policy.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${policy.enabled ? "bg-slate-100 text-slate-900" : "bg-slate-100 text-slate-600"}`}>
                            {policy.enabled ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{policy.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {policy.rules.map((rule, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-900 bg-white px-3 py-1.5 text-xs shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                              <span className="font-medium text-slate-700">{rule.label}:</span>
                              <span className="text-slate-600">{rule.value}</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-xs text-slate-500">Applies to: <strong className="text-slate-700">{policy.appliesTo}</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Audit Trails Section - Hidden when any step is active */}
          {activeStep === null && (
          <div className="mt-12 overflow-hidden rounded-3xl border border-slate-900 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <div className="border-b border-slate-900 bg-slate-50/80 px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Audit Trails</p>
              <h3 className="mt-1 text-base font-semibold text-slate-900">Complete transaction context</h3>
              <p className="mt-0.5 text-xs text-slate-600">
                Every transaction includes agent identity, policy decisions, justifications, and tax-ready metadata.
              </p>
            </div>
            <div className="grid gap-3 px-4 py-3">
              {auditTrailPreview.map((audit) => (
                <div key={audit.id} className="rounded-xl border border-slate-900 bg-slate-50/60 p-3 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-900" />
                      <div>
                        <p className="text-xs font-medium text-slate-900">Audit Packet: {audit.id}</p>
                        <p className="text-[10px] text-slate-500">{audit.timestamp}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${audit.status === "approved" ? "bg-[#eefa79] text-slate-900 border border-slate-900" : "bg-orange-300 text-slate-900 border border-slate-900"}`}>
                      {audit.status}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2.5 mb-2.5">
                    <div className="rounded-lg border border-slate-900 bg-white p-2.5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Bot className="w-3.5 h-3.5 text-slate-900" />
                        <span className="text-xs font-medium text-slate-900">Agent Identity</span>
                      </div>
                      <div className="text-xs space-y-0.5 text-slate-600">
                        <p><span className="text-slate-500">Name:</span> {audit.agent}</p>
                        <p><span className="text-slate-500">Owner:</span> {audit.owner}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-900 bg-white p-2.5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-900" />
                        <span className="text-xs font-medium text-slate-900">Transaction</span>
                      </div>
                      <div className="text-xs space-y-0.5 text-slate-600">
                        <p><span className="text-slate-500">Vendor:</span> {audit.vendor}</p>
                        <p><span className="text-slate-500">Amount:</span> {audit.amount}</p>
                        <p><span className="text-slate-500">Category:</span> {audit.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-900 bg-white p-2.5 mb-2.5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                    <p className="text-xs font-medium text-slate-900 mb-1">Model Justification</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{audit.justification}</p>
                  </div>
                  <div className="rounded-lg border border-slate-900 bg-white p-2.5 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Shield className="w-3.5 h-3.5 text-slate-900" />
                      <span className="text-xs font-medium text-slate-900">Policy Decision</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{audit.policyDecision}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mx-auto mt-16 grid max-w-7xl gap-6 lg:grid-cols-2"
        >
                 <article className="rounded-xl border border-slate-900 bg-white p-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <h3 className="text-xl font-semibold text-slate-950">Why this exists</h3>
            <p className="mt-3 text-slate-600">Even with agents, teams still need to:</p>
            <ul className="mt-4 space-y-2 text-slate-700">
              {adminTasks.map((task) => (
                <li key={task}>• {task}</li>
              ))}
            </ul>
            <p className="mt-4 text-slate-600">
              Agents can execute spend, but finance needs guardrails, approvals, and tax-ready records.
            </p>
          </article>

                 <article className="rounded-xl border border-slate-900 bg-white p-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <h3 className="text-xl font-semibold text-slate-950">Without Custos</h3>
            <ul className="mt-4 space-y-2 text-slate-700">
              {risksWithoutCustos.map((risk) => (
                <li key={risk}>• {risk}</li>
              ))}
            </ul>
                   <p className="mt-6 rounded-lg border border-slate-900 bg-slate-100 p-4 text-sm text-slate-700 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
              Traditional finance tools were not built for autonomous buyers.
            </p>
          </article>
        </motion.div>
      </div>
    </section>
  );
}
