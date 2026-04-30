import { motion, useInView } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const capabilities = [
  { label: "clear ownership", color: "bg-[#eefa79]" },
  { label: "defined budgets", color: "bg-[#eefa79]" },
  { label: "approval rules", color: "bg-[#eefa79]" },
  { label: "tax-ready receipts", color: "bg-[#eefa79]" },
  { label: "audit-ready logs", color: "bg-[#eefa79]" },
];

const agents = [
  ["TravelAgent", "Flights & Hotels", "Operations", "Marcus Johnson", "Deployed", "Auto", "$4,250 / $15,000", "Low"],
  ["OfficeSupplyRunner", "Office Supplies", "Operations", "Marcus Johnson", "Deployed", "Auto", "$320 / $1,500", "Low"],
  ["SaaSBuyer", "Tools & Subscriptions", "Marketing", "Sarah Chen", "Deployed", "Approval Only", "$1,850 / $3,000", "Medium"],
  ["CloudProvisioner", "Infrastructure", "Engineering", "Alex Kim", "Deployed", "Auto", "$38,500 / $50,000", "Medium"],
  ["VendorPayBot", "Rent & Services", "Finance", "Emily Rodriguez", "Paused", "Approval Only", "$12,800 / $25,000", "Low"],
];

export function IntroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section className="bg-white py-12 md:py-32">
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-7xl"
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Let agents buy, without losing{" "}
              <span className="relative inline-block">
                <span className="relative z-10">finance trust</span>
                <svg
                  className="absolute bottom-0 left-0 h-3 w-full -rotate-1"
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                  style={{ overflow: "visible" }}
                >
                  <path
                    d="M 0 15 Q 20 10, 40 12 T 80 10 T 120 12 T 160 10 T 200 12"
                    stroke="#0f172a"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))" }}
                  />
                </svg>
              </span>
              .
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-[15px] leading-snug text-slate-600 sm:text-lg sm:leading-relaxed">
              Custos lets teams deploy spending agents without giving up control of cash, approvals, or compliance.
              Agents do the buying, humans keep the guardrails. Every action is traced, categorized, and report-ready.
            </p>
          </div>

          <div className="mb-10 grid grid-cols-2 gap-3 sm:mb-16 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {capabilities.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 rounded-lg border border-slate-900 ${item.color} px-3 py-2 text-sm font-medium text-slate-900 shadow-[1px_1px_0_0_rgba(0,0,0,1)] sm:gap-3 sm:px-5 sm:py-4 sm:text-base ${item.label === "tax-ready receipts" ? "hidden sm:flex" : ""}`}
              >
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-slate-900 sm:h-5 sm:w-5" />
                <span className="capitalize">{item.label}</span>
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="overflow-hidden rounded-xl border border-slate-900 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          >
            <div className="border-b border-slate-900 bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-950">Deployed Spending Agents</h3>
            </div>

            <Table className="whitespace-nowrap">
              <TableHeader>
                <TableRow className="hover:bg-white">
                  <TableHead className="whitespace-nowrap">Agent</TableHead>
                  <TableHead className="whitespace-nowrap">Function</TableHead>
                  <TableHead className="whitespace-nowrap">Business Unit</TableHead>
                  <TableHead className="whitespace-nowrap">Owner</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Spend Mode</TableHead>
                  <TableHead className="whitespace-nowrap">Budget Used</TableHead>
                  <TableHead className="whitespace-nowrap">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((row) => (
                  <TableRow key={row[0]} className="hover:bg-slate-50/70">
                    <TableCell className="whitespace-nowrap font-medium text-slate-900">{row[0]}</TableCell>
                    <TableCell className="whitespace-nowrap">{row[1]}</TableCell>
                    <TableCell className="whitespace-nowrap">{row[2]}</TableCell>
                    <TableCell className="whitespace-nowrap">{row[3]}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${row[4] === "Paused" ? "bg-slate-100 text-slate-700" : "bg-slate-900 text-white"}`}
                      >
                        {row[4]}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{row[5]}</TableCell>
                    <TableCell className="whitespace-nowrap">{row[6]}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${row[7] === "Medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"}`}
                      >
                        {row[7]}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
