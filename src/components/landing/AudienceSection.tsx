import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, Beaker, Wallet2, ShieldAlert } from "lucide-react";

const audiences = [
  {
    icon: Building2,
    title: "Enterprises Deploying AI Agents",
    description: "Organizations rolling out autonomous agents that need to transact with external systems and vendors.",
  },
  {
    icon: Beaker,
    title: "AI-First Companies",
    description: "Companies experimenting with agent-driven procurement, automation, and autonomous workflows.",
  },
  {
    icon: Wallet2,
    title: "Finance Teams",
    description: "CFOs, controllers, and finance leaders who need real-time controls over non-human spend.",
  },
  {
    icon: ShieldAlert,
    title: "Security & Compliance",
    description: "Teams requiring complete traceability, auditability, and governance for agent actions.",
  },
];

export function AudienceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="audience" className="relative py-24 md:py-32">
      <div className="container relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-body-sm font-medium text-primary border border-primary/20">
            Who It's For
          </span>
          <h2 className="mt-6 text-heading-1 text-foreground">
            Built for Forward-Looking Enterprises
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="group relative rounded-2xl border border-border bg-card p-8 shadow-card transition-all duration-300 hover:shadow-lg hover:border-primary/20"
            >
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <audience.icon className="h-7 w-7" />
                </div>
                
                <div>
                  <h3 className="text-heading-3 text-foreground">
                    {audience.title}
                  </h3>
                  <p className="mt-2 text-body text-muted-foreground">
                    {audience.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
