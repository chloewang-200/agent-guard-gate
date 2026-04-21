import { motion, useInView } from "framer-motion";
import { AlertTriangle, Bot, Clock3, DollarSign, ShieldCheck } from "lucide-react";
import { useRef } from "react";

const kpis = [
  { title: "Total Spend (7d)", value: "$57,420", icon: DollarSign, tone: "text-slate-900" },
  { title: "Active Agents", value: "4 / 5", icon: Bot, tone: "text-slate-900" },
  { title: "Policy Declines", value: "11", icon: ShieldCheck, tone: "text-rose-700" },
  { title: "Pending Approvals", value: "3", icon: Clock3, tone: "text-amber-700" },
];

const alerts = [
  {
    severity: "warning",
    title: "Spend drift on CloudProvisioner",
    description: "Daily spend is 22% above baseline over the last 48 hours.",
    time: "2h ago",
  },
  {
    severity: "critical",
    title: "Unapproved vendor attempt",
    description: "TravelAgent requested payment to unlisted vendor: SkyLux Charter.",
    time: "4h ago",
  },
  {
    severity: "info",
    title: "Approval SLA nearing deadline",
    description: "SaaSBuyer request for $1,250 expires in 1h 12m.",
    time: "6h ago",
  },
];

const approvals = [
  ["TravelAgent", "Marriott", "$1,980", "Within travel policy", "Approve"],
  ["SaaSBuyer", "Figma", "$420", "Net-new renewal line item", "Approve"],
  ["CloudProvisioner", "AWS", "$2,750", "Above auto-spend threshold", "Review"],
];

const severityClass: Record<string, string> = {
  critical: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-slate-100 text-slate-700",
};

export function PrototypeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="prototype" className="relative border-y border-slate-200 bg-slate-50/70 py-20 md:py-28">
      <div className="absolute inset-0 bg-ambient opacity-70" />
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="relative mx-auto max-w-4xl"
        >
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Product In Action</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            How Custos controls agent spending in real time
          </h2>
          <p className="mt-4 text-[15px] text-slate-600 leading-snug sm:text-lg sm:leading-relaxed">
            Monitor spend across agents, route approvals automatically, and investigate risk with full context.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="relative mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {kpis.map((kpi) => (
            <article key={kpi.title} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{kpi.title}</p>
                <span className="rounded-md bg-slate-100 p-2 text-slate-700">
                  <kpi.icon className="h-4 w-4" />
                </span>
              </div>
              <p className={`mt-3 text-2xl font-semibold ${kpi.tone}`}>{kpi.value}</p>
            </article>
          ))}
        </motion.div>

        <div className="relative mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-950">Active Alerts</h3>
            <div className="mt-4 space-y-3">
              {alerts.map((alert) => (
                <div key={alert.title} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{alert.description}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${severityClass[alert.severity]}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{alert.time}</p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-950">Approval Queue</h3>
            <div className="mt-4 space-y-3">
              {approvals.map((row) => (
                <div key={`${row[0]}-${row[1]}`} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {row[0]} <span className="font-normal text-slate-500">→ {row[1]}</span>
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{row[2]}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{row[3]}</p>
                  <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    <AlertTriangle className="h-3 w-3" />
                    {row[4]}
                  </div>
                </div>
              ))}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
