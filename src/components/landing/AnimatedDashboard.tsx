import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, CheckCircle2, Shield, FileText, ArrowRight } from "lucide-react";

interface Transaction {
  id: string;
  vendor: string;
  agent: string;
  amount: string;
  status: "approved" | "pending" | "declined";
  time: string;
}

interface PolicyCheck {
  id: string;
  policy: string;
  result: "passed" | "failed";
  time: string;
}

interface AuditRecord {
  id: string;
  action: string;
  agent: string;
  time: string;
}

const transactions: Transaction[] = [
  { id: "1", vendor: "Delta Airlines", agent: "TravelAgent", amount: "$1,980", status: "approved", time: "2s ago" },
  { id: "2", vendor: "AWS", agent: "CloudProvisioner", amount: "$2,750", status: "approved", time: "5s ago" },
  { id: "3", vendor: "Figma", agent: "SaaSBuyer", amount: "$420", status: "pending", time: "8s ago" },
];

const policyChecks: PolicyCheck[] = [
  { id: "1", policy: "Budget check", result: "passed", time: "2s ago" },
  { id: "2", policy: "Vendor allowlist", result: "passed", time: "5s ago" },
  { id: "3", policy: "Approval threshold", result: "passed", time: "8s ago" },
];

const auditRecords: AuditRecord[] = [
  { id: "1", action: "Transaction approved", agent: "TravelAgent", time: "2s ago" },
  { id: "2", action: "Policy evaluated", agent: "CloudProvisioner", time: "5s ago" },
  { id: "3", action: "Audit trail created", agent: "SaaSBuyer", time: "8s ago" },
];

export function AnimatedDashboard() {
  const [visibleTransactions, setVisibleTransactions] = useState<string[]>([]);
  const [visiblePolicies, setVisiblePolicies] = useState<string[]>([]);
  const [visibleAudits, setVisibleAudits] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const animate = () => {
      // Reset
      setVisibleTransactions([]);
      setVisiblePolicies([]);
      setVisibleAudits([]);

      // Animate transactions
      transactions.forEach((txn, index) => {
        setTimeout(() => {
          setVisibleTransactions((prev) => [...prev, txn.id]);
        }, index * 2500);
      });

      // Animate policy checks
      policyChecks.forEach((policy, index) => {
        setTimeout(() => {
          setVisiblePolicies((prev) => [...prev, policy.id]);
        }, index * 2500 + 300);
      });

      // Animate audit records
      auditRecords.forEach((audit, index) => {
        setTimeout(() => {
          setVisibleAudits((prev) => [...prev, audit.id]);
        }, index * 2500 + 600);
      });
    };

    // Initial animation
    animate();

    // Loop animation every 10 seconds (enough time for all items to show)
    const interval = setInterval(() => {
      animate();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-[#eefa79] text-slate-900 border-slate-900";
      case "pending":
        return "bg-orange-300 text-slate-900 border-slate-900";
      case "declined":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-8 lg:gap-12 max-w-full mx-auto">
      {/* Transactions Column */}
      <div className="rounded-lg border border-slate-900 bg-white p-3 sm:p-5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] min-w-0 sm:min-w-[200px]">
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Transactions</h3>
        </div>
        <div className={`space-y-2 ${isMobile ? 'min-h-0' : 'min-h-[280px]'}`}>
          <AnimatePresence>
            {(isMobile ? transactions.slice(0, 1) : transactions).map((txn) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -20 }}
                animate={
                  visibleTransactions.includes(txn.id)
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: -20 }
                }
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                      className="rounded-lg border border-slate-900 bg-slate-50 p-2.5 sm:p-4 shadow-[1px_1px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-shadow relative"
              >
                {isMobile ? (
                  <div className="relative">
                    <div className="pr-16">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-xs text-slate-900 leading-tight">{txn.vendor}</p>
                        <span className="text-[11px] text-slate-600 leading-tight">{txn.amount}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-600 leading-tight">{txn.agent}</p>
                    </div>
                    <div className="absolute right-0 -top-2.5">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium border whitespace-nowrap ${getStatusColor(txn.status)}`}
                      >
                        {txn.status}
                      </motion.span>
                    </div>
                  </div>
                ) : (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className={`absolute top-3 right-3 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium border flex-shrink-0 whitespace-nowrap ${getStatusColor(txn.status)}`}
                  >
                    {txn.status}
                  </motion.span>
                )}
                {!isMobile && (
                  <div className="mb-2 pr-16">
                    <div className="mb-1.5">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">{txn.vendor}</p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-tight mt-0.5">{txn.agent}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">{txn.amount}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

            {/* Policies Column */}
            <div className="rounded-lg border border-slate-900 bg-white p-3 sm:p-5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] min-w-0 sm:min-w-[200px]">
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Policies Applied</h3>
        </div>
        <div className={`space-y-2 ${isMobile ? 'min-h-0' : 'min-h-[280px]'}`}>
          <AnimatePresence>
            {(isMobile ? policyChecks.slice(0, 1) : policyChecks).map((policy) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  visiblePolicies.includes(policy.id)
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.9 }
                }
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                      className="rounded-lg border border-slate-900 bg-slate-50 p-2.5 sm:p-4 shadow-[1px_1px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={
                      visiblePolicies.includes(policy.id) ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }
                    }
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className={`flex-shrink-0 flex items-center justify-center ${
                      policy.result === "passed" ? "bg-[#eefa79] border border-slate-900 rounded-full" : ""
                    }`}
                    style={policy.result === "passed" ? { width: '20px', height: '20px' } : {}}
                  >
                    {policy.result === "passed" ? (
                      <Check
                        className="h-3.5 w-3.5 text-slate-900"
                        strokeWidth={2}
                      />
                    ) : (
                      <CheckCircle2
                        className="h-4 w-4 sm:h-5 sm:w-5 text-red-600"
                        strokeWidth={2}
                      />
                    )}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">{policy.policy}</p>
                    <p className="text-[11px] sm:text-xs text-slate-600 capitalize leading-tight mt-0.5">{policy.result}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

            {/* Audit Records Column */}
            <div className="rounded-lg border border-slate-900 bg-white p-3 sm:p-5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] min-w-0 sm:min-w-[200px]">
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Audit Records</h3>
        </div>
        <div className={`space-y-2 ${isMobile ? 'min-h-0' : 'min-h-[280px]'}`}>
          <AnimatePresence>
            {(isMobile ? auditRecords.slice(0, 1) : auditRecords).map((audit) => (
              <motion.div
                key={audit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={
                  visibleAudits.includes(audit.id)
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 10 }
                }
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                      className="rounded-lg border border-slate-900 bg-slate-50 p-2.5 sm:p-4 shadow-[1px_1px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 mt-0.5" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">{audit.action}</p>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-tight mt-0.5">{audit.agent}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
