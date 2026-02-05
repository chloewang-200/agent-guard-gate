import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "#solution", label: "Solution" },
  { href: "#use-cases", label: "Use Cases" },
  { href: "#how-it-works", label: "How It Works" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

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
        <div className="flex h-16 items-center justify-between">
          {/* Brand Name */}
          <a href="#top" className="text-2xl font-bold tracking-tight text-slate-900">
            Ledgr
          </a>

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

        </div>
      </div>
      {/* Bottom border line */}
      <div className="h-px w-full bg-slate-900"></div>
    </motion.header>
  );
}
