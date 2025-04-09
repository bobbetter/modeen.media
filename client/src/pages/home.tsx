import { ProductsSection } from "@/components/products-section";
import { RecentWorkSection } from "@/components/recent-work-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col">
        <ProductsSection />
        <RecentWorkSection />
      </div>
      <Footer />
    </div>
  );
}
