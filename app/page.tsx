import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import StatsBandSection from "@/components/landing/StatsBandSection";
import LeadsShowcaseSection from "@/components/landing/LeadsShowcaseSection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="font-sans">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsBandSection />
      <LeadsShowcaseSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
