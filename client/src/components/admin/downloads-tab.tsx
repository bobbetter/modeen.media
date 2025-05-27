import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Product,
  DownloadLink,
  insertDownloadLinkSchema,
} from "@shared/schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Loader2,
  Plus,
  Trash,
  Link,
  Copy,
  Eye,
} from "lucide-react";

// Form schema for download links
const downloadLinkFormSchema = insertDownloadLinkSchema.extend({
  product_id: z.number(),
  download_link: z.string().optional(), // Will be generated on the server
  max_download_count: z
    .number()
    .int()
    .min(0, "Max download count must be a non-negative integer"),
  expire_after_seconds: z
    .number()
    .int()
    .min(0, "Expiration time must be a non-negative integer"),
});

type DownloadLinkFormValues = z.infer<typeof downloadLinkFormSchema>;

// Define response types to help with proper typing
type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

// Define paginated response type
type PaginatedApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function DownloadsTab() {
  const [isDownloadLinkDialogOpen, setIsDownloadLinkDialogOpen] = useState(false);
  const [isDeleteDownloadLinkDialogOpen, setIsDeleteDownloadLinkDialogOpen] = useState(false);
  const [isViewLinkDialogOpen, setIsViewLinkDialogOpen] = useState(false);
  const [isViewSessionIdDialogOpen, setIsViewSessionIdDialogOpen] = useState(false);
  const [currentDownloadLink, setCurrentDownloadLink] = useState<DownloadLink | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const { toast } = useToast();

  // Fetch products
  const {
    data: productsApiResponse,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useQuery<ApiResponse<Product[]>>({
    queryKey: ["/api/products"],
  });

  // Extract products data from API response
  const productsData = productsApiResponse?.data || [];

  // Fetch download links with pagination
  const {
    data: downloadLinksApiResponse,
    isLoading: isDownloadLinksLoading,
    isError: isDownloadLinksError,
  } = useQuery<PaginatedApiResponse<DownloadLink>>({
    queryKey: ["/api/download-links", currentPage, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/download-links?page=${currentPage}&limit=${pageSize}`, {
        credentials: "include",
      });
      return response.json();
    },
  });

  // Extract download links data from API response
  const downloadLinksData = downloadLinksApiResponse?.data || [];
  const pagination = downloadLinksApiResponse?.pagination;

  // Create download link mutation
  const createDownloadLinkMutation = useMutation({
    mutationFn: async (data: DownloadLinkFormValues) => {
      const response = await fetch("/api/download-links", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/download-links"] });
      toast({
        title: "Success",
        description: "Download link created successfully",
      });
      setIsDownloadLinkDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error creating download link:", error);
      toast({
        title: "Error",
        description: "Failed to create download link",
        variant: "destructive",
      });
    },
  });

  // Delete download link mutation
  const deleteDownloadLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/download-links/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/download-links"] });
      toast({
        title: "Success",
        description: "Download link deleted successfully",
      });
      setIsDeleteDownloadLinkDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error deleting download link:", error);
      toast({
        title: "Error",
        description: "Failed to delete download link",
        variant: "destructive",
      });
    },
  });

  // Download link form
  const downloadLinkForm = useForm<DownloadLinkFormValues>({
    resolver: zodResolver(downloadLinkFormSchema),
    defaultValues: {
      product_id: 0,
      download_link: "",
      max_download_count: 0,
      expire_after_seconds: 0,
      created_by: {},
    },
  });

  // Open dialog for creating a new download link
  const handleAddDownloadLink = (productId: number) => {
    downloadLinkForm.reset({
      product_id: productId,
      download_link: "",
      max_download_count: 0,
      expire_after_seconds: 0,
      created_by: {},
    });
    setSelectedProductId(productId);
    setCurrentDownloadLink(null);
    setIsDownloadLinkDialogOpen(true);
  };

  // Open dialog for deleting a download link
  const handleDeleteDownloadLink = (downloadLink: DownloadLink) => {
    setCurrentDownloadLink(downloadLink);
    setIsDeleteDownloadLinkDialogOpen(true);
  };

  // Copy download link to clipboard
  const handleCopyLink = async (downloadLink: string) => {
    try {
      await navigator.clipboard.writeText(downloadLink);
      toast({
        title: "Success",
        description: "Download link copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  // Open dialog to view full download link
  const handleViewLink = (downloadLink: DownloadLink) => {
    setCurrentDownloadLink(downloadLink);
    setIsViewLinkDialogOpen(true);
  };

  // Open dialog to view full session ID
  const handleViewSessionId = (downloadLink: DownloadLink) => {
    setCurrentDownloadLink(downloadLink);
    setIsViewSessionIdDialogOpen(true);
  };

  // Submit download link form handler
  const onSubmitDownloadLink = (data: DownloadLinkFormValues) => {
    const downloadLinkData = {
      ...data,
      download_link: "placeholder", // Server will replace this with the actual JWT token-based link
    };

    console.log("Submitting download link data:", downloadLinkData);
    createDownloadLinkMutation.mutate(downloadLinkData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Download Links</h2>
      </div>

      {/* Products List for Creating Download Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Create Download Link for Product</h3>
        {isProductsError ? (
          <div className="text-center p-4 text-red-500">
            Failed to load products. Please try again.
          </div>
        ) : isProductsLoading ? (
          <div className="text-center p-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="mt-2">Loading products...</p>
          </div>
        ) : productsData.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No products available. Create a product first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsData.map((product: Product) => (
              <div key={product.id} className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {product.description}
                </p>
                <p className="text-sm font-medium">${Number(product.price).toFixed(2)}</p>
                <Button
                  size="sm"
                  onClick={() => handleAddDownloadLink(product.id)}
                  className="w-full"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Create Download Link
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Download Links Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Existing Download Links</h3>
        {isDownloadLinksError ? (
          <div className="text-center p-4 text-red-500">
            Failed to load download links. Please try again.
          </div>
        ) : isDownloadLinksLoading ? (
          <div className="text-center p-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="mt-2">Loading download links...</p>
          </div>
        ) : downloadLinksData.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No download links yet. Create one using the products above.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Download Link</TableHead>
                  <TableHead className="w-24">Download Count</TableHead>
                  <TableHead className="w-28">Max Downloads</TableHead>
                  <TableHead>Expires After</TableHead>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {downloadLinksData.map((downloadLink) => {
                  // Find the associated product
                  const product = productsData.find(
                    (p) => p.id === downloadLink.product_id,
                  );
                  return (
                    <TableRow key={downloadLink.id}>
                      <TableCell className="font-medium">
                        {downloadLink.id}
                      </TableCell>
                      <TableCell>{downloadLink.product_id}</TableCell>
                      <TableCell>
                        {product ? product.name : "Unknown"}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="truncate flex-1 min-w-0">
                            {downloadLink.download_link}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 flex-shrink-0"
                                  onClick={() => handleCopyLink(downloadLink.download_link)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy to clipboard</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 flex-shrink-0"
                                  onClick={() => handleViewLink(downloadLink)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View full link</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell className="w-24">{downloadLink.download_count}</TableCell>
                      <TableCell className="w-28">
                        {downloadLink.max_download_count > 0
                          ? downloadLink.max_download_count
                          : "Unlimited"}
                      </TableCell>
                      <TableCell>
                        {downloadLink.expire_after_seconds > 0
                          ? `${Math.floor(downloadLink.expire_after_seconds / 86400)} days`
                          : "No expiration"}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="truncate flex-1 min-w-0 text-sm font-mono">
                            {downloadLink.session_id || (
                              <span className="text-muted-foreground">No session</span>
                            )}
                          </span>
                          {downloadLink.session_id && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 flex-shrink-0"
                                    onClick={() => handleViewSessionId(downloadLink)}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View full session ID</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm">
                          {downloadLink.created_by && typeof downloadLink.created_by === 'object' ? (
                            <pre className="text-xs bg-muted p-1 rounded overflow-auto max-h-16">
                              {JSON.stringify(downloadLink.created_by, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-muted-foreground">No data</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          downloadLink.created_at,
                        ).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() =>
                              handleDeleteDownloadLink(downloadLink)
                            }
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} entries
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNumber;
                    if (pagination.totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNumber = pagination.totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      className={currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        )}
      </div>

      {/* Download Link Dialog */}
      <Dialog
        open={isDownloadLinkDialogOpen}
        onOpenChange={setIsDownloadLinkDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Download Link</DialogTitle>
          </DialogHeader>
          <Form {...downloadLinkForm}>
            <form
              onSubmit={downloadLinkForm.handleSubmit(onSubmitDownloadLink)}
              className="space-y-4"
            >
              <FormField
                control={downloadLinkForm.control}
                name="max_download_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Download Count (0 for unlimited)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter max download count"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={downloadLinkForm.control}
                name="expire_after_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Expiration Time in Seconds (0 for no expiration)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter expiration time in seconds"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6">
                <Button
                  type="submit"
                  disabled={createDownloadLinkMutation.isPending}
                >
                  {createDownloadLinkMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Download Link
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Download Link Dialog */}
      <AlertDialog
        open={isDeleteDownloadLinkDialogOpen}
        onOpenChange={setIsDeleteDownloadLinkDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the download link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                currentDownloadLink &&
                deleteDownloadLinkMutation.mutate(currentDownloadLink.id)
              }
              disabled={deleteDownloadLinkMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDownloadLinkMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Full Download Link Dialog */}
      <Dialog
        open={isViewLinkDialogOpen}
        onOpenChange={setIsViewLinkDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Full Download Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Download Link:</p>
              <p className="text-sm break-all font-mono bg-background p-2 rounded border">
                {currentDownloadLink?.download_link}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => currentDownloadLink && handleCopyLink(currentDownloadLink.download_link)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Full Session ID Dialog */}
      <Dialog
        open={isViewSessionIdDialogOpen}
        onOpenChange={setIsViewSessionIdDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Full Session ID</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Session ID:</p>
              <p className="text-sm break-all font-mono bg-background p-2 rounded border">
                {currentDownloadLink?.session_id}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => currentDownloadLink?.session_id && navigator.clipboard.writeText(currentDownloadLink.session_id)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 