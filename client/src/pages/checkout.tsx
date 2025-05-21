import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ productId, productTitle, productPrice }: { productId: number; productTitle: string; productPrice: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/download?product=${productId}`,
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <h3 className="text-xl font-medium">{productTitle}</h3>
        <p className="text-muted-foreground">${(productPrice / 100).toFixed(2)}</p>
      </div>
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full relative overflow-hidden group/btn bg-gradient-to-b from-primary/90 to-primary/80 border-0 text-black hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-300"
      >
        {isProcessing ? "Processing..." : "Complete Purchase"}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const productId = Number(searchParams.get('product') || '0');
  const [clientSecret, setClientSecret] = useState("");
  const [productInfo, setProductInfo] = useState<{ title: string; price: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!productId) {
      setLocation('/');
      return;
    }

    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { productId })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setProductInfo({
          title: data.productTitle,
          price: data.amount
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error creating payment intent:", err);
        setLoading(false);
      });
  }, [productId, setLocation]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!clientSecret || !productInfo) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">We couldn't initialize the payment process.</p>
        <Button onClick={() => setLocation('/')}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-background/50 backdrop-blur-lg p-8 rounded-lg shadow-lg border border-border">
          <h2 className="text-2xl font-bold mb-8 text-center">Complete Your Purchase</h2>
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'flat' } }}>
            <CheckoutForm productId={productId} productTitle={productInfo.title} productPrice={productInfo.price} />
          </Elements>
        </div>
        <Button 
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mt-6"
        >
          Cancel and return to home
        </Button>
      </div>
    </div>
  );
}