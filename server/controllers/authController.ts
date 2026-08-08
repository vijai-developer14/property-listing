import bcrypt from "bcrypt";
import  pool  from "../config/db.js";
import type { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
  try {
    const { user_name, user_mail, password, user_number, user_whatsapp_number } = req.body;

    if (!user_name || !user_mail || !password || !user_number) {
      return res.status(400).json({ message: "Name, email, number and password are required" });
    }

    const existingUser = await pool.query(
      "SELECT user_id FROM users WHERE user_mail = $1",
      [user_mail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 4. Insert the new user
    const result = await pool.query(
      `INSERT INTO users (user_name, user_mail, password_hash, user_number, user_whatsapp_number, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING user_id, user_name, user_mail, created_at`,
      [user_name, user_mail, password_hash, user_number, user_whatsapp_number ?? null]
    );

    const newUser = result.rows[0];

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

