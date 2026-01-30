import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ProductSection } from "@/components/landing/ProductSection";
import { ArchitectureSection } from "@/components/landing/ArchitectureSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <ProductSection />
        <ArchitectureSection />
        <AudienceSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
