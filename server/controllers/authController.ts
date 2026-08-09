import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

export const login = async (req: Request, res: Response) => {
  try {
    const { user_mail, password } = req.body;

    if (!user_mail || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      `SELECT user_id, user_name, user_mail, password_hash
       FROM users
       WHERE user_mail = $1`,
      [user_mail]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
        return res.status(500).json({
          message: "JWT secrets are not configured",
        });
    }

    const accessToken  = jwt.sign(
      {
        user_id: user.user_id,
        user_mail: user.user_mail,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      {
        user_id: user.user_id,
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      { 
        expiresIn: "7d" 
      }
    );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 60 * 1000, // 30 min, matches your JWT expiry
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

    return res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        user_mail: user.user_mail,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const refreshAccessToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token is missing",
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { user_id: number };

    const accessToken = jwt.sign(
      { user_id: decoded.user_id },
      process.env.JWT_SECRET as string,
      { expiresIn: "30m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60 * 1000, // 30 min, matches your JWT expiry
    });

    return res.status(200).json({ message: "Token refreshed" });
  } catch {
    return res.status(403).json({
      message: "Invalid or expired refresh token",
    });
  }
};