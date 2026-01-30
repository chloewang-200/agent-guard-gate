import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";

const features = [
  {
    title: "Agent Wallets",
    description: "Unique programmable wallet or virtual card per agent. Fund, pause, revoke, or set approval-only mode.",
    details: ["Per-agent isolation", "Instant controls", "Virtual card issuance"],
  },
  {
    title: "Policy Engine",
    description: "Define granular spend rules—budget limits, vendor allowlists, category constraints, and time windows.",
    details: ["Budget limits", "Vendor control", "MCC restrictions"],
  },
  {
    title: "Real-Time Enforcement",
    description: "Transactions approved or declined at authorization. No after-the-fact cleanup required.",
    details: ["Sub-second latency", "Pre-authorization", "Automatic blocking"],
  },
  {
    title: "Contextual Audit Trail",
    description: "Every transaction logs agent identity, triggering prompt, user intent, and model justification.",
    details: ["Full traceability", "Risk signals", "Compliance ready"],
  },
  {
    title: "Spend Observability",
    description: "Detect anomalous purchases, monitor spend drift, and track vendor concentration risk.",
    details: ["Anomaly detection", "Drift monitoring", "Risk alerts"],
  },
  {
    title: "Developer First",
    description: "Simple APIs and SDKs to integrate with any agent framework. Define policies as code.",
    details: ["REST & GraphQL", "Policy as code", "Webhooks"],
  },
];

export function ProductSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="product" className="relative border-y border-border bg-slate-50 py-24 md:py-32">
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            The Solution
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Agent-native spend management
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A governance layer purpose-built for autonomous agents. Define policies, enforce in real-time, and maintain complete visibility.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              
              <ul className="mt-4 space-y-2">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Code example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mx-auto mt-16 max-w-2xl"
        >
          <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
            Define policies as code
          </p>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-slate-700" />
              <div className="h-3 w-3 rounded-full bg-slate-700" />
              <div className="h-3 w-3 rounded-full bg-slate-700" />
              <span className="ml-2 text-xs text-slate-500 font-mono">policy.yaml</span>
            </div>
            <pre className="overflow-x-auto p-4 text-sm">
              <code className="text-slate-300 font-mono">{`agent: gpu-provisioner-v2
rules:
  max_daily_spend: $10,000
  vendors:
    allow: [aws, gcp, azure]
  categories:
    allow: [compute, storage]
  require_approval_above: $5,000`}</code>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}