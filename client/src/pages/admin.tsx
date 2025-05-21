import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product, insertProductSchema } from "@shared/schema";

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
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Plus, Pencil, Trash, Upload, FileText, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Form schema for product
const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Price is required").refine(
    (value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0,
    {
      message: "Price must be a positive number",
    }
  ),
  category: z.string().default(""),
  tags: z.union([z.string(), z.array(z.string())]).transform(value => {
    if (typeof value === 'string') {
      // Convert comma-separated string to array
      return value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }
    return value;
  }).default([]),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function Admin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define response types to help with proper typing
  type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data: T;
  };

  type UserData = {
    id: number;
    username: string;
    isAdmin: boolean;
  };

  // Check if user is authenticated and is admin
  const { 
    data: userApiResponse, 
    isLoading: isUserLoading, 
    isError: isUserError 
  } = useQuery<ApiResponse<UserData>>({
    queryKey: ["/api/auth/me"],
    retry: false
  });
  
  // Extract user data from API response
  const userData = userApiResponse?.data;
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (isUserError) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the admin panel",
      });
      setLocation("/login");
    } else if (userData && !userData.isAdmin) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [userData, isUserError, toast, setLocation]);

  // Fetch products
  const {
    data: productsApiResponse,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useQuery<ApiResponse<Product[]>>({
    queryKey: ["/api/products"],
    enabled: !!userData?.isAdmin,
  });
  
  // Extract products data from API response
  const productsData = productsApiResponse?.data || [];

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Keep price as a string as expected by the server
      const productData = {
        ...data
      };
      
      const response = await fetch("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include" // Include cookies for authentication
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormValues }) => {
      // Keep price as a string as expected by the server
      const productData = {
        ...data
      };
      
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include" // Include cookies for authentication
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include" // Include cookies for authentication
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include" // Include cookies for authentication
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  // Product form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      tags: [],
      fileUrl: "",
    },
  });

  // Open dialog for creating a new product
  const handleAddProduct = () => {
    form.reset({
      name: "",
      description: "",
      price: "",
      category: "",
      tags: [],
      fileUrl: "",
    });
    setCurrentProduct(null);
    setIsDialogOpen(true);
  };

  // Open dialog for editing an existing product
  const handleEditProduct = (product: Product) => {
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category || "",
      tags: product.tags || [],
      fileUrl: product.fileUrl || "",
    });
    setCurrentProduct(product);
    setIsDialogOpen(true);
  };

  // Open dialog for deleting a product
  const handleDeleteProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log("Starting file upload for:", file.name);
      
      const formData = new FormData();
      formData.append("file", file);
      console.log("FormData created with file");
      
      console.log("Sending upload request to /api/upload");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include" // Include cookies for authentication
      });
      
      console.log("Upload response status:", response.status);
      const responseData = await response.json();
      console.log("Upload response data:", responseData);
      
      return responseData;
    },
    onSuccess: (response) => {
      if (response.success) {
        // Set the file URL in the form
        form.setValue("fileUrl", response.data.fileUrl);
        setUploadingFile(false);
        toast({
          title: "File uploaded",
          description: "File has been uploaded successfully",
        });
      } else {
        setUploadingFile(false);
        toast({
          title: "Error",
          description: response.message || "Failed to upload file",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("File upload error:", error);
      setUploadingFile(false);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    },
  });
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Handle file upload
  const handleFileUpload = () => {
    if (selectedFile) {
      setUploadingFile(true);
      uploadFileMutation.mutate(selectedFile);
    }
  };
  
  // Remove the selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Clear file selection when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isDialogOpen]);

  // Submit form handler
  const onSubmit = (data: ProductFormValues) => {
    if (currentProduct) {
      updateProductMutation.mutate({ id: currentProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  // If loading user data, show loading spinner
  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not admin, don't render the page (will be redirected)
  if (userData && !userData.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Welcome, {userData?.username || "Admin"}
            </span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Product Management</h2>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Separator className="my-4" />

        {isProductsError ? (
          <div className="text-center p-8 text-red-500">
            Failed to load products. Please try again.
          </div>
        ) : isProductsLoading ? (
          <div className="text-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2">Loading products...</p>
          </div>
        ) : productsData.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No products yet. Click "Add Product" to create one.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsData.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {product.description}
                    </TableCell>
                    <TableCell>{product.category || "-"}</TableCell>
                    <TableCell>
                      {product.tags && product.tags.length > 0 
                        ? product.tags.map((tag, index) => (
                            <span key={index} className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded mr-1 mb-1">
                              {tag}
                            </span>
                          ))
                        : "-"}
                    </TableCell>
                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                    <TableCell>
                      {product.fileUrl ? (
                        <a 
                          href={product.fileUrl.startsWith('http') ? product.fileUrl : `${window.location.origin}${product.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:underline"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View File
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">No file</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Product description"
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Tags (comma separated)" 
                        value={Array.isArray(field.value) ? field.value.join(', ') : field.value} 
                        onChange={e => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* File Upload Field */}
              <FormField
                control={form.control}
                name="fileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload File</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {/* Hidden actual file input */}
                        <input 
                          type="hidden" 
                          {...field}
                          value={field.value || ""}
                        />
                        
                        {/* File Upload UI */}
                        <div className="border rounded-md p-4">
                          {field.value ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-primary" />
                                <a 
                                  href={field.value.startsWith('http') ? field.value : `${window.location.origin}${field.value}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline truncate max-w-[200px]"
                                >
                                  {field.value.split('/').pop()}
                                </a>
                              </div>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => form.setValue("fileUrl", "")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  type="file"
                                  className="hidden"
                                  ref={fileInputRef}
                                  onChange={handleFileChange}
                                />
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={uploadingFile}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choose File
                                </Button>
                                {selectedFile && (
                                  <>
                                    <span className="text-sm truncate max-w-[150px]">
                                      {selectedFile.name}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleRemoveFile}
                                      className="ml-auto"
                                      disabled={uploadingFile}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                              {selectedFile && (
                                <Button
                                  type="button"
                                  className="w-full"
                                  onClick={handleFileUpload}
                                  disabled={uploadingFile}
                                >
                                  {uploadingFile ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createProductMutation.isPending || updateProductMutation.isPending
                  }
                >
                  {createProductMutation.isPending || updateProductMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : currentProduct ? (
                    "Update Product"
                  ) : (
                    "Create Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{currentProduct?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (currentProduct) {
                  deleteProductMutation.mutate(currentProduct.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}