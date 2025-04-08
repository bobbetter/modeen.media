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
    <section id="products" className="py-24 pt-32 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">
          Our Products
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Soundpack Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-card/60 border-white/5 rounded-2xl shadow-2xl h-full overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                  <div className="flex-shrink-0 w-full md:w-48 h-48 rounded-xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1587602945121-097a6385a7be?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                      alt="Signature Soundpack" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <span className="text-primary text-sm font-medium tracking-wider uppercase">Premium Collection</span>
                    <h3 className="text-2xl font-bold text-foreground mt-2 mb-3">Signature Soundpack</h3>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center text-yellow-400">
                        {[1, 2, 3, 4].map((i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                        <Star className="h-4 w-4 fill-current opacity-50" />
                      </div>
                      <span className="text-muted-foreground text-sm ml-2">4.7 (128 reviews)</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      A collection of 200+ handcrafted sounds, designed for professionals. Perfect for filmmakers, game developers, and content creators seeking premium audio elements.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-xl font-bold">$149.99</span>
                      <Button className="bg-primary hover:bg-primary/90 text-white" size="sm">
                        Buy Now
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-secondary/10 text-muted-foreground text-xs">Sound Effects</span>
                    <span className="px-3 py-1 rounded-full bg-secondary/10 text-muted-foreground text-xs">Music Beds</span>
                    <span className="px-3 py-1 rounded-full bg-secondary/10 text-muted-foreground text-xs">Transitions</span>
                    <span className="px-3 py-1 rounded-full bg-secondary/10 text-muted-foreground text-xs">Ambient</span>
                    <span className="px-3 py-1 rounded-full bg-secondary/10 text-muted-foreground text-xs">UI Sounds</span>
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
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            id="contact"
          >
            <Card className="bg-card/60 border-white/5 rounded-2xl shadow-2xl h-full overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardContent className="p-8 relative z-10">
                <span className="text-primary text-sm font-medium tracking-wider uppercase">Tailored Audio</span>
                <h3 className="text-2xl font-bold text-foreground mt-2 mb-4">Custom Soundtrack or Voiceover</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Need something unique? Let us craft a custom audio experience specifically for your project. Our team specializes in bespoke soundtracks and professional voiceovers.
                </p>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your name" 
                              className="bg-background/5 border-b border-white/10 focus:border-primary rounded" 
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="your@email.com" 
                              className="bg-background/5 border-b border-white/10 focus:border-primary rounded"
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
                          <FormLabel>Project Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your project..." 
                              className="bg-background/5 border-b border-white/10 focus:border-primary rounded resize-none"
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center justify-between">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/90 text-white shadow-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send Request"}
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                      
                      <div className="text-muted-foreground text-sm">
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
