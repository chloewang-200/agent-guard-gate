const solutionCards = [
  {
    title: "Policy-first spending",
    description: "Set category caps, approved vendors, and per-transaction thresholds before agents execute.",
  },
  {
    title: "Approval routing",
    description: "Escalate only high-risk spend to humans and keep low-risk operations moving automatically.",
  },
  {
    title: "Audit trail by default",
    description: "Track who, what, why, and when across every transaction for compliance and finance review.",
  },
];

const workflowSteps = [
  {
    title: "Register",
    description: "Create agent identities, wallets, and ownership boundaries by team and budget.",
  },
  {
    title: "Define controls",
    description: "Apply spend policies with thresholds, allowlists, tax metadata, and decision modes.",
  },
  {
    title: "Monitor and enforce",
    description: "Observe real-time activity, auto-enforce policies, and review alerts from one control plane.",
  },
];

const useCases = [
  "Travel booking with budget and vendor controls",
  "SaaS renewals with owner approval workflows",
  "Cloud provisioning with per-service guardrails",
  "Back-office procurement with complete traceability",
];

export function Sections() {
  return (
    <>
      <section id="solution" className="bg-slate-50 py-20 md:py-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Solution</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Custos combines policy, approvals, and observability so agent-led spending remains fast and safe.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {solutionCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20 md:py-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How It Works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="bg-slate-50 py-20 md:py-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Use Cases</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {useCases.map((item) => (
              <li key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
