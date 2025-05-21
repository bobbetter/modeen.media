import { ProductsSection } from "@/components/products-section";
import { RecentWorkSection } from "@/components/recent-work-section-new";
import { Footer } from "@/components/footer";
import { AnimatedBackground } from "@/components/background";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen text-foreground relative">
      {/* Interactive animated background */}
      <AnimatedBackground />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Content layers */}
      <div className="flex flex-col relative z-10">
        <ProductsSection />
        <RecentWorkSection />
      </div>
      <Footer />
    </div>
  );
}
