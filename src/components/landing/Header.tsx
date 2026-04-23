import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getCustosAppUrl } from "@/config/custosAppUrl";

const navItems = [
  { href: "#solution", label: "Solution" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#use-cases", label: "Use Cases" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const custosAppUrl = getCustosAppUrl();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-x-0 top-0 z-50 rounded-b-2xl shadow-md"
      style={{ backgroundColor: '#fef9e7' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Name */}
          <a href="#top" className="text-2xl font-bold tracking-tight text-slate-900">
            Custos
          </a>

          <div className="flex flex-1 items-center justify-end gap-4 md:gap-8">
            {/* Navigation */}
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

            {custosAppUrl ? (
              <Button
                asChild
                size="sm"
                className="shrink-0 bg-slate-900 text-white hover:bg-slate-800"
              >
                <a href={custosAppUrl} target="_blank" rel="noopener noreferrer">
                  Try now
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      {/* Bottom border line */}
      <div className="h-px w-full bg-slate-900"></div>
    </motion.header>
  );
}
