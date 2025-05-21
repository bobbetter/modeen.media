import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
