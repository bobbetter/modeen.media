import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ProductsSection } from "@/components/products-section";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex flex-col">
        <HeroSection />
        <div className="-mt-screen pt-24">
          <ProductsSection />
        </div>
        <FeaturesSection />
        <TestimonialsSection />
      </div>
      <CTASection />
      <Footer />
    </div>
  );
}
