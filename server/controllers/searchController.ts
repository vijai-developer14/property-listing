import pool from "../config/db.js";
import type { Request, Response } from "express";

export const searchProperties = async (req: Request, res: Response) => {
  try {
    const {
      city,
      property_type_id,
      property_bhk,
      min_price,
      max_price,
      sort = "newest",
      cursor,
      limit = "12",
    } = req.query as Record<string, string>;

    const pageSize = Math.min(parseInt(limit, 10) || 12, 50); 
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (city) {
      conditions.push(`city ILIKE $${paramIndex}`);
      values.push(city);
      paramIndex++;
    }
    if (property_type_id) {
      conditions.push(`property_type_id = $${paramIndex}`);
      values.push(property_type_id);
      paramIndex++;
    }
    if (property_bhk) {
      conditions.push(`property_bhk = $${paramIndex}`);
      values.push(property_bhk);
      paramIndex++;
    }
    if (min_price) {
      conditions.push(`property_price >= $${paramIndex}`);
      values.push(min_price);
      paramIndex++;
    }
    if (max_price) {
      conditions.push(`property_price <= $${paramIndex}`);
      values.push(max_price);
      paramIndex++;
    }

    const sortColumn = sort === "price_low" || sort === "price_high" ? "property_price" : "created_at";
    const sortDirection = sort === "price_low" ? "ASC" : sort === "price_high" ? "DESC" : "DESC";

    if (cursor) {
      const cursorOperator = sortDirection === "DESC" ? "<" : ">";
      conditions.push(`${sortColumn} ${cursorOperator} $${paramIndex}`);
      values.push(cursor);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    values.push(pageSize + 1); 

  const result = await pool.query(
    `SELECT id, property_name, city, location, property_size, property_price, property_bhk, property_type_id, created_at
    FROM property
    ${whereClause}
    ORDER BY ${sortColumn} ${sortDirection}
    LIMIT $${paramIndex}`,
    values
  );

    const hasMore = result.rows.length > pageSize;
    const properties = hasMore ? result.rows.slice(0, pageSize) : result.rows;
    const nextCursor = hasMore ? properties[properties.length - 1][sortColumn] : null;

    return res.status(200).json({
      properties,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};