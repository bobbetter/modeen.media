import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SoundWave } from "./ui/sound-wave";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      window.scrollTo({
        top: productsSection.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4 z-10">
      </div>

      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background to-background"></div>
        <div className="absolute inset-0 bg-black opacity-80"></div>
        <img 
          src="https://images.unsplash.com/photo-1615412704911-55ca9cfcce3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
          alt="Studio equipment" 
          className="object-cover w-full h-full opacity-20"
        />
      </div>
    </section>
  );
}