import pool from "../config/db.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";

export const createInquiry = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { message, name, phone } = req.body;
    const sender_user_id = req.user?.user_id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message is required" });
    }
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!phone || phone.trim().length === 0) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const property = await pool.query(`SELECT user_id FROM property WHERE id = $1`, [propertyId]);
    if (property.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.rows[0].user_id === sender_user_id) {
      return res.status(400).json({ message: "You can't send an inquiry to your own property" });
    }

    const result = await pool.query(
      `INSERT INTO inquiries (property_id, sender_user_id, sender_name, sender_phone, message, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (property_id, sender_user_id)
       DO UPDATE SET
         sender_name = EXCLUDED.sender_name,
         sender_phone = EXCLUDED.sender_phone,
         message = EXCLUDED.message,
         created_at = NOW()
       RETURNING id, sender_name, sender_phone, message, created_at`,
      [propertyId, sender_user_id, name, phone, message]
    );

    return res.status(201).json({ message: "Inquiry updated", inquiry: result.rows[0] });
  } catch (error) {
    console.error("Create inquiry error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMyInquiries = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;

    const result = await pool.query(
      `SELECT i.id, i.property_id, i.sender_name, i.sender_phone, i.message, i.created_at,
              p.property_name
       FROM inquiries i
       JOIN property p ON i.property_id = p.id
       WHERE p.user_id = $1
       ORDER BY i.created_at DESC`,
      [user_id]
    );

    return res.status(200).json({ inquiries: result.rows });
  } catch (error) {
    console.error("Get my inquiries error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};