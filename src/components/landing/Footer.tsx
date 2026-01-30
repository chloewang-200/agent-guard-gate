import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-slate-50 py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-body font-semibold text-foreground">AgentLayer</span>
          </div>

          <nav className="flex flex-wrap items-center gap-6">
            <a href="#problem" className="text-body-sm text-muted-foreground hover:text-foreground transition-colors">
              Problem
            </a>
            <a href="#product" className="text-body-sm text-muted-foreground hover:text-foreground transition-colors">
              Product
            </a>
            <a href="#architecture" className="text-body-sm text-muted-foreground hover:text-foreground transition-colors">
              Architecture
            </a>
            <a href="#audience" className="text-body-sm text-muted-foreground hover:text-foreground transition-colors">
              Use Cases
            </a>
          </nav>

          <p className="text-body-sm text-muted-foreground">
            © 2026 AgentLayer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
