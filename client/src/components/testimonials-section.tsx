import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Game Developer, Lunar Studios",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
      quote: "The custom soundtrack modeen.media created for our indie game perfectly captured the emotional depth we were aiming for. It transformed the entire player experience."
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Film Director",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
      quote: "Working with modeen.media elevated our short film to a whole new level. The attention to detail and quality of sound design was exactly what we needed."
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Podcast Producer",
      image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80", 
      quote: "The voiceover work provided by modeen.media has become a signature element of our podcast. Our listeners constantly comment on the audio quality."
    }
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">
            What Our Clients Say
          </h2>
          
          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonials[currentIndex].id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center px-8"
              >
                <Card className="bg-card/30 border-white/5 shadow-lg">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="flex justify-center mb-6">
                      <img 
                        src={testimonials[currentIndex].image} 
                        alt={testimonials[currentIndex].name} 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                    <p className="text-foreground text-xl leading-relaxed italic mb-6">
                      "{testimonials[currentIndex].quote}"
                    </p>
                    <div>
                      <p className="text-primary font-semibold">{testimonials[currentIndex].name}</p>
                      <p className="text-muted-foreground text-sm">{testimonials[currentIndex].role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-3 h-3 rounded-full mr-2 transition-colors duration-300 ${
                  i === currentIndex ? "bg-primary" : "bg-muted"
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 opacity-5">
        <Quote className="text-primary h-64 w-64" />
      </div>
    </section>
  );
}
