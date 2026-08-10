import pool from "../config/db.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";

export const createInquiry = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { message } = req.body;
    const sender_user_id = req.user?.user_id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message is required" });
    }

    const property = await pool.query(`SELECT user_id FROM property WHERE id = $1`, [propertyId]);
    if (property.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.rows[0].user_id === sender_user_id) {
      return res.status(400).json({ message: "You can't send an inquiry to your own property" });
    }

    const result = await pool.query(
      `INSERT INTO inquiries (property_id, sender_user_id, message, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, message, created_at`,
      [propertyId, sender_user_id, message]
    );

    return res.status(201).json({ message: "Inquiry sent", inquiry: result.rows[0] });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "You've already contacted this owner about this property" });
    }
    console.error("Create inquiry error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

