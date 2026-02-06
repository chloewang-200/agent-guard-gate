import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    title: "Register agents + spend identities",
    points: ["unique agent identity", "virtual card or wallet", "owner + business unit", "access controls"],
  },
  {
    title: "Define budgets + policies",
    points: ["spend modes: auto, approval, simulated", "monthly budgets", "per-transaction caps", "vendor + category rules"],
  },
  {
    title: "Monitor in real time",
    points: ["live spend tracking", "risk signals", "policy checks", "audit-ready metadata"],
  },
  {
    title: "Enforce approvals + exceptions",
    points: ["auto-approved within policy", "route to humans when needed", "override or pause instantly"],
  },
  {
    title: "Close the loop for finance",
    points: ["receipts and tax tags", "immutable audit trails", "report-ready exports", "who approved what"],
  },
];

export function AudienceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white">
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-4xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">How Ledgr Works</h2>
          <p className="mt-3 text-lg text-slate-600">
            A step-by-step system to launch, control, and scale spend-capable agents with finance confidence.
          </p>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-4 lg:grid-cols-2">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: 0.06 * index }}
              className="rounded-xl border border-slate-900 bg-white p-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-semibold text-sm">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                {step.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
