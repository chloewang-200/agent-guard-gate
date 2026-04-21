export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Custos" className="h-7 w-7" />
          <div>
            <span className="text-sm font-semibold text-slate-950">Custos</span>
            <p className="text-xs text-slate-500">Trust and control for agentic spend.</p>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <a href="#solution" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
            Solution
          </a>
          <a href="#how-it-works" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
            How It Works
          </a>
          <a href="#use-cases" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
            Use Cases
          </a>
        </nav>

        <p className="text-sm text-slate-500">© 2026 Custos. All rights reserved.</p>
      </div>
    </footer>
  );
}
