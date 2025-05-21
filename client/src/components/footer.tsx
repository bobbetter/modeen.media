import { Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <footer className="relative overflow-hidden border-t border-blue-900/30 py-10 backdrop-blur-sm bg-[#040C1A]/50">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <a href="#" 
              className="inline-block mb-3"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
            >
              <span className="text-xl font-light tracking-tight text-white/90">
                mo<span className="font-bold">deen</span><span className="text-primary font-light">.media</span>
              </span>
            </a>
            <p className="text-white/60 text-sm mb-4 font-light">
              Premium audio solutions for creators
            </p>
            <div className="flex space-x-5 mb-6">
              <a href="#" className="text-white/40 hover:text-primary transition-all duration-500">
                <Facebook className="h-5 w-5 hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="#" className="text-white/40 hover:text-primary transition-all duration-500">
                <Twitter className="h-5 w-5 hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="#" className="text-white/40 hover:text-primary transition-all duration-500">
                <Instagram className="h-5 w-5 hover:scale-110 transition-transform duration-300" />
              </a>
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-primary/50 hover:bg-primary hover:text-background">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-8 md:mt-0 text-right">
            <p className="text-white/50 text-sm font-light">
              &copy; {currentYear} modeen.media. All rights reserved.
            </p>
            <div className="mt-3">
              <a href="#" className="text-white/60 hover:text-primary text-sm transition-colors duration-300 font-light">
                Made with ♥ for creators worldwide
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-primary/20 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute -top-20 right-1/4 w-48 h-48 bg-blue-900/20 rounded-full blur-3xl opacity-20"></div>
    </footer>
  );
}
