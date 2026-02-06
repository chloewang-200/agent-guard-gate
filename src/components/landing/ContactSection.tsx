import { motion, useInView } from "framer-motion";
import { CheckCircle2, ShieldCheck, User2, Plane, Package, Wrench, Cloud, Building2, Shield } from "lucide-react";
import { useRef } from "react";

const useCases = [
  {
    icon: Plane,
    title: "Travel & Offsites",
    description: "Let agents book flights and hotels while staying within policy limits and collecting tax-ready receipts automatically.",
  },
  {
    icon: Package,
    title: "Office & Supplies",
    description: "Automate reorders of consumables with vendor limits, tax-exempt tracking, and automatic budget pauses.",
  },
  {
    icon: Wrench,
    title: "SaaS & Tool Procurement",
    description: "Discover, compare, and procure tools with invoice capture and renewal tracking built into every transaction.",
  },
  {
    icon: Cloud,
    title: "Cloud & Infrastructure Spend",
    description: "Control provisioning within project budgets, enforce limits, and route spikes for approval before spend happens.",
  },
  {
    icon: Building2,
    title: "Vendors, Rent, Services",
    description: "Track recurring payments, flag anomalies in real time, and maintain complete audit logs for all vendor spend.",
  },
  {
    icon: Shield,
    title: "Policy Enforcement",
    description: "Set vendor-level limits, enforce policies, and auto-flag out-of-policy spend before transactions are processed.",
  },
];

const scenarios = [
  {
    title: "Team Offsite Travel",
    tag: "TravelAgent · Approval Threshold Enabled",
    request: "Book round-trip flights for 12 teammates from SF to Seattle for the April offsite. Keep total spend under $9,000 and store tax-ready receipts.",
    agentAction: "Compliant options found on Delta and United for $8,420 total. Two seats exceed policy due to timing constraints.",
    enforcement: "Outcome: 10 seats auto-approved.\n2 seats routed to manager approval with receipts attached.",
  },
  {
    title: "Emergency Supplier Reorder",
    tag: "OfficeSupplyRunner · Auto Mode",
    request: "Reorder monitors, adapters, and cables for next week. Max $2,500. Mark tax-exempt items.",
    agentAction: "Approved SKUs matched and split across Staples and Amazon Business. Total spend $2,140, within Operations budget.",
    enforcement: "Outcome: Purchase auto-approved.\nTax tags applied and spend attributed to Operations.",
  },
  {
    title: "SaaS Trial Procurement",
    tag: "SaaSBuyer · New Vendor Check",
    request: "Procure 20 seats of an analytics tool for Marketing. Run a 30-day trial under $1,200 and capture invoices.",
    agentAction: "Three vendors match requirements. Best option priced at $980, but vendor is new.",
    enforcement: "Outcome: Transaction paused.\nRouted for new-vendor approval with invoice capture enforced.",
  },
];

export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="use-cases" className="border-t border-slate-900 bg-white py-24 md:py-32 pb-8 md:pb-12">
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="relative mx-auto max-w-4xl text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Six ways our platform simplifies spend for growing businesses.</h2>
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
              className="rounded-xl border border-slate-900 bg-white p-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                {useCase.icon && (() => {
                  const Icon = useCase.icon;
                  return <Icon className="h-6 w-6 text-blue-600 flex-shrink-0" />;
                })()}
                <h3 className="text-lg font-semibold text-slate-900">{useCase.title}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{useCase.description}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="relative mx-auto mt-14 max-w-6xl text-center"
        >
          <h3 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Example Agent Scenarios</h3>
          <p className="mt-3 text-slate-600">
            Natural-language requests from teams, with controlled execution and audit trails by Ledgr.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <article
                key={scenario.title}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-900 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-shadow"
              >
                <div className="border-b border-slate-900 bg-slate-50 px-5 py-4">
                  <p className="text-base font-semibold text-slate-900">{scenario.title}</p>
                  <p className="mt-1 text-xs font-medium tracking-wide text-slate-500">{scenario.tag}</p>
                </div>

                <div className="flex-1 bg-[radial-gradient(circle_at_top_right,_rgba(148,163,184,0.12),_transparent_45%)] p-5 space-y-4">
                  {/* Request - Right aligned (user side) */}
                  <div className="flex items-start justify-end gap-3">
                    <div className="flex-1 max-w-[80%] rounded-lg border border-slate-900 bg-slate-900 p-4 shadow-[1px_1px_0_0_rgba(0,0,0,1)] text-left">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2 text-left">Request</p>
                      <p className="text-sm text-white leading-relaxed text-left">{scenario.request}</p>
                    </div>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-900 bg-white shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                      <User2 className="h-4 w-4 text-slate-900" />
                    </div>
                  </div>

                  {/* Agent Action - Left aligned (agent side) */}
                  <div className="flex items-start justify-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-900 bg-[#eefa79] shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                      <ShieldCheck className="h-4 w-4 text-slate-900" />
                    </div>
                    <div className="flex-1 max-w-[80%] rounded-lg border border-slate-900 bg-white p-4 shadow-[1px_1px_0_0_rgba(0,0,0,1)] text-left">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 text-left">Agent Action</p>
                      <p className="text-sm text-slate-700 leading-relaxed text-left">{scenario.agentAction}</p>
                    </div>
                  </div>
                </div>

                {/* Ledgr Enforcement - Full width at bottom */}
                <div className="border-t border-slate-900 bg-[#eefa79] px-5 py-4 mt-auto text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-900" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-900">Ledgr Enforcement</p>
                  </div>
                  <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-line text-left">{scenario.enforcement}</p>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
