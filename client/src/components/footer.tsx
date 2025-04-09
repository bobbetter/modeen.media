import { Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <footer className="relative overflow-hidden border-t border-gray-200/30 py-10 backdrop-blur-sm">
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
              <span className="text-xl font-light tracking-tight text-foreground">
                mo<span className="font-bold">deen</span><span className="text-primary font-light">.media</span>
              </span>
            </a>
            <p className="text-muted-foreground/80 text-sm mb-4 font-light">
              Premium audio solutions for creators
            </p>
            <div className="flex space-x-5 mb-6">
              <a href="#" className="text-muted-foreground/60 hover:text-primary transition-all duration-500">
                <Facebook className="h-5 w-5 hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="#" className="text-muted-foreground/60 hover:text-primary transition-all duration-500">
                <Twitter className="h-5 w-5 hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="#" className="text-muted-foreground/60 hover:text-primary transition-all duration-500">
                <Instagram className="h-5 w-5 hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </div>
          
          <div className="mt-8 md:mt-0 text-right">
            <p className="text-muted-foreground/60 text-sm font-light">
              &copy; {currentYear} modeen.media. All rights reserved.
            </p>
            <div className="mt-3">
              <a href="#" className="text-muted-foreground/80 hover:text-primary text-sm transition-colors duration-300 font-light">
                Made with ♥ for creators worldwide
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-t from-gray-100/50 to-transparent opacity-50"></div>
    </footer>
  );
}
