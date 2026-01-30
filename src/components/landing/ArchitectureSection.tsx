import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const layers = [
  {
    name: "Rails Layer",
    description: "Payment infrastructure",
    companies: ["Stripe", "PayPal", "Visa", "Mastercard"],
    color: "slate",
  },
  {
    name: "Issuing Layer",
    description: "Card issuance platforms",
    companies: ["Stripe Issuing", "Lithic", "Marqeta"],
    color: "slate",
  },
  {
    name: "Human Spend Management",
    description: "Traditional expense tools",
    companies: ["Ramp", "Brex", "Expensify", "Airbase"],
    color: "slate",
  },
  {
    name: "Agent Spend Governance",
    description: "This platform",
    companies: ["AgentLayer"],
    color: "primary",
    highlight: true,
  },
];

export function ArchitectureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="architecture" className="relative py-24 md:py-32 bg-slate-50">
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      <div className="container relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-body-sm font-medium text-blue-600 border border-blue-200">
            Architecture
          </span>
          <h2 className="mt-6 text-heading-1 text-foreground">
            Where This Fits in the Stack
          </h2>
          <p className="mt-4 text-body-lg text-muted-foreground">
            Just as FinOps emerged for cloud infrastructure, agentic enterprises will need AgentOps Finance.
          </p>
        </motion.div>

        {/* Stack diagram */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="relative space-y-4">
            {layers.map((layer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className={`relative rounded-2xl border p-6 transition-all duration-300 ${
                  layer.highlight
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card shadow-card hover:shadow-md"
                }`}
              >
                {layer.highlight && (
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="h-6 w-1.5 rounded-full bg-primary" />
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className={`text-heading-3 ${layer.highlight ? "text-primary" : "text-foreground"}`}>
                        {layer.name}
                      </h3>
                      {layer.highlight && (
                        <span className="rounded-full bg-primary px-3 py-0.5 text-caption font-medium text-primary-foreground">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-body-sm text-muted-foreground">
                      {layer.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {layer.companies.map((company, i) => (
                      <span
                        key={i}
                        className={`rounded-lg px-3 py-1.5 text-body-sm font-medium ${
                          layer.highlight
                            ? "bg-primary text-primary-foreground"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Connecting lines */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-border via-primary/30 to-border hidden md:block" />
          </div>
        </div>

        {/* Competitive context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <h3 className="text-heading-3 text-foreground mb-6">
              Competitive Landscape
            </h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-body-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                  Direct
                </p>
                <p className="text-body-sm text-muted-foreground">
                  Locus (early, agent-creation focused). We differentiate with enterprise governance, agent-agnostic design.
                </p>
              </div>
              
              <div>
                <p className="text-body-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                  Adjacent
                </p>
                <p className="text-body-sm text-muted-foreground">
                  OpenAI Agentic Commerce, Amazon "Buy For Me", PayPal agent wallets. Consumer-facing, not governance.
                </p>
              </div>
              
              <div>
                <p className="text-body-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                  Indirect
                </p>
                <p className="text-body-sm text-muted-foreground">
                  Ramp/Brex (human-centric), ServiceNow (workflow compliance, no payments).
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-body text-foreground font-medium">
                This platform is not a payment processor or agent framework—it's the governance layer missing from agentic commerce.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
