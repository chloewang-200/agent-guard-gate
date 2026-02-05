import { motion, useInView } from "framer-motion";
import { CheckCircle2, ShieldCheck, User2 } from "lucide-react";
import { useRef } from "react";

const useCases = [
  {
    title: "Travel & Offsites",
    points: ["Book flights and hotels", "Stay within policy", "Collect receipts for tax", "Auto-submit expenses"],
  },
  {
    title: "Office & Supplies",
    points: ["Reorder consumables", "Track recurring spend", "Flag tax-exempt items", "Pause when budgets are hit"],
  },
  {
    title: "SaaS & Tool Procurement",
    points: ["Discover tools", "Compare pricing", "Track renewals", "Capture invoices for tax"],
  },
  {
    title: "Cloud & Infrastructure Spend",
    points: ["Provision within limits", "Enforce project budgets", "Approval for spikes", "Spend attribution"],
  },
  {
    title: "Vendors, Rent, Services",
    points: ["Track recurring payments", "Flag anomalies", "Prepare approvals", "Maintain audit logs"],
  },
];

const scenarios = [
  {
    title: "Team Offsite Travel",
    tag: "TravelAgent · Approval threshold",
    user: "Book round-trip flights for 12 teammates from SF to Seattle for the April offsite. Keep it under $9,000 total and store tax receipts.",
    agent: "I found compliant options on Delta and United for $8,420 total. Two seats exceed policy due to timing constraints. Route those for manager approval?",
    outcome: "Outcome: 10 seats auto-approved, 2 seats sent to approval queue with tax-ready receipts attached.",
  },
  {
    title: "Emergency Supplier Reorder",
    tag: "OfficeSupplyRunner · Auto mode",
    user: "Our operations closet is low. Reorder monitors, adapters, and cables for next week, max $2,500. Mark tax-exempt items.",
    agent: "I matched approved SKUs and split the order across Staples and Amazon Business. Total is $2,140 and within Operations monthly budget.",
    outcome: "Outcome: Auto-approved purchase with tax tags and spend attribution to Operations.",
  },
  {
    title: "SaaS Trial Procurement",
    tag: "SaaSBuyer · New vendor check",
    user: "Get 20 seats of an analytics tool for marketing and run a 30-day trial under $1,200 with invoices captured for tax.",
    agent: "Three vendors match requirements. Best option is $980 but it's a new vendor, so approval is required before checkout.",
    outcome: "Outcome: Purchase paused and routed for new-vendor approval with invoice capture enforced.",
  },
];

export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="use-cases" className="border-y border-slate-200 bg-white py-24 md:py-32">
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="relative mx-auto max-w-4xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Core Use Cases</h2>
          <p className="mt-3 text-lg text-slate-600">
            Deploy agents that handle real spend while finance keeps approvals, visibility, and report-ready trails.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-3">
          {useCases.map((useCase, index) => (
            <motion.article
              key={useCase.title}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: 0.06 * index }}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-slate-900">{useCase.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {useCase.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="relative mx-auto mt-14 max-w-6xl"
        >
          <h3 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Example Agent Scenarios</h3>
          <p className="mt-3 text-slate-600">
            Natural-language requests from teams, with controlled execution and audit trails by Ledgr.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <article
                key={scenario.title}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-base font-semibold text-slate-900">{scenario.title}</p>
                  <p className="mt-1 text-xs font-medium tracking-wide text-slate-500">{scenario.tag}</p>
                </div>

                <div className="bg-[radial-gradient(circle_at_top_right,_rgba(148,163,184,0.12),_transparent_45%)] p-5">
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <User2 className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">User</p>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <p className="max-w-[92%] rounded-2xl rounded-tr-md bg-slate-900 px-3 py-2 text-sm text-white shadow-sm">
                        {scenario.user}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ledgr Agent</p>
                    </div>
                    <div className="mt-3">
                      <p className="max-w-[94%] rounded-lg rounded-tl-md bg-slate-900 text-white px-3 py-2 text-sm">
                        {scenario.agent}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-slate-400" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Enforcement Outcome</p>
                    </div>
                    <p className="mt-1 text-slate-700">{scenario.outcome}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
