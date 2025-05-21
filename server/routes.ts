import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertUserSchema, insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { authMiddleware, adminMiddleware, AuthRequest } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required"
        });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
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
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during login"
      });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error logging out"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Logged out successfully"
      });
    });
  });
  
  app.get("/api/auth/me", authMiddleware, (req: AuthRequest, res) => {
    return res.status(200).json({
      success: true,
      data: req.user
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
          errors: validation.error.format() 
        });
      }
      
      const contact = await storage.createContact(validation.data);
      
      return res.status(201).json({ 
        success: true, 
        message: "Contact form submitted successfully",
        data: contact
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while submitting the form" 
      });
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      return res.status(200).json({ 
        success: true, 
        data: contacts 
      });
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching contacts" 
      });
    }
  });
  
  // Product management routes (protected admin routes)
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      return res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching products"
      });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID"
        });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching the product"
      });
    }
  });
  
  // Protected admin routes for product management
  app.post("/api/products", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const validation = insertProductSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid product data",
          errors: validation.error.format()
        });
      }
      
      const product = await storage.createProduct(validation.data);
      
      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product
      });
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the product"
      });
    }
  });
  
  app.put("/api/products/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID"
        });
      }
      
      const validation = insertProductSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid product data",
          errors: validation.error.format()
        });
      }
      
      const updatedProduct = await storage.updateProduct(productId, validation.data);
      
      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct
      });
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the product"
      });
    }
  });
  
  app.delete("/api/products/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID"
        });
      }
      
      const success = await storage.deleteProduct(productId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Product deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the product"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
