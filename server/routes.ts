import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";
import path from "path";
import fs from "fs";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Soundpack data - in a real app, this would come from a database
const soundpacks = [
  {
    id: 1,
    title: "Signature Soundpack",
    description: "A collection of 200+ handcrafted sounds, designed for professionals.",
    priceInCents: 14999, // $149.99
    filename: "signature-soundpack.zip"
  },
  {
    id: 2,
    title: "CREATORS MOSTWANTED",
    description: "The ultimate creator toolkit featuring 150+ trending sounds and effects.",
    priceInCents: 12999, // $129.99
    filename: "creators-mostwanted.zip"
  }
];

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
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

  // Stripe payment intent creation endpoint
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { productId } = req.body;
      
      // Find the product
      const product = soundpacks.find(p => p.id === productId);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: "Product not found" 
        });
      }

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: product.priceInCents,
        currency: "usd",
        metadata: {
          productId: productId.toString(),
          productTitle: product.title
        }
      });

      // Send publishable key and PaymentIntent details to client
      res.json({
        clientSecret: paymentIntent.client_secret,
        productTitle: product.title,
        amount: product.priceInCents
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        success: false, 
        message: `Error creating payment intent: ${error.message}` 
      });
    }
  });

  // Verify payment and get download link
  app.get("/api/verify-payment", async (req, res) => {
    try {
      const { productId } = req.query;
      
      if (!productId) {
        return res.status(400).json({ 
          success: false, 
          message: "Product ID is required" 
        });
      }

      // Find the product
      const product = soundpacks.find(p => p.id === Number(productId));
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: "Product not found" 
        });
      }

      // In a real application, you would verify the payment was successful
      // by looking up the PaymentIntent in Stripe using its ID
      // For demo purposes, we'll assume payment was successful

      // Generate a download URL
      const downloadUrl = `/api/download/${product.filename}`;

      res.json({
        success: true,
        productTitle: product.title,
        downloadUrl
      });
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ 
        success: false, 
        message: `Error verifying payment: ${error.message}` 
      });
    }
  });

  // Download endpoint
  app.get("/api/download/:filename", (req, res) => {
    const { filename } = req.params;
    
    // In a real application, you would verify the user has purchased this file
    // For demo purposes, we'll assume download permission was verified

    // Create dummy files for demo purposes
    const filesDir = path.join(__dirname, '..', 'files');
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }

    const filePath = path.join(filesDir, filename);
    
    // If the file doesn't exist, create a dummy zip file
    if (!fs.existsSync(filePath)) {
      // Create a simple text file with a message
      const dummyText = `This is a placeholder for the ${filename} soundpack.\nIn a production environment, this would be the actual audio files you purchased.`;
      fs.writeFileSync(filePath, dummyText);
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/zip');
    
    // Send the file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error(`Error downloading file: ${err}`);
        res.status(500).send('Error downloading file');
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
