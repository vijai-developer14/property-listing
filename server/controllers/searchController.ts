import pool from "../config/db.js";
import type { Request, Response } from "express";

type SortMode = "newest" | "price_low" | "price_high";

type Cursor = {
  v: string | number | null;
  id: number;
};

function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function decodeCursor(raw: string): Cursor | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (parsed && typeof parsed.id === "number") {
      return { v: parsed.v ?? null, id: parsed.id };
    }
    return null;
  } catch {
    return null;
  }
}

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
    const sortMode: SortMode =
      sort === "price_low" || sort === "price_high" ? sort : "newest";

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

    // Keyset (cursor) condition. A cursor is only valid for the sort + filters
    // it was issued under; the client resets it whenever those change.
    const decoded = cursor ? decodeCursor(cursor) : null;
    if (cursor && !decoded) {
      return res.status(400).json({ message: "Invalid cursor" });
    }

    if (decoded) {
      if (sortMode === "newest") {
        // ORDER BY id DESC → the next page is everything with a smaller id.
        conditions.push(`id < $${paramIndex}`);
        values.push(decoded.id);
        paramIndex++;
      } else if (sortMode === "price_low") {
        // ORDER BY property_price ASC, id ASC → next rows compare "greater".
        conditions.push(`(property_price, id) > ($${paramIndex}, $${paramIndex + 1})`);
        values.push(decoded.v, decoded.id);
        paramIndex += 2;
      } else {
        // price_high: ORDER BY property_price DESC, id DESC → next rows compare "less".
        conditions.push(`(property_price, id) < ($${paramIndex}, $${paramIndex + 1})`);
        values.push(decoded.v, decoded.id);
        paramIndex += 2;
      }
    }

    let sortClause = "ORDER BY id DESC";
    if (sortMode === "price_low") {
      sortClause = "ORDER BY property_price ASC, id ASC";
    } else if (sortMode === "price_high") {
      sortClause = "ORDER BY property_price DESC, id DESC";
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Fetch pageSize + 1 to detect whether another page exists.
    values.push(pageSize + 1);
    const limitParam = `$${paramIndex}`;

    const query = `
      SELECT id, property_name, city, location, property_size, property_price, property_bhk, property_type_id, created_at
      FROM property
      ${whereClause}
      ${sortClause}
      LIMIT ${limitParam}
    `;

    const result = await pool.query(query, values);

    const hasMore = result.rows.length > pageSize;
    const properties = hasMore ? result.rows.slice(0, pageSize) : result.rows;

    let nextCursor: string | null = null;
    if (hasMore && properties.length > 0) {
      const last = properties[properties.length - 1];
      const sortValue = sortMode === "newest" ? null : last.property_price;
      nextCursor = encodeCursor({ v: sortValue, id: last.id });
    }

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
