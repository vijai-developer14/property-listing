import rateLimit from "express-rate-limit";
import type { AuthRequest } from "./authMiddleware.js";

export const inquiryRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: "Too many inquiries sent. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthRequest) => {
    return req.user?.user_id ? String(req.user.user_id) : req.ip ?? "unknown";
  },
});