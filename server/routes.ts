import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertContactSchema,
  insertUserSchema,
  insertProductSchema,
  insertDownloadLinkSchema,
} from "@shared/schema";
import { z } from "zod";
import {
  authMiddleware,
  adminMiddleware,
  AuthRequest,
} from "./middleware/auth";
import { upload } from "./middleware/upload";
import {
  uploadToObjectStorage,
  deleteFromObjectStorage,
  getFileFromObjectStorage,
} from "./utils/replitObjectStorage";
import path from "path";
import fs from "fs";
import { promisify } from "util";

import {
  create_jwt_token,
  make_download_url,
  decode_jwt_token,
  ProductTokenPayload,
} from "./utils/jwt";
export async function registerRoutes(app: Express): Promise<Server> {
  // Serve files from the public directory
  app.use(express.static(path.join(process.cwd(), "public")));
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
      }

      // Save user ID in session
      req.session.userId = user.id;

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
        },
      });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during login",
      });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error logging out",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    });
  });

  app.get("/api/auth/me", authMiddleware, (req: AuthRequest, res) => {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  });

  // Contact form routes
  app.post("/api/contact", async (req, res) => {
    try {
      const validation = insertContactSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid form data",
          errors: validation.error.format(),
        });
      }

      const contact = await storage.createContact(validation.data);

      return res.status(201).json({
        success: true,
        message: "Contact form submitted successfully",
        data: contact,
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while submitting the form",
      });
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      return res.status(200).json({
        success: true,
        data: contacts,
      });
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching contacts",
      });
    }
  });

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

  // File upload endpoint
  app.post(
    "/api/upload",
    authMiddleware,
    adminMiddleware,
    upload.single("file"),
    async (req: AuthRequest & { file?: Express.Multer.File }, res) => {
      try {
        console.log("File upload request received");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);

        if (!req.file) {
          console.log("No file found in request");
          return res.status(400).json({
            success: false,
            message: "No file uploaded",
          });
        }

        // Get the original filename and file path
        const originalName = req.file.originalname;
        const fileName = path.basename(req.file.path);
        console.log("File details:", {
          originalName,
          fileName,
          path: req.file.path,
        });

        // Upload file to Replit Object Storage
        console.log("Uploading file to Replit Object Storage...");
        const fileUrl = await uploadToObjectStorage(req.file.path, fileName);
        console.log("File uploaded to Object Storage at:", fileUrl);

        // Delete temporary file after storage
        await promisify(fs.unlink)(req.file.path);
        console.log("Temporary file deleted");

        return res.status(200).json({
          success: true,
          data: {
            fileUrl,
            originalName,
          },
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        return res.status(500).json({
          success: false,
          message: "An error occurred during file upload",
        });
      }
    },
  );

  // Protected admin routes for product management
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

  // Download Links Routes
  // Get all download links
  app.get(
    "/api/download-links",
    authMiddleware,
    adminMiddleware,
    async (req: AuthRequest, res) => {
      try {
        const downloadLinks = await storage.getDownloadLinks();
        return res.status(200).json({
          success: true,
          data: downloadLinks,
        });
      } catch (error) {
        console.error("Error fetching download links:", error);
        return res.status(500).json({
          success: false,
          message: "An error occurred while fetching download links",
        });
      }
    },
  );

  // Get download links for a specific product
  app.get(
    "/api/download-links/product/:productId",
    authMiddleware,
    adminMiddleware,
    async (req: AuthRequest, res) => {
      try {
        const productId = parseInt(req.params.productId);

        if (isNaN(productId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid product ID",
          });
        }

        const downloadLinks =
          await storage.getDownloadLinksByProductId(productId);
        return res.status(200).json({
          success: true,
          data: downloadLinks,
        });
      } catch (error) {
        console.error("Error fetching download links:", error);
        return res.status(500).json({
          success: false,
          message: "An error occurred while fetching download links",
        });
      }
    },
  );

  // Create a new download link
  app.post(
    "/api/download-links",
    authMiddleware,
    adminMiddleware,
    async (req: AuthRequest, res) => {
      try {
        // Add the current user to the created_by field
        console.log("----Request body:", req.body);

        // const jwt_token = create_jwt_token(req.body.product_id.toString());
        // req.body.download_link = make_download_url(jwt_token);
        const linkData = {
          ...req.body,
          download_link: "empty",
          created_by: {
            id: req.user?.id,
            username: req.user?.username,
          },
        };
        console.log("----Link data:", linkData);
        const validation = insertDownloadLinkSchema.safeParse(linkData);
        console.log("----Validation:", validation);
        if (!validation.success) {
          return res.status(400).json({
            success: false,
            message: "Invalid download link data",
            errors: validation.error.format(),
          });
        }

        // Verify that the product exists
        const product = await storage.getProduct(validation.data.product_id);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        const downloadLink = await storage.createDownloadLink(validation.data);
        const jwt_token = create_jwt_token(
          req.body.product_id,
          downloadLink.id,
        );
        const download_link = make_download_url(jwt_token);

        // Update the download link with the actual URL
        const updatedDownloadLink = await storage.updateDownloadLink(
          downloadLink.id,
          download_link,
        );

        return res.status(201).json({
          success: true,
          message: "Download link created successfully",
          data: updatedDownloadLink,
        });
      } catch (error) {
        console.error("Error creating download link:", error);
        return res.status(500).json({
          success: false,
          message: "An error occurred while creating the download link",
        });
      }
    },
  );

  app.get("/api/download", async (req, res) => {
    const token = req.query.token as string;

    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }

    let payload: ProductTokenPayload;
    try {
      payload = decode_jwt_token(token);
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const product_id = payload.product_id;
    if (isNaN(product_id)) {
      return res.status(400).json({ error: "Invalid product ID in token" });
    }

    try {
      // Get the product information
      const product = await storage.getProduct(product_id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (!product.fileUrl) {
        return res
          .status(404)
          .json({ error: "No file associated with this product" });
      }

      // Find the download link that uses this token
      // This is needed to check expiry and increment download count
      const downloadLink = await storage.getDownloadLink(
        payload.download_link_id,
      );

      if (downloadLink) {
        // Check if max downloads reached
        if (
          downloadLink.max_download_count > 0 &&
          downloadLink.download_count >= downloadLink.max_download_count
        ) {
          return res.status(410).json({
            error:
              "This download link has reached its maximum number of downloads",
          });
        }
        console.log("Increasing download count for link: ", downloadLink.id);
        // Increment the download count
        await storage.incrementDownloadCount(downloadLink.id);
      } else {
        return res
          .status(404)
          .json({ error: "Download link has been removed" });
      }

      // Get the file from object storage
      const { buffer, filename, contentType } = await getFileFromObjectStorage(
        product.fileUrl,
      );

      // Set appropriate headers for file download
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", buffer.length);

      // Send the file as a buffer
      res.send(buffer);
    } catch (error) {
      console.error("Error serving download:", error);
      return res.status(500).json({ error: "Failed to download file" });
    }
  });
  // Serve images from Object Storage
  app.get("/api/images/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const key = `products/${filename}`;
      
      console.log(`Serving image with key: ${key}`);
      
      // Get the file from object storage
      const { buffer, contentType } = await getFileFromObjectStorage(key);
      
      console.log(`Image found - Content-Type: ${contentType}, Buffer length: ${buffer.length}`);
      
      // Set appropriate headers for image display
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
      res.setHeader("Content-Length", buffer.length);
      
      // Send the image buffer
      res.end(buffer);
    } catch (error) {
      console.error("Error serving image:", error);
      return res.status(404).json({ error: "Image not found" });
    }
  });

  // Get a specific download link
  app.get("/api/download-links/:id", async (req, res) => {
    try {
      const linkId = parseInt(req.params.id);

      if (isNaN(linkId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid download link ID",
        });
      }

      const downloadLink = await storage.getDownloadLink(linkId);

      if (!downloadLink) {
        return res.status(404).json({
          success: false,
          message: "Download link not found",
        });
      }

      // Check if the link has expired
      const now = new Date();
      const created = new Date(downloadLink.created_at);
      const expirationTime =
        created.getTime() + downloadLink.expire_after_seconds * 1000;

      if (
        downloadLink.expire_after_seconds > 0 &&
        now.getTime() > expirationTime
      ) {
        return res.status(410).json({
          success: false,
          message: "This download link has expired",
        });
      }

      // Check if max downloads reached
      if (
        downloadLink.max_download_count > 0 &&
        downloadLink.download_count >= downloadLink.max_download_count
      ) {
        return res.status(410).json({
          success: false,
          message:
            "This download link has reached its maximum number of downloads",
        });
      }

      // Get the product info
      const product = await storage.getProduct(downloadLink.product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Associated product not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          downloadLink,
          product,
        },
      });
    } catch (error) {
      console.error("Error fetching download link:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching the download link",
      });
    }
  });

  // Use a download link (increments download count)
  app.post("/api/download-links/:id/download", async (req, res) => {
    try {
      const linkId = parseInt(req.params.id);

      if (isNaN(linkId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid download link ID",
        });
      }

      const downloadLink = await storage.getDownloadLink(linkId);

      if (!downloadLink) {
        return res.status(404).json({
          success: false,
          message: "Download link not found",
        });
      }

      // Check if the link has expired
      const now = new Date();
      const created = new Date(downloadLink.created_at);
      const expirationTime =
        created.getTime() + downloadLink.expire_after_seconds * 1000;

      if (
        downloadLink.expire_after_seconds > 0 &&
        now.getTime() > expirationTime
      ) {
        return res.status(410).json({
          success: false,
          message: "This download link has expired",
        });
      }

      // Check if max downloads reached
      if (
        downloadLink.max_download_count > 0 &&
        downloadLink.download_count >= downloadLink.max_download_count
      ) {
        return res.status(410).json({
          success: false,
          message:
            "This download link has reached its maximum number of downloads",
        });
      }

      // Get the product info
      const product = await storage.getProduct(downloadLink.product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Associated product not found",
        });
      }

      // Increment the download count
      const updatedLink = await storage.incrementDownloadCount(linkId);

      return res.status(200).json({
        success: true,
        message: "Download successful",
        data: {
          downloadLink: updatedLink,
          fileUrl: product.fileUrl,
        },
      });
    } catch (error) {
      console.error("Error processing download:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while processing the download",
      });
    }
  });

  // Delete a download link
  app.delete(
    "/api/download-links/:id",
    authMiddleware,
    adminMiddleware,
    async (req: AuthRequest, res) => {
      try {
        const linkId = parseInt(req.params.id);

        if (isNaN(linkId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid download link ID",
          });
        }

        // Check if the download link exists
        const downloadLink = await storage.getDownloadLink(linkId);
        if (!downloadLink) {
          return res.status(404).json({
            success: false,
            message: "Download link not found",
          });
        }

        // Delete the download link
        const success = await storage.deleteDownloadLink(linkId);

        if (!success) {
          return res.status(404).json({
            success: false,
            message: "Download link not found",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Download link deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting download link:", error);
        return res.status(500).json({
          success: false,
          message: "An error occurred while deleting the download link",
        });
      }
    },
  );

  const httpServer = createServer(app);
  return httpServer;
}
