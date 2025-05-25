import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

import SignatureSoundpack from "../assets/signature-soundpack-cover.png";
import CreatorsMostwanted from "../assets/creators-mostwanted-cover.png";

const image_mapper = {
  SignatureSoundpack: SignatureSoundpack,
  CreatorsMostwanted: CreatorsMostwanted,
};

import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { clientEnv } from "@/config/environment";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(clientEnv.getStripePublishableKey());

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get product ID from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("product");

    if (!productId) {
      toast({
        title: "Error",
        description: "No product specified",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }

    // Create PaymentIntent as soon as the page loads
    fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: parseInt(productId) }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setProduct(data.product);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
        setLocation("/");
      });
  }, [setLocation, toast]);

  if (loading || !clientSecret || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg text-muted-foreground">
            Setting up your payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4 hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your purchase securely
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto lg:items-start">
          {/* Product Details */}
          <div className="space-y-6 h-full">
            <Card className="border-2 border-muted/50 h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                {product.display_image_url && (
                  <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                    <img
                      src={image_mapper[product.display_image_url]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {product.description}
                  </p>

                  {product.category && (
                    <Badge variant="secondary" className="mb-2">
                      {product.category}
                    </Badge>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mt-auto">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="space-y-6 h-full">
            <div id="checkout" className="h-full">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret: clientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
