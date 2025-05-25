import express, { type Express } from "express";
import { createServer, type Server } from "http";

import path from "path";
import { registerAllRoutes } from "./routes/all_routes";


export async function registerRoutes(app: Express): Promise<Server> {
  // Serve files from the public directory
  app.use(express.static(path.join(process.cwd(), "public")));

  registerAllRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
