import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCustosPlatformLoginUrl } from "@/config/custosAppUrl";

const navItems = [
  { href: "#solution", label: "Solution" },
  { href: "#use-cases", label: "Use Cases" },
  { href: "#how-it-works", label: "How It Works" },
];

export function Header() {
  const platformLoginUrl = getCustosPlatformLoginUrl();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-x-0 top-0 z-50 rounded-b-2xl shadow-md"
      style={{ backgroundColor: "#fef9e7" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <a href="#top" className="text-2xl font-bold tracking-tight text-slate-900">
            Custos
          </a>

          <div className="flex flex-1 items-center justify-end gap-4 md:gap-8">
            <nav className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1 text-base font-medium text-slate-900 transition-colors hover:text-slate-700"
                >
                  {item.label}
                  <ChevronDown className="h-4 w-4" />
                </a>
              ))}
            </nav>

            {platformLoginUrl ? (
              <Button
                asChild
                size="sm"
                className="shrink-0 border border-slate-900 bg-slate-900 px-4 font-semibold text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-slate-800"
              >
                <a href={platformLoginUrl}>Try now</a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="h-px w-full bg-slate-900" />
    </motion.header>
  );
}
