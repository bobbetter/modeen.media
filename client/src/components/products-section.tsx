import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowRight, Star, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contactFormSchema, type ContactFormData, submitContactForm } from "@/lib/contact-api";
import { useMutation } from "@tanstack/react-query";

export function ProductsSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    <section id="products" className="py-24 pt-10 min-h-[90vh] bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-1 text-muted-foreground/70 font-light tracking-widest uppercase text-sm"
            >
              Mo Deen - The Producer
            </motion.div>
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
          <p className="text-muted-foreground mt-4 font-light text-lg max-w-md mx-auto">
            Premium audio solutions crafted for today's creators and producers
          </p>
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
            <Card className="bg-card/40 backdrop-blur-sm border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] h-full overflow-hidden relative group transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* 3D Effect Elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-700"></div>
              
              <CardContent className="p-10">
                <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                  <div className="flex-shrink-0 w-full md:w-48 h-48 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                    <motion.img 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                      src="https://images.unsplash.com/photo-1587602945121-097a6385a7be?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                      alt="Signature Soundpack" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <span className="text-primary text-sm font-light tracking-widest uppercase">Premium Collection</span>
                    <h3 className="text-2xl font-bold text-foreground mt-2 mb-3 tracking-tight">Signature Soundpack</h3>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center text-yellow-400">
                        {[1, 2, 3, 4].map((i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                        <Star className="h-4 w-4 fill-current opacity-50" />
                      </div>
                      <span className="text-muted-foreground text-sm ml-2 font-light">4.7 (128 reviews)</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-5 text-sm">
                      A collection of 200+ handcrafted sounds, designed for professionals. Perfect for filmmakers, game developers, and content creators seeking premium audio elements.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-xl font-bold">$149.99</span>
                      <Button className="relative overflow-hidden group/btn bg-gradient-to-b from-primary/90 to-primary/80 border-0 text-black hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-300" size="sm">
                        <span className="relative z-10">Buy Now</span>
                        <ArrowRight className="relative z-10 ml-1 h-4 w-4" />
                        <div className="absolute inset-0 bg-white/30 opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300"></div>
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary/90 text-xs font-light tracking-wide">Sound Effects</span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary/90 text-xs font-light tracking-wide">Music Beds</span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary/90 text-xs font-light tracking-wide">Transitions</span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary/90 text-xs font-light tracking-wide">Ambient</span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary/90 text-xs font-light tracking-wide">UI Sounds</span>
                  </div>
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
            <Card className="bg-card/40 backdrop-blur-sm border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] h-full overflow-hidden relative group transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* 3D Effect Elements */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-700"></div>
              
              <CardContent className="p-10 relative z-10">
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
                          <FormLabel className="text-muted-foreground/90 font-light">Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your name" 
                              className="bg-background/20 border border-white/10 focus:border-primary rounded-xl shadow-inner backdrop-blur-sm p-6 h-10 placeholder:text-muted-foreground/30 font-light" 
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
                          <FormLabel className="text-muted-foreground/90 font-light">Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="your@email.com" 
                              className="bg-background/20 border border-white/10 focus:border-primary rounded-xl shadow-inner backdrop-blur-sm p-6 h-10 placeholder:text-muted-foreground/30 font-light"
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
                          <FormLabel className="text-muted-foreground/90 font-light">Project Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your project..." 
                              className="bg-background/20 border border-white/10 focus:border-primary rounded-xl shadow-inner backdrop-blur-sm p-4 resize-none placeholder:text-muted-foreground/30 font-light"
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
                      
                      <div className="text-muted-foreground/70 text-sm font-light">
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
