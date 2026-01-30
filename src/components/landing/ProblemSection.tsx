import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const painPoints = [
  "Which agent initiated this transaction?",
  "Why was this purchase made?",
  "Was policy followed?",
  "Was the vendor approved?",
  "Did the agent hallucinate?",
  "Which business unit is accountable?",
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="problem" className="relative py-24 md:py-32">
      <div className="container" ref={ref}>
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              The Problem
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Traditional finance tools weren't built for AI agents
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Existing spend management assumes human cardholders, manual receipts, and manager approvals. 
              But when autonomous agents start transacting, critical questions go unanswered:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 grid gap-3 sm:grid-cols-2"
          >
            {painPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <span className="text-xs font-medium">?</span>
                </div>
                <p className="text-sm text-foreground">{point}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 rounded-lg border-l-4 border-foreground bg-slate-50 p-6"
          >
            <p className="text-base font-medium text-foreground">
              Autonomous agents break human-centric financial systems. Enterprises need a new control layer.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}