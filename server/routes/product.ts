import { type Express } from "express";
import { storage } from "../storage";
import {
  authMiddleware,
  AuthRequest,
  adminMiddleware,
} from "../middleware/auth";
import { insertProductSchema } from "@shared/schema";
import { deleteFromObjectStorage } from "../utils/replitObjectStorage";

export function registerProductRoutes(app: Express): void {
  // Product management routes (protected admin routes)
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching products",
      });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const product = await storage.getProduct(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching the product",
      });
    }
  });

  app.post(
    "/api/products",
    authMiddleware,
    adminMiddleware,
    async (req: AuthRequest, res) => {
      try {
        console.log("Product data received:", JSON.stringify(req.body));

        // Make sure category and tags are properly formatted
        const productData = {
          ...req.body,
          // Ensure tags is an array
          tags: Array.isArray(req.body.tags)
            ? req.body.tags
            : typeof req.body.tags === "string"
              ? req.body.tags.split(",").map((t: string) => t.trim())
              : [],
        };

        console.log("Processed product data:", JSON.stringify(productData));
        const validation = insertProductSchema.safeParse(productData);

        if (!validation.success) {
          console.log(
            "Validation errors:",
            JSON.stringify(validation.error.format()),
          );
          return res.status(400).json({
            success: false,
            message: "Invalid product data",
            errors: validation.error.format(),
          });
        }

        const product = await storage.createProduct(validation.data);

        return res.status(201).json({
          success: true,
          message: "Product created successfully",
          data: product,
        });
      } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({
          success: false,
          message: "An error occurred while creating the product",
        });
      }
    },
  );

  app.put(
    "/api/products/:id",
    authMiddleware,
    adminMiddleware,
    async (req: AuthRequest, res) => {
      try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid product ID",
          });
        }

        // Get existing product before update (to check if file needs to be deleted)
        const existingProduct = await storage.getProduct(productId);
        if (!existingProduct) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        const validation = insertProductSchema.safeParse(req.body);

        if (!validation.success) {
          return res.status(400).json({
            success: false,
            message: "Invalid product data",
            errors: validation.error.format(),
          });
        }

        // Check if the file URL has changed
        if (
          existingProduct.fileUrl &&
          existingProduct.fileUrl !== validation.data.fileUrl
        ) {
          // Delete old file if it exists and has changed
          try {
            await deleteFromObjectStorage(existingProduct.fileUrl);
          } catch (error) {
            console.error("Error deleting old file:", error);
            // Continue with update even if file deletion fails
          }
        }

        const updatedProduct = await storage.updateProduct(
          productId,
          validation.data,
        );

        if (!updatedProduct) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Product updated successfully",
          data: updatedProduct,
        });
      } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({
          success: false,
          message: "An error occurred while updating the product",
        });
      }
    },
  );

  app.delete(
    "/api/products/:id",
    authMiddleware,
    adminMiddleware,
    async (req: AuthRequest, res) => {
      try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid product ID",
          });
        }

        // Get product before deletion to access file URL
        const product = await storage.getProduct(productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        // Delete the product from the database
        const success = await storage.deleteProduct(productId);

        if (!success) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        // Delete associated file if it exists
        if (product.fileUrl) {
          try {
            await deleteFromObjectStorage(product.fileUrl);
          } catch (error) {
            console.error("Error deleting file:", error);
            // Continue even if file deletion fails
          }
        }

        return res.status(200).json({
          success: true,
          message: "Product deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({
          success: false,
          message: "An error occurred while deleting the product",
        });
      }
    },
  );
}
