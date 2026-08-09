import cloudinary from "../config/cloudinary.js";
import pool from "../config/db.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import type { QueryResult } from "pg";


export const uploadPropertyImages = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;
    const user_id = req.user?.user_id;

   
    const property = await pool.query(
      `SELECT user_id FROM property WHERE id = $1`,
      [propertyId]
    );
    if (property.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.rows[0].user_id !== user_id) {
      return res.status(403).json({ message: "You don't have permission to add images to this property" });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }


    const existingCount = await pool.query(
      `SELECT COUNT(*) FROM property_images WHERE property_id = $1`,
      [propertyId]
    );
    const currentTotal = parseInt(existingCount.rows[0].count, 10);

    if (currentTotal + files.length > 10) {
      return res.status(400).json({
        message: `This property already has ${currentTotal} photo(s). You can add up to ${10 - currentTotal} more.`,
      });
    }

    const uploadedImages = [];

    for (const file of files) {
      const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "property_listing" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    const imageResult: QueryResult<{ id: number; image_url: string; is_primary: boolean }> = await pool.query(
      `INSERT INTO property_images (property_id, image_url, cloudinary_public_id, is_primary)
      VALUES ($1, $2, $3, $4)
      RETURNING id, image_url, is_primary`,
      [propertyId, uploadResult.secure_url, uploadResult.public_id, currentTotal === 0 && uploadedImages.length === 0]
    );
      uploadedImages.push(imageResult.rows[0]);
    }

    return res.status(201).json({ message: "Images uploaded", images: uploadedImages });
  } catch (error) {
    console.error("Upload image error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getPropertyImages = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;
    const result = await pool.query(
      `SELECT id, image_url, is_primary FROM property_images WHERE property_id = $1 ORDER BY is_primary DESC`,
      [propertyId]
    );
    return res.status(200).json({ images: result.rows });
  } catch (error) {
    console.error("Get images error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletePropertyImage = async (req: AuthRequest, res: Response) => {
  try {
    const { imageId } = req.params;
    const user_id = req.user?.user_id;

    const result = await pool.query(
      `SELECT pi.id, pi.cloudinary_public_id, p.user_id
       FROM property_images pi
       JOIN property p ON pi.property_id = p.id
       WHERE pi.id = $1`,
      [imageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    if (result.rows[0].user_id !== user_id) {
      return res.status(403).json({ message: "You don't have permission to delete this image" });
    }

    const publicId = result.rows[0].cloudinary_public_id;

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    await pool.query(`DELETE FROM property_images WHERE id = $1`, [imageId]);

    return res.status(200).json({ message: "Image deleted" });
  } catch (error) {
    console.error("Delete image error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};