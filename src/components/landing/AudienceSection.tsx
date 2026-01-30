import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, Beaker, Wallet2, ShieldAlert } from "lucide-react";

const audiences = [
  {
    icon: Building2,
    title: "Enterprises deploying AI agents",
    description: "Organizations rolling out autonomous agents that need to transact with external systems.",
  },
  {
    icon: Beaker,
    title: "AI-first companies",
    description: "Companies experimenting with agent-driven procurement and automation.",
  },
  {
    icon: Wallet2,
    title: "Finance teams",
    description: "CFOs and controllers who need real-time controls over non-human spend.",
  },
  {
    icon: ShieldAlert,
    title: "Security & compliance",
    description: "Teams requiring complete traceability and governance for agent actions.",
  },
];

export function AudienceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="audience" className="relative py-24 md:py-32">
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Who It's For
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Built for forward-looking enterprises
          </h2>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <audience.icon className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{audience.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{audience.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}