import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Wallet, 
  ShieldCheck, 
  Zap, 
  FileText, 
  BarChart3,
  CheckCircle2
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Agent Wallets",
    description: "Unique programmable wallet or virtual card per agent",
    details: [
      "Fund, pause, or revoke instantly",
      "Set approval-only mode",
      "Granular control per agent",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Policy Engine",
    description: "Define and enforce spend rules in real-time",
    details: [
      "Budget limits (daily/monthly)",
      "Vendor allowlists & blocklists",
      "SKU & category constraints",
      "Time windows & MCC restrictions",
    ],
  },
  {
    icon: Zap,
    title: "Real-Time Enforcement",
    description: "Transactions approved or declined at authorization",
    details: [
      "No after-the-fact cleanup",
      "Sub-second decision latency",
      "Automatic policy application",
    ],
  },
  {
    icon: FileText,
    title: "Contextual Audit Trail",
    description: "Every transaction logs complete context",
    details: [
      "Agent identity & triggering prompt",
      "User intent (if delegated)",
      "Model justification & risk signals",
    ],
  },
  {
    icon: BarChart3,
    title: "Spend Observability",
    description: "Monitor and analyze agent spend patterns",
    details: [
      "Detect anomalous purchases",
      "Monitor spend drift",
      "Track vendor concentration risk",
    ],
  },
];

export function ProductSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="product" className="relative py-24 md:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-hero-glow pointer-events-none opacity-50" />
      
      <div className="container relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-body-sm font-medium text-emerald-600 border border-emerald-200">
            The Solution
          </span>
          <h2 className="mt-6 text-heading-1 text-foreground">
            Agent-Native Spend Management
          </h2>
          <p className="mt-4 text-body-lg text-muted-foreground">
            A spend governance layer purpose-built for autonomous agents. Define policies, enforce in real-time, and maintain complete visibility.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-lg hover:border-primary/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              
              <h3 className="mt-4 text-heading-3 text-foreground">
                {feature.title}
              </h3>
              
              <p className="mt-2 text-body text-muted-foreground">
                {feature.description}
              </p>
              
              <ul className="mt-4 space-y-2">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Example policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-slate-950 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-2 text-caption text-slate-400 font-mono">policy.yaml</span>
            </div>
            <pre className="text-body-sm text-slate-300 font-mono overflow-x-auto">
              <code>{`agent: gpu-provisioner-v2
rules:
  - max_daily_spend: $10,000
  - vendors:
      allow: [aws, gcp, azure, lambda-labs]
  - categories:
      allow: [compute, storage]
  - require_approval_above: $5,000
  - time_window: business_hours_only`}</code>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
