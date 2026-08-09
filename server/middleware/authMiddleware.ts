import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: { user_id: number };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { user_id: number };
    req.user = { user_id: decoded.user_id };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};