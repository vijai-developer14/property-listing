import pool from "../config/db.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    const {
      property_name,
      address_line,
      location,
      city,
      property_size,
      property_price,
      description,
      property_bhk,
      property_type_id,
    } = req.body;

    if (!property_name || !city || !property_price || !property_type_id) {
      return res.status(400).json({ message: "Name, city, price, and property type are required" });
    }

    const result = await pool.query(
      `INSERT INTO property
        (property_name, address_line, location, city, property_size, property_price, description, property_bhk, property_type_id, user_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [property_name, address_line, location, city, property_size, property_price, description, property_bhk, property_type_id, user_id]
    );

    return res.status(201).json({ message: "Property created", property: result.rows[0] });
  } catch (error) {
    console.error("Create property error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMyProperties = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    const result = await pool.query(
      `SELECT * FROM property WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );
    return res.status(200).json({ properties: result.rows });
  } catch (error) {
    console.error("Get my properties error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    const { id } = req.params;

    const existing = await pool.query(`SELECT user_id FROM property WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (existing.rows[0].user_id !== user_id) {
      return res.status(403).json({ message: "You don't have permission to edit this property" });
    }

    const {
      property_name, address_line, location, city,
      property_size, property_price, description, property_bhk, property_type_id,
    } = req.body;

    const result = await pool.query(
      `UPDATE property SET
        property_name = $1, address_line = $2, location = $3, city = $4,
        property_size = $5, property_price = $6, description = $7, property_bhk = $8, property_type_id = $9,
        updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [property_name, address_line, location, city, property_size, property_price, description, property_bhk, property_type_id, id]
    );

    return res.status(200).json({ message: "Property updated", property: result.rows[0] });
  } catch (error) {
    console.error("Update property error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    const { id } = req.params;

    const existing = await pool.query(`SELECT user_id FROM property WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (existing.rows[0].user_id !== user_id) {
      return res.status(403).json({ message: "You don't have permission to delete this property" });
    }

    await pool.query(`DELETE FROM property WHERE id = $1`, [id]);
    return res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    console.error("Delete property error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};