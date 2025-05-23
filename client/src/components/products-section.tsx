import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowRight, Star, Send, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contactFormSchema, type ContactFormData, submitContactForm } from "@/lib/contact-api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useIsMobile } from "../hooks/use-mobile";
import { type Product } from "@shared/schema";
import SignatureSoundpack from "../assets/signature-soundpack-cover.png";
import CreatorsMostwanted from "../assets/creators-mostwanted-cover.png";

// Helper function to format price from database
function formatPrice(price: string): string {
  const numPrice = parseFloat(price);
  return `$${numPrice.toFixed(2)}`;
}

// Helper function to get a placeholder image if none exists
function getProductImage(product: Product): string {
  if (product.display_image_url) {
    return product.display_image_url;
  }
  // Use one of the existing images as fallback
  return product.id % 2 === 0 ? CreatorsMostwanted : SignatureSoundpack;
}

export function ProductsSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPackIndex, setCurrentPackIndex] = useState(0);
  const isMobile = useIsMobile();

  // Fetch products from database
  const { data: productsResponse, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
  });

  // Extract products from API response
  const products = productsResponse?.data || [];
  
  // Reset index if it's out of bounds when products load
  const validProductIndex = products.length > 0 ? Math.min(currentPackIndex, products.length - 1) : 0;
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      toast({
        title: "Form submitted successfully!",
        description: "Thanks for your message! We'll be in touch soon.",
        duration: 5000,
      });
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Something went wrong",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      setIsSubmitting(false);
    },
  });

  function onSubmit(data: ContactFormData) {
    setIsSubmitting(true);
    contactMutation.mutate(data);
  }

  // Navigate to the previous product
  const navigatePrev = () => {
    setCurrentPackIndex((prev) => 
      prev === 0 ? products.length - 1 : prev - 1
    );
  };

  // Navigate to the next product
  const navigateNext = () => {
    setCurrentPackIndex((prev) => 
      prev === products.length - 1 ? 0 : prev + 1
    );
  };

  // Get current product or null if loading/no products
  const currentProduct = products.length > 0 ? products[validProductIndex] : null;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
      } 
    }
  };

  return (
    <section id="products" className="py-24 pt-10 min-h-[90vh] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-1 text-muted-foreground/70 font-light tracking-widest uppercase text-sm"
            ></motion.div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4 relative z-10 font-sans">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/60">modeen</span>
              <span className="font-light">.media</span>
            </h1>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute -inset-4 bg-primary/5 rounded-xl blur-2xl z-0"
            />
          </div>

        </div>
        
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Soundpack Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -8, rotateY: 2 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 400 }}
            className="perspective-1000"
          >
            <Card className="bg-gray-950/50 backdrop-blur-xl border-gray-800/30 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4),0_10px_20px_rgba(0,0,0,0.3),inset_0_0_20px_rgba(30,58,138,0.3)] h-full overflow-hidden relative group transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* 3D Effect Elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-700"></div>
              
              <CardContent className={`${isMobile ? 'p-4 sm:p-5' : 'p-10'}`}>
                <div className="flex flex-col items-center relative z-10">
                  {/* Cover at the top center with navigation arrows */}
                  <div className="mb-8 w-full flex items-center justify-center gap-4">
                    {/* Left Arrow Navigation */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800/70 hover:bg-primary/80 cursor-pointer transition-colors shadow-lg transform hover:scale-105 active:scale-95"
                      onClick={navigatePrev}
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </div>
                    
                    {/* Album Cover */}
                    <div className={`${isMobile ? 'w-40 h-40 sm:w-48 sm:h-48' : 'w-64 h-64'} rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5 transform-gpu relative`}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentPackIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full"
                        >
                          {currentProduct ? (
                            <img 
                              src={getProductImage(currentProduct)}
                              alt={currentProduct.name} 
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    
                    {/* Right Arrow Navigation */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800/70 hover:bg-primary/80 cursor-pointer transition-colors shadow-lg transform hover:scale-105 active:scale-95"
                      onClick={navigateNext}
                    >
                      <ChevronRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Content below */}
                  <div className="w-full text-left">
                    <AnimatePresence mode="wait">
                      {currentProduct ? (
                        <motion.div
                          key={currentPackIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-primary text-sm font-light tracking-widest uppercase">{currentProduct.category || "Premium Collection"}</span>
                          <h3 className="text-2xl font-bold text-foreground mt-2 mb-3 tracking-tight">{currentProduct.name}</h3>
                          <div className="flex items-center mb-4">
                            <div className="flex items-center text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-current" />
                              ))}
                            </div>
                            <span className="text-muted-foreground text-sm ml-2 font-light">
                              5.0 (New Product)
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed mb-5 text-sm">
                            {currentProduct.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-foreground text-xl font-bold">{formatPrice(currentProduct.price)}</span>
                            <Button className="relative overflow-hidden group/btn bg-gradient-to-b from-primary/90 to-primary/80 border-0 text-black hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-300" size="sm">
                              <span className="relative z-10">Buy Now</span>
                              <ArrowRight className="relative z-10 ml-1 h-4 w-4" />
                              <div className="absolute inset-0 bg-white/30 opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300"></div>
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPackIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {currentProduct && currentProduct.tags.map((tag: string, index: number) => (
                          <span key={index} className="px-3 py-1 rounded-full bg-primary/10 text-primary/90 text-xs font-light tracking-wide">{tag}</span>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Contact Form Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -8, rotateY: -2 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 400 }}
            className="perspective-1000"
            id="contact"
          >
            <Card className="bg-gray-950/50 backdrop-blur-xl border-gray-800/30 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4),0_10px_20px_rgba(0,0,0,0.3),inset_0_0_20px_rgba(30,58,138,0.3)] h-full overflow-hidden relative group transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* 3D Effect Elements */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-700"></div>
              
              <CardContent className={`${isMobile ? 'p-4 sm:p-5' : 'p-10'} relative z-10`}>
                <span className="text-primary text-sm font-light tracking-widest uppercase">Tailored Audio</span>
                <h3 className="text-2xl font-bold text-foreground mt-2 mb-4 tracking-tight">Custom Soundtrack or Voiceover</h3>
                <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                  Need something unique? Let us craft a custom audio experience specifically for your project. Our team specializes in bespoke soundtracks and professional voiceovers.
                </p>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 font-light">Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your name" 
                              className="bg-gray-900/70 border border-gray-700/50 focus:border-primary rounded-xl shadow-inner backdrop-blur-sm p-6 h-10 placeholder:text-white/20 text-white/90 font-light" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 font-light">Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="your@email.com" 
                              className="bg-gray-900/70 border border-gray-700/50 focus:border-primary rounded-xl shadow-inner backdrop-blur-sm p-6 h-10 placeholder:text-white/20 text-white/90 font-light"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 font-light">Project Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your project..." 
                              className="bg-gray-900/70 border border-gray-700/50 focus:border-primary rounded-xl shadow-inner backdrop-blur-sm p-4 resize-none placeholder:text-white/20 text-white/90 font-light"
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center justify-between pt-2">
                      <Button 
                        type="submit" 
                        className="relative overflow-hidden group/btn bg-gradient-to-b from-primary/90 to-primary/80 border-0 text-black hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-300"
                        disabled={isSubmitting}
                      >
                        <span className="relative z-10">{isSubmitting ? "Sending..." : "Send Request"}</span>
                        <Send className="relative z-10 ml-2 h-4 w-4" />
                        <div className="absolute inset-0 bg-white/30 opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300"></div>
                      </Button>
                      
                      <div className="text-primary/80 text-sm font-light">
                        Response within 24h
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
