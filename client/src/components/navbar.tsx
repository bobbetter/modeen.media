import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User, Shield } from "lucide-react";
import { Link } from "wouter";

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-primary/20 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a 
          href="/" 
          className="flex items-center"
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <span className="text-xl font-semibold tracking-tighter text-foreground">
            modeen<span className="text-primary">.media</span>
          </span>
        </a>
        
        <div className="flex items-center">
          <nav className="hidden md:flex space-x-6 mr-6">
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
          
          <div className="hidden md:flex space-x-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-foreground hover:text-background hover:bg-primary">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="border-primary/50 hover:bg-primary hover:text-background">
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
        
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background/95 backdrop-blur-md border-l border-primary/20">
            <div className="flex flex-col space-y-6 mt-10">
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
              
              <div className="h-px w-full bg-primary/20 my-2"></div>
              
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center text-foreground hover:text-primary transition duration-300 text-lg font-medium">
                <User className="h-5 w-5 mr-2" />
                Login
              </Link>
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center text-foreground hover:text-primary transition duration-300 text-lg font-medium">
                <Shield className="h-5 w-5 mr-2" />
                Admin
              </Link>
              
              <div className="flex flex-col space-y-3 mt-4">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full" variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/admin" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
