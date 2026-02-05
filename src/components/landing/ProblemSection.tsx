import { motion, useInView } from "framer-motion";
import { AlertTriangle, Bot, CheckCircle2, Clock3, DollarSign, ShieldCheck, FileText, Building2, Shield } from "lucide-react";
import { useRef } from "react";
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

const capabilities = [
  "clear ownership",
  "defined budgets",
  "approval rules",
  "tax-ready receipts",
  "audit-ready logs",
];

const adminTasks = [
  "book flights and hotels",
  "order office supplies",
  "manage SaaS tools",
  "collect receipts for taxes",
  "follow up on approvals",
];

const risksWithoutLedgr = [
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
  approved: "bg-slate-900 text-white",
  pending: "bg-amber-100 text-amber-800",
  review: "bg-slate-100 text-slate-700",
};

const severityClasses: Record<string, string> = {
  critical: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-slate-100 text-slate-700",
};

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  const policiesPreview = [
    {
      name: "Travel Policy",
      description: "Corporate travel spend governance",
      rules: [
        { type: "💰", label: "Budget Cap", value: "$15,000/month" },
        { type: "✅", label: "Vendor Allowlist", value: "Delta, United, Marriott" },
        { type: "👤", label: "Approval Threshold", value: "$2,000/transaction" },
      ],
      appliesTo: "TravelAgent",
      enabled: true,
    },
    {
      name: "Cloud Infrastructure Policy",
      description: "Engineering cloud spend controls",
      rules: [
        { type: "💰", label: "Budget Cap", value: "$50,000/month" },
        { type: "✅", label: "Vendor Allowlist", value: "AWS, GCP, Azure" },
        { type: "💳", label: "Per-Transaction Cap", value: "$5,000" },
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
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Let agents buy, without losing finance trust.
            </h2>
            <p className="mt-6 mx-auto max-w-3xl text-xl text-slate-600">
              Ledgr lets teams deploy spending agents without giving up control of cash, approvals, or compliance.
              Agents do the buying, humans keep the guardrails. Every action is traced, categorized, and report-ready.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-16">
            {capabilities.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 text-base font-medium text-slate-900">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="capitalize">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <div className="border-b border-slate-200 bg-slate-50/80 px-8 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard Preview</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Live spend control and audit visibility</h3>
              <p className="mt-1 text-sm text-slate-600">
                See what agents are spending, where the money went, and which approvals need attention.
              </p>
            </div>

            <div className="grid gap-6 px-8 py-8">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {dashboardMetrics.map((metric) => (
                  <Card key={metric.label} className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {metric.label}
                      </CardDescription>
                      <CardTitle className="mt-2 flex items-center gap-2 text-2xl text-slate-900">
                        <metric.icon className="h-4 w-4 text-slate-400" />
                        {metric.value}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Spend Over Time</CardTitle>
                    <CardDescription>Daily spend across all agents</CardDescription>
                  </CardHeader>
                  <CardContent className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={spendTrend}>
                        <defs>
                          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="10%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v / 1000}k`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, "Spend"]}
                        />
                        <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="url(#spendGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Spend by Agent</CardTitle>
                    <CardDescription>Monthly spend per agent</CardDescription>
                  </CardHeader>
                  <CardContent className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spendByAgent} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v / 1000}k`} />
                        <YAxis dataKey="agent" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={120} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, "Spend"]}
                        />
                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Active Alerts</CardTitle>
                    <CardDescription>Security and compliance notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {alertsPreview.map((alert) => (
                      <div key={alert.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${severityClasses[alert.severity]}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{alert.note}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Recent Transactions</CardTitle>
                    <CardDescription>Latest agent spending activity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {transactionsPreview.map((txn) => (
                      <div key={`${txn.vendor}-${txn.agent}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{txn.vendor}</p>
                          <p className="text-xs text-slate-500">{txn.agent}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{txn.amount}</span>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses[txn.status]}`}>
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Spending Rules Section */}
          <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <div className="border-b border-slate-200 bg-slate-50/80 px-8 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Spending Rules</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Policy-based governance</h3>
              <p className="mt-1 text-sm text-slate-600">
                Define budgets, vendor allowlists, approval thresholds, and tax-safe rules in readable policies.
              </p>
            </div>
            <div className="grid gap-4 px-8 py-6">
              {policiesPreview.map((policy) => (
                <div key={policy.name} className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${policy.enabled ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-slate-900">{policy.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${policy.enabled ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                            {policy.enabled ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{policy.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {policy.rules.map((rule, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs">
                              <span>{rule.type}</span>
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

          {/* Audit Trails Section */}
          <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <div className="border-b border-slate-200 bg-slate-50/80 px-8 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Audit Trails</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Complete transaction context</h3>
              <p className="mt-1 text-sm text-slate-600">
                Every transaction includes agent identity, policy decisions, justifications, and tax-ready metadata.
              </p>
            </div>
            <div className="grid gap-4 px-8 py-6">
              {auditTrailPreview.map((audit) => (
                <div key={audit.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900">Audit Packet: {audit.id}</p>
                        <p className="text-xs text-slate-500">{audit.timestamp}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${audit.status === "approved" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                      {audit.status}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-900">Agent Identity</span>
                      </div>
                      <div className="text-sm space-y-1 text-slate-600">
                        <p><span className="text-slate-500">Name:</span> {audit.agent}</p>
                        <p><span className="text-slate-500">Owner:</span> {audit.owner}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-900">Transaction</span>
                      </div>
                      <div className="text-sm space-y-1 text-slate-600">
                        <p><span className="text-slate-500">Vendor:</span> {audit.vendor}</p>
                        <p><span className="text-slate-500">Amount:</span> {audit.amount}</p>
                        <p><span className="text-slate-500">Category:</span> {audit.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4 mb-4">
                    <p className="text-sm font-medium text-slate-900 mb-2">Model Justification</p>
                    <p className="text-sm text-slate-600">{audit.justification}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-slate-900">Policy Decision</span>
                    </div>
                    <p className="text-sm text-slate-600">{audit.policyDecision}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-base font-medium text-slate-900">
            If you're scaling spend and want agents you can trust, Ledgr is for you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mx-auto mt-16 grid max-w-7xl gap-6 lg:grid-cols-2"
        >
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-950">Without Ledgr</h3>
            <ul className="mt-4 space-y-2 text-slate-700">
              {risksWithoutLedgr.map((risk) => (
                <li key={risk}>• {risk}</li>
              ))}
            </ul>
            <p className="mt-6 rounded-lg border border-slate-300 bg-slate-100 p-4 text-sm text-slate-700">
              Traditional finance tools were not built for autonomous buyers.
            </p>
          </article>
        </motion.div>
      </div>
    </section>
  );
}
