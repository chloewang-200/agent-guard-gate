import { CTASection } from "@/components/landing/CTASection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { IntroSection } from "@/components/landing/IntroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ProductSection } from "@/components/landing/ProductSection";

type LandingPageProps = {
  tryNowHref: string;
};

/** Marketing home — matches Vite `src/pages/Index.tsx` layout (colorful Custos landing). */
export function LandingPage({ tryNowHref }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header tryNowHref={tryNowHref} />
      <main>
        <HeroSection />
        <IntroSection />
        <ProductSection />
        <ProblemSection />
        <ContactSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
