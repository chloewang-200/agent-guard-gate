import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { AlertCircle, HelpCircle, UserX, Clock, FileSearch, Shield } from "lucide-react";

const painPoints = [
  {
    icon: UserX,
    question: "Which agent initiated this transaction?",
  },
  {
    icon: HelpCircle,
    question: "Why was this purchase made?",
  },
  {
    icon: Shield,
    question: "Was policy followed?",
  },
  {
    icon: FileSearch,
    question: "Was the vendor approved?",
  },
  {
    icon: AlertCircle,
    question: "Did the agent hallucinate or get prompt-injected?",
  },
  {
    icon: Clock,
    question: "Which business unit is accountable?",
  },
];

const assumptions = [
  "A human cardholder",
  "Manual receipt submission",
  "Post-hoc review",
  "Manager approval chains",
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="problem" className="relative py-24 md:py-32 bg-slate-50">
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      <div className="container relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-amber-50 px-4 py-1.5 text-body-sm font-medium text-amber-600 border border-amber-200">
            The Problem
          </span>
          <h2 className="mt-6 text-heading-1 text-foreground">
            Why Existing Finance Tools Fail for AI Agents
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <p className="text-body-lg text-foreground font-medium mb-6">
              Traditional spend tools assume:
            </p>
            <div className="grid grid-cols-2 gap-4">
              {assumptions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3"
                >
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="text-body text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          <p className="text-center text-body-lg text-muted-foreground mb-8">
            But with autonomous agents, critical questions go unanswered:
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {painPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="group relative rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                    <point.icon className="h-5 w-5" />
                  </div>
                  <p className="text-body text-foreground font-medium">
                    {point.question}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 rounded-2xl border-2 border-foreground/10 bg-background px-8 py-5">
            <AlertCircle className="h-6 w-6 text-foreground" />
            <p className="text-body-lg font-semibold text-foreground">
              Autonomous agents break human-centric financial systems. Enterprises need a new control layer.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
