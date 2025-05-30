import { type Express } from "express";
import { storage } from "../storage";
import {
  authMiddleware,
  AuthRequest,
  adminMiddleware,
} from "../middleware/auth";
import { insertDownloadLinkSchema } from "@shared/schema";
import {
  decode_jwt_token,
  ProductTokenPayload,
} from "../utils/jwt";
import { createOrGetDownloadLink } from "../utils/downloadLink";
import { getFileFromObjectStorage } from "../utils/replitObjectStorage";
export function registerDownloadRoutes(app: Express): void {
  // Download Links Routes
  // Get all download links with pagination
  app.get(
    "/api/download-links",
    authMiddleware,
    adminMiddleware,
    async (req: AuthRequest, res) => {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
          return res.status(400).json({
            success: false,
            message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.",
          });
        }

        const paginatedResult = await storage.getDownloadLinksPaginated(page, limit);
        return res.status(200).json({
          success: true,
          data: paginatedResult.data,
          pagination: {
            page: paginatedResult.page,
            limit: paginatedResult.limit,
            total: paginatedResult.total,
            totalPages: paginatedResult.totalPages,
          },
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

  // Get download links for a specific session
  app.get(
    "/api/download-links/session/:sessionId",
    authMiddleware,
    adminMiddleware,
    async (req: AuthRequest, res) => {
      try {
        const sessionId = req.params.sessionId;

        if (!sessionId) {
          return res.status(400).json({
            success: false,
            message: "Session ID is required",
          });
        }

        const downloadLinks =
          await storage.getDownloadLinksBySessionId(sessionId);
        return res.status(200).json({
          success: true,
          data: downloadLinks,
        });
      } catch (error) {
        console.error("Error fetching download links by session:", error);
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
        // Use the shared utility to create download link
        const { downloadLink } = await createOrGetDownloadLink({
          product_id: req.body.product_id,
          max_download_count: req.body.max_download_count,
          expire_after_seconds: req.body.expire_after_seconds,
          created_by: req.body.created_by,
        });

        return res.status(201).json({
          success: true,
          message: "Download link created successfully",
          data: downloadLink,
        });
      } catch (error) {
        console.error("Error creating download link:", error);
        
        // Handle specific error types
        if (error instanceof Error) {
          if (error.message === "Product not found") {
            return res.status(404).json({
              success: false,
              message: "Product not found",
            });
          }
          if (error.message.includes("Invalid download link data")) {
            return res.status(400).json({
              success: false,
              message: "Invalid download link data",
              errors: error.message,
            });
          }
        }
        
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
      if (downloadLink.signed_s3_url) {
      // Redirect to the signed url
        return res.redirect(downloadLink.signed_s3_url);
      } else {
        return res.status(404).json({ error: "No signed url found for this download link" });
      }
    } catch (error) {
      console.error("Error serving download:", error);
      return res.status(500).json({ error: "Failed to redirect to signed url" });
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


}
