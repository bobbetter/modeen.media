import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Sliders, ShieldCheck } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: <Mic className="h-6 w-6 text-primary" />,
      title: "Studio Quality",
      description: "All our audio products are recorded and mastered in professional studios using high-end equipment."
    },
    {
      icon: <Sliders className="h-6 w-6 text-primary" />,
      title: "Custom Tailored",
      description: "Each soundtrack is meticulously crafted to match your project's specific mood and requirements."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Licensed Content",
      description: "Full commercial rights included with all purchases. Use our sounds with complete peace of mind."
    },
  ];

  return (
    <section id="features" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
          Why Choose Us
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">
          With years of experience in audio production, we deliver exceptional sound design that elevates your projects.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="bg-background h-full hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="mr-3">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
