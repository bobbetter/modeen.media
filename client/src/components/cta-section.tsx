import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <section className="py-20 bg-gradient-to-r from-card to-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Elevate Your Audio Experience?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Whether you need our premium soundpack or a custom audio solution, we're here to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => scrollToSection('products')}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg"
              size="lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              onClick={() => scrollToSection('contact')}
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/10"
              size="lg"
            >
              Contact Us
            </Button>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute right-0 bottom-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1578176603894-57973e38890f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
          alt="Sound equipment" 
          className="w-80 h-80 object-cover"
        />
      </div>
    </section>
  );
}
