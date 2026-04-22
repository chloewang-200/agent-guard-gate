import Link from "next/link";
import { Button } from "@/components/ui/button";

type HeroSectionProps = {
  tryNowHref: string;
};

export function HeroSection({ tryNowHref }: HeroSectionProps) {
  return (
    <section id="top" className="bg-white pb-20 pt-16 md:pb-24 md:pt-24">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Spend governance for agentic teams
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Launch trusted spending agents with full control.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
            Custos gives your team policy-based budgets, approval routing, and audit-ready trails for
            every AI agent transaction.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
              <Link href={tryNowHref}>Try now</Link>
            </Button>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center rounded-xl border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Live Control Snapshot</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Active Agents</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">12</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Policy Declines (7d)</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">6</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2">
              <p className="text-xs text-slate-500">Protected Spend</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">$58,420</p>
              <p className="mt-1 text-xs text-slate-500">Every transaction checked against policy before execution.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
