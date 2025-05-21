import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, CheckCircle } from 'lucide-react';

export default function DownloadPage() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const productId = Number(searchParams.get('product') || '0');
  const [loading, setLoading] = useState(true);
  const [downloadReady, setDownloadReady] = useState(false);
  const [productInfo, setProductInfo] = useState<{ title: string; downloadUrl: string } | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!productId) {
      setLocation('/');
      return;
    }

    // Verify payment and get download link
    apiRequest("GET", `/api/verify-payment?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProductInfo({
            title: data.productTitle,
            downloadUrl: data.downloadUrl
          });
          setDownloadReady(true);
        } else {
          toast({
            title: "Payment Verification Failed",
            description: data.message || "We couldn't verify your payment. Please contact support.",
            variant: "destructive",
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error verifying payment:", err);
        setLoading(false);
      });
  }, [productId, setLocation, toast]);

  const handleDownload = () => {
    if (productInfo?.downloadUrl) {
      // Create an anchor element and trigger download
      const link = document.createElement('a');
      link.href = productInfo.downloadUrl;
      link.setAttribute('download', `${productInfo.title.replace(/\s+/g, '-').toLowerCase()}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Your soundpack is downloading. Thank you for your purchase!",
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-background/50 backdrop-blur-lg p-8 rounded-lg shadow-lg border border-border text-center">
          {downloadReady ? (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Thank You For Your Purchase!</h2>
              <p className="text-muted-foreground mb-6">
                Your payment was successful. Your {productInfo?.title} is ready to download.
              </p>
              <Button 
                onClick={handleDownload}
                className="w-full relative overflow-hidden group/btn bg-gradient-to-b from-primary/90 to-primary/80 border-0 text-black hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-300"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Now
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                Having trouble? Contact our support team for assistance.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
              <p className="text-muted-foreground mb-6">We couldn't verify your payment or prepare your download.</p>
              <Button onClick={() => setLocation('/')}>Return to Home</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}