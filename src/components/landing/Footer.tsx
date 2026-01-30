import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
              <Shield className="h-3.5 w-3.5 text-background" />
            </div>
            <span className="text-sm font-semibold text-foreground">AgentLayer</span>
          </div>

          <nav className="flex items-center gap-6">
            <a href="#problem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Problem
            </a>
            <a href="#product" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Product
            </a>
            <a href="#audience" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Use Cases
            </a>
          </nav>

          <p className="text-sm text-muted-foreground">
            © 2026 AgentLayer
          </p>
        </div>
      </div>
    </footer>
  );
}