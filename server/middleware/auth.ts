import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized access" 
      });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    req.user = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    };
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during authentication" 
    });
  }
}

export async function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: "Admin access required" 
      });
    }
    
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during admin authentication" 
    });
  }
}