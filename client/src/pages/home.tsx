import { ProductsSection } from "@/components/products-section";
import { RecentWorkSection } from "@/components/recent-work-section-new";
import { Footer } from "@/components/footer";
import { AnimatedBackground } from "@/components/background";

export default function Home() {
  return (
    <div className="min-h-screen text-foreground relative">
      {/* Interactive animated background */}
      <AnimatedBackground />
      
      {/* Content layers */}
      <div className="flex flex-col relative z-10">
        <ProductsSection />
        <RecentWorkSection />
      </div>
      <Footer />
    </div>
  );
}
