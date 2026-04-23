import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "#solution", label: "Solution" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#use-cases", label: "Use Cases" },
];

type HeaderProps = {
  tryNowHref: string;
};

export function Header({ tryNowHref }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <a href="#top" className="text-2xl font-bold tracking-tight text-slate-900">
          Custos
        </a>

        <div className="flex items-center gap-3 md:gap-8">
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Button asChild size="sm" className="shrink-0 bg-slate-900 text-white hover:bg-slate-800">
            <Link href={tryNowHref}>Try now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
