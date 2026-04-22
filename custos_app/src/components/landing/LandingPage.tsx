import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { Sections } from "@/components/landing/Sections";

type LandingPageProps = {
  tryNowHref: string;
};

export function LandingPage({ tryNowHref }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Header tryNowHref={tryNowHref} />
      <HeroSection tryNowHref={tryNowHref} />
      <Sections />
    </main>
  );
}
