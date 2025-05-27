import { type Express } from "express";
import { storage } from "../storage";
import { authMiddleware, AuthRequest } from "../middleware/auth";

export function registerAuthRoutes(app: Express): void {

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

  // Debug route to check session status (only in development)
  app.get("/api/auth/debug", (req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({ message: "Not found" });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        sessionId: req.sessionID,
        userId: req.session?.userId,
        hasSession: !!req.session,
        cookieSettings: {
          secure: req.session?.cookie?.secure,
          domain: req.session?.cookie?.domain,
          sameSite: req.session?.cookie?.sameSite,
          maxAge: req.session?.cookie?.maxAge,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          replitDomains: process.env.REPLIT_DOMAINS,
          replitDevDomain: process.env.REPLIT_DEV_DOMAIN,
        },
      },
    });
  });

  // Route to clear session cookies (for troubleshooting domain changes)
  app.post("/api/auth/clear-session", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error clearing session:", err);
      }
      
      // Clear the session cookie
      res.clearCookie('connect.sid');
      
      return res.status(200).json({
        success: true,
        message: "Session cleared successfully",
      });
    });
  });
}