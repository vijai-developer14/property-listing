

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
      page = "1",
      limit = "12",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(parseInt(limit, 10) || 12, 50);
    const offset = (pageNum - 1) * pageSize;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (city) {
      conditions.push(`city ILIKE $${paramIndex}`);
      values.push(`%${city}%`);
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

    let sortClause = "ORDER BY created_at DESC, id DESC";
    if (sort === "price_low") {
      sortClause = "ORDER BY property_price ASC, id ASC";
    } else if (sort === "price_high") {
      sortClause = "ORDER BY property_price DESC, id DESC";
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Fetch pageSize + 1 to accurately determine if more items exist
    values.push(pageSize + 1);
    const limitParam = `$${paramIndex}`;
    paramIndex++;

    values.push(offset);
    const offsetParam = `$${paramIndex}`;

    const query = `
      SELECT id, property_name, city, location, property_size, property_price, property_bhk, property_type_id, created_at
      FROM property
      ${whereClause}
      ${sortClause}
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `;

    const result = await pool.query(query, values);

    const hasMore = result.rows.length > pageSize;
    const properties = hasMore ? result.rows.slice(0, pageSize) : result.rows;

    return res.status(200).json({
      properties,
      hasMore,
      page: pageNum,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};