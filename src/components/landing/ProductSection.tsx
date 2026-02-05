import { motion, useInView } from "framer-motion";
import { Layers, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useRef } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const agents = [
  ["TravelAgent", "Flights & Hotels", "Operations", "Marcus Johnson", "Deployed", "Auto", "$4,250 / $15,000", "Low"],
  ["OfficeSupplyRunner", "Office Supplies", "Operations", "Marcus Johnson", "Deployed", "Auto", "$320 / $1,500", "Low"],
  ["SaaSBuyer", "Tools & Subscriptions", "Marketing", "Sarah Chen", "Deployed", "Approval Only", "$1,850 / $3,000", "Medium"],
  ["CloudProvisioner", "Infrastructure", "Engineering", "Alex Kim", "Deployed", "Auto", "$38,500 / $50,000", "Medium"],
  ["VendorPayBot", "Rent & Services", "Finance", "Emily Rodriguez", "Paused", "Approval Only", "$12,800 / $25,000", "Low"],
];

const features = [
  {
    title: "Policy + tax-safe guardrails",
    description: "Define budgets, approvals, vendor limits, and tax-safe rules in a readable policy layer.",
    icon: ShieldCheck,
  },
  {
    title: "Unified spend visibility",
    description: "Track autonomous and approval-only spend by team, vendor, and GL category.",
    icon: Layers,
  },
  {
    title: "Adaptive controls",
    description: "Tune risk thresholds and approval flows per agent as trust grows.",
    icon: SlidersHorizontal,
  },
];

export function ProductSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="solution" className="py-24 md:py-32 bg-white">
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-5xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            A fintech control layer for AI purchasing agents
          </h2>
          <p className="mt-6 mx-auto max-w-3xl text-xl text-slate-600">
            Ledgr is the control plane for AI agents that initiate, request, or execute company spend.
            You define the rules. Agents operate within them.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {features.map((feature) => (
            <article key={feature.title} className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <feature.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.14 }}
          className="mt-12 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-950">Deployed Spending Agents</h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-white">
                <TableHead>Agent</TableHead>
                <TableHead>Function</TableHead>
                <TableHead>Business Unit</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Spend Mode</TableHead>
                <TableHead>Budget Used</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((row) => (
                <TableRow key={row[0]} className="hover:bg-slate-50/70">
                  <TableCell className="font-medium text-slate-900">{row[0]}</TableCell>
                  <TableCell>{row[1]}</TableCell>
                  <TableCell>{row[2]}</TableCell>
                  <TableCell>{row[3]}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row[4] === "Paused" ? "bg-slate-100 text-slate-700" : "bg-slate-900 text-white"}`}>
                      {row[4]}
                    </span>
                  </TableCell>
                  <TableCell>{row[5]}</TableCell>
                  <TableCell>{row[6]}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${row[7] === "Medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                      {row[7]}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption className="px-5 pb-5 text-left text-sm text-slate-500">
              Even if agents do not directly pay yet, Ledgr defines what they are allowed to spend and how.
            </TableCaption>
          </Table>
        </motion.div>
      </div>
    </section>
  );
}
