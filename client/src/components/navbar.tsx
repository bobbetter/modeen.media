import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
      setMobileOpen(false);
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
      setMobileOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a 
          href="#" 
          className="flex items-center"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="text-xl font-semibold tracking-tighter text-foreground">
            modeen<span className="text-primary">.media</span>
          </span>
        </a>
        
        <nav className="hidden md:flex space-x-8">
          <button 
            onClick={scrollToProducts}
            className="text-foreground hover:text-primary transition duration-300 text-sm font-medium"
          >
            Products
          </button>
          <button 
            onClick={scrollToContact}
            className="text-foreground hover:text-primary transition duration-300 text-sm font-medium"
          >
            Contact
          </button>
        </nav>
        
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background/95 backdrop-blur-md border-l border-white/5">
            <div className="flex flex-col space-y-6 mt-8">
              <button 
                onClick={scrollToProducts}
                className="text-foreground hover:text-primary transition duration-300 text-lg font-medium text-left"
              >
                Products
              </button>
              <button 
                onClick={scrollToContact}
                className="text-foreground hover:text-primary transition duration-300 text-lg font-medium text-left"
              >
                Contact
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
