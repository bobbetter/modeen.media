import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Product } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface DownloadData {
  download_link: string;
  product: Product;
  created_at: string;
  expire_after_seconds: number;
  download_count: number;
  max_download_count: number;
}

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [downloadData, setDownloadData] = useState<DownloadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get session_id from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      // Fetch download link using self-fulfill endpoint
      fetch('/api/self-fulfill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setDownloadData(data.data);
          } else {
            setError(data.error || 'Failed to retrieve download link');
          }
        })
        .catch(err => {
          console.error('Error fetching download link:', err);
          setError('Failed to retrieve download link');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError('No session ID found in URL');
      setLoading(false);
    }
  }, []);

  const handleDownload = () => {
    if (downloadData?.download_link) {
      window.open(downloadData.download_link, '_blank');
    }
  };

  const calculateExpiryDate = () => {
    if (!downloadData) return null;
    const createdAt = new Date(downloadData.created_at);
    const expiryDate = new Date(createdAt.getTime() + downloadData.expire_after_seconds * 1000);
    return expiryDate;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-2 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-blue-700 dark:text-blue-300">Processing your purchase...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-2 border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl text-red-800 dark:text-red-200">
                Error Processing Purchase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/')}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const expiryDate = calculateExpiryDate();

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
            {downloadData && (
              <div className="bg-background border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{downloadData.product.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{downloadData.product.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {downloadData.product.category && (
                      <Badge variant="secondary">{downloadData.product.category}</Badge>
                    )}
                    <span className="font-semibold">${parseFloat(downloadData.product.price).toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Downloads remaining: {downloadData.max_download_count - downloadData.download_count} of {downloadData.max_download_count}</p>
                  {expiryDate && (
                    <p>Link expires: {expiryDate.toLocaleDateString()} at {expiryDate.toLocaleTimeString()}</p>
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
                <li>• Download links have limited uses and expiration dates</li>
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