import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SoundWave } from "./ui/sound-wave";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      window.scrollTo({
        top: featuresSection.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="relative py-24 flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4 z-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Professional Audio for Creative Minds
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
            Explore our premium sound collection and elevate your next project with studio-quality audio
          </p>
          <Button 
            onClick={scrollToFeatures}
            className="mt-4"
            variant="outline"
          >
            Learn More
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