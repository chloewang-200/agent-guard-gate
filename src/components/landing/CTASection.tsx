import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

const reasons = [
  "Deploy agents with clear spend limits",
  "Keep approvals and humans-in-the-loop",
  "Stay tax-ready from day one",
  "See where money went, instantly",
];

const audiences = [
  "Growth-stage teams scaling spend",
  "Finance leaders who need audit-ready trails",
  "Founders who want leverage without risk",
  "Engineering teams deploying internal agents",
];

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="beta" className="relative bg-white py-24 md:py-32">
      <div className="container relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-6xl"
        >
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
            <article className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Developer-first control layer</h2>
              <p className="mt-3 text-slate-600">
                Plug into your agent stack with APIs, webhooks, and policy templates built for finance-grade control.
              </p>
              <ul className="mt-5 space-y-2 text-slate-700">
                <li>• REST and GraphQL APIs</li>
                <li>• Webhooks</li>
                <li>• Policy-as-code</li>
                <li>• Tax + receipt rules</li>
              </ul>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                <pre className="overflow-x-auto p-4 text-sm text-slate-200"><code>{`agent: TravelAgent-v1
rules:
  monthly_budget: 15000
  vendors:
    allow: [delta, united, marriott]
  categories:
    allow: [travel, lodging]
  require_approval_above: 2000`}</code></pre>
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900">Why teams choose Ledgr</h3>
              <ul className="mt-6 space-y-3 text-base text-slate-700">
                {reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-3">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-l-4 border-blue-600 pl-4 text-base italic text-slate-700">
                Ledgr lets teams deploy trusted spending agents today and turn on full automation tomorrow.
              </p>

              <h3 className="mt-10 text-2xl font-bold text-slate-900">Who it's for</h3>
              <ul className="mt-6 space-y-3 text-base text-slate-700">
                {audiences.map((audience) => (
                  <li key={audience} className="flex items-start gap-3">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{audience}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mx-auto mt-16 max-w-4xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Join the Private Beta</h2>
          <p className="mt-6 mx-auto max-w-2xl text-xl text-slate-600">
            We are working with a small group of early teams to define how AI agents should manage spend with finance oversight.
          </p>
          <p className="mt-4 text-lg text-slate-600">No sales pitch. No obligation. Just early access and honest feedback.</p>

          <div className="mt-6">
            <WaitlistForm size="lg" buttonLabel="Join Private Beta" placeholder="Work email" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
