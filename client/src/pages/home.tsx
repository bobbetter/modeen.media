import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ProductsSection } from "@/components/products-section";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex flex-col">
        <ProductsSection />
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
      </div>
      <Footer />
    </div>
  );
}
