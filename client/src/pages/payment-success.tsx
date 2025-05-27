import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Download,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

import SignatureSoundpack from "../assets/signature-soundpack-cover.png";
import CreatorsMostwanted from "../assets/creators-mostwanted-cover.png";

const image_mapper = {
  SignatureSoundpack: SignatureSoundpack,
  CreatorsMostwanted: CreatorsMostwanted,
};

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
    const sessionId = urlParams.get("session_id");

    if (sessionId) {
      // Fetch download link using self-fulfill endpoint
      fetch("/api/self-fulfill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDownloadData(data.data);
          } else {
            setError(data.error || "Failed to retrieve download link");
          }
        })
        .catch((err) => {
          console.error("Error fetching download link:", err);
          setError("Failed to retrieve download link");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError("No session ID found in URL");
      setLoading(false);
    }
  }, []);

  const handleDownload = () => {
    if (downloadData?.download_link) {
      window.open(downloadData.download_link, "_blank");
    }
  };

  const calculateExpiryDate = () => {
    if (!downloadData) return null;
    const createdAt = new Date(downloadData.created_at);
    const expiryDate = new Date(
      createdAt.getTime() + downloadData.expire_after_seconds * 1000,
    );
    return expiryDate;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg text-muted-foreground">
            Processing your purchase...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Payment Error
            </h1>
            <p className="text-muted-foreground">
              There was an issue processing your payment
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-muted/50">
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
                    onClick={() => setLocation("/")}
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
      </div>
    );
  }

  const expiryDate = calculateExpiryDate();

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
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your payment has been processed
            successfully.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto lg:items-start">
          {/* Product Details & Download */}
          <div className="space-y-6 h-full">
            {downloadData && (
              <Card className="border-2 border-muted/50 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">Your Purchase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  {downloadData.product.display_image_url && (
                    <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                      <img
                        src={
                          image_mapper[
                            downloadData.product
                              .display_image_url as keyof typeof image_mapper
                          ]
                        }
                        alt={downloadData.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {downloadData.product.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {downloadData.product.description}
                    </p>

                    {downloadData.product.category && (
                      <Badge variant="secondary" className="mb-2">
                        {downloadData.product.category}
                      </Badge>
                    )}

                    {downloadData.product.tags &&
                      downloadData.product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {downloadData.product.tags.map((tag, index) => (
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

                    <div className="text-xs text-muted-foreground space-y-1 mb-4">
                      <p>
                        Downloads remaining:{" "}
                        {downloadData.max_download_count -
                          downloadData.download_count}{" "}
                        of {downloadData.max_download_count}
                      </p>
                      {expiryDate && (
                        <p>
                          Link expires: {expiryDate.toLocaleDateString()} at{" "}
                          {expiryDate.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-auto">
                    <div className="flex justify-between items-center text-lg mb-4">
                      <span className="font-semibold">Total Paid:</span>
                      <span className="text-2xl font-bold text-primary">
                        ${parseFloat(downloadData.product.price).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Success Message & Actions */}
          <div className="space-y-6 h-full">
            <Card className="border-2 border-muted/50 h-full flex flex-col">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Order Complete</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 flex-1 flex flex-col">
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground flex-1">
                  <h4 className="font-semibold text-foreground mb-2 text-xl">
                    What's next?
                  </h4>
                  <ul className="space-y-1 text-xl">
                    <li>• You will receive an email confirmation shortly</li>
                    <li>• Download links are available immediately</li>
                    <li>• Keep your receipt for your records</li>
                    <li>
                      • Download links have limited uses and expiration dates
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4 mt-auto">
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/")}
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
      </div>
    </div>
  );
}
