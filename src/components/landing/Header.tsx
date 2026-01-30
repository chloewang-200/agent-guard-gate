import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">AgentLayer</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#problem" className="text-body-sm text-muted-foreground transition-colors hover:text-foreground">
            Problem
          </a>
          <a href="#product" className="text-body-sm text-muted-foreground transition-colors hover:text-foreground">
            Product
          </a>
          <a href="#architecture" className="text-body-sm text-muted-foreground transition-colors hover:text-foreground">
            Architecture
          </a>
          <a href="#audience" className="text-body-sm text-muted-foreground transition-colors hover:text-foreground">
            Use Cases
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign In
          </Button>
          <Button variant="hero" size="sm">
            Request Access
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
