import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { uploadPropertyImages, getPropertyImages, deletePropertyImage } from '../controllers/propertyImageController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Property Images
 *   description: Upload, list, and delete property photos (stored via Cloudinary)
 */

/**
 * @swagger
 * /property-images/{propertyId}:
 *   post:
 *     summary: Upload up to 10 images for a property (owner only)
 *     tags: [Property Images]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Images uploaded. The first image uploaded for a property is auto-marked primary.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Images uploaded
 *                 images:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PropertyImage'
 *       400:
 *         description: No images uploaded, or property already has 10 photos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not the owner of this property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:propertyId', requireAuth, upload.array('images', 10), uploadPropertyImages);

/**
 * @swagger
 * /property-images/{propertyId}:
 *   get:
 *     summary: Get all images for a property (public)
 *     tags: [Property Images]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of images, primary image first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 images:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PropertyImage'
 */
router.get('/:propertyId', getPropertyImages);

/**
 * @swagger
 * /property-images/{imageId}:
 *   delete:
 *     summary: Delete a single image (owner only). Removes from both DB and Cloudinary.
 *     tags: [Property Images]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Image deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Image deleted
 *       403:
 *         description: Not the owner of this image's property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:imageId', requireAuth, deletePropertyImage);

export default router;
