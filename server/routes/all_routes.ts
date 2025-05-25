// src/routes/index.ts
import { Express } from "express";
import { registerAuthRoutes } from "./authRoutes";
import { registerContactRoutes } from "./contactRoutes";
import { registerProductRoutes } from "./product";
import { registerDownloadRoutes } from "./downloads";
import { registerPaymentRoutes } from "./payment";
import { registerConfigRoutes } from "./config";

export function registerAllRoutes(app: Express): void {
  registerAuthRoutes(app);
  registerContactRoutes(app);
  registerProductRoutes(app);
  registerDownloadRoutes(app);
  registerPaymentRoutes(app);
  registerConfigRoutes(app);
}
