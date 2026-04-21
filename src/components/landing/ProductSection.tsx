import { motion, useInView } from "framer-motion";
import { Layers, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    title: "Policy + tax-safe guardrails",
    description: "Define budgets, approvals, vendor limits, and tax-safe rules in a readable policy layer.",
    icon: ShieldCheck,
    color: "bg-white",
  },
  {
    title: "Unified spend visibility",
    description: "Track autonomous and approval-only spend by team, vendor, and GL category.",
    icon: Layers,
    color: "bg-white",
  },
  {
    title: "Adaptive controls",
    description: "Tune risk thresholds and approval flows per agent as trust grows.",
    icon: SlidersHorizontal,
    color: "bg-white",
  },
];

export function ProductSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="solution" className="pt-16 pb-24 md:pt-20 md:pb-32 bg-white">
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-5xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            The <span className="relative inline-block">
              <span className="relative z-10">fintech control layer</span>
              <svg 
                className="absolute bottom-0 left-0 w-full h-3 -rotate-1"
                viewBox="0 0 200 20"
                preserveAspectRatio="none"
                style={{ overflow: 'visible' }}
              >
                <path
                  d="M 0 15 Q 20 10, 40 12 T 80 10 T 120 12 T 160 10 T 200 12"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}
                />
              </svg>
            </span> for AI transactions
          </h2>
          <p className="mt-6 mx-auto max-w-3xl text-[15px] text-slate-600 leading-snug sm:text-lg sm:leading-relaxed">
            Custos is the control plane for AI agents that initiate, request, or execute company spend.
            You define the rules. Agents operate within them.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mt-10 sm:mt-12 grid gap-5 sm:gap-6 md:grid-cols-3"
        >
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`rounded-lg border border-slate-900 ${feature.color} p-4 sm:p-7 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-shadow`}
            >
              <div className="flex items-center gap-3 sm:block">
                <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <feature.icon className="h-6 w-6" />
                </span>
                <h3 className="text-base sm:mt-5 sm:text-xl font-bold text-slate-900">{feature.title}</h3>
              </div>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
