import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <Shield className="h-4 w-4 text-background" />
          </div>
          <span className="text-base font-semibold text-foreground tracking-tight">AgentLayer</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#problem" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Problem
          </a>
          <a href="#product" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Product
          </a>
          <a href="#audience" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Use Cases
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign In
          </Button>
          <Button size="sm">
            Request Access
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
