import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Get product ID from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');

    if (productId) {
      // Fetch product details
      fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProduct(data.data);
          }
        })
        .catch(console.error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-2 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-800 dark:text-green-200">
              Payment Successful!
            </CardTitle>
            <p className="text-green-700 dark:text-green-300 mt-2">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {product && (
              <div className="bg-background border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{product.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {product.category && (
                      <Badge variant="secondary">{product.category}</Badge>
                    )}
                    <span className="font-semibold">${parseFloat(product.price).toFixed(2)}</span>
                  </div>
                  
                  {product.fileUrl && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <h4 className="font-semibold text-foreground mb-2">What's next?</h4>
              <ul className="space-y-1">
                <li>• You will receive an email confirmation shortly</li>
                <li>• Download links are available immediately</li>
                <li>• Keep your receipt for your records</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/')}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button
                onClick={() => setLocation('/')}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}