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
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-4">
            Premium Sound <span className="text-primary">Design</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Crafting exceptional audio experiences for projects that demand perfection
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="my-12"
        >
          <SoundWave />
        </motion.div>
        
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Button 
            onClick={scrollToProducts}
            className="bg-primary text-white px-8 py-6 rounded-full text-sm font-medium tracking-wide hover:bg-primary/90 transition duration-300 shadow-lg"
          >
            Explore Products
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
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
