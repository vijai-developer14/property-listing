import pool from "../config/db.js";
import type { Request, Response } from "express";

export const getPropertyTypes = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT id, property_type FROM property_type ORDER BY property_type`);
    return res.status(200).json({ propertyTypes: result.rows });
  } catch (error) {
    console.error("Get property types error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};