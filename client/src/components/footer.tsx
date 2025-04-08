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
    <footer className="bg-card border-t border-white/5 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <a href="#" 
              className="inline-block mb-4"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
            >
              <span className="text-xl font-semibold tracking-tighter text-foreground">
                modeen<span className="text-primary">.media</span>
              </span>
            </a>
            <p className="text-muted-foreground text-sm mb-4">
              Premium audio solutions for creators who demand excellence.
            </p>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition duration-300">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="mt-8 md:mt-0">
            <p className="text-muted-foreground text-sm">
              &copy; {currentYear} modeen.media. All rights reserved.
            </p>
            <div className="mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary text-sm transition duration-300">
                Made with ♥ for creators worldwide
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
