import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { inquiryRateLimiter } from '../middleware/rateLimiter.js';
import { createInquiry, getMyInquiries } from '../controllers/inquiryController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inquiries
 *   description: Buyer-to-owner contact requests on properties
 */

/**
 * @swagger
 * /inquiries/mine:
 *   get:
 *     summary: Get all inquiries received on properties owned by the logged-in user
 *     tags: [Inquiries]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of inquiries, newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inquiries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inquiry'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/mine', requireAuth, getMyInquiries);

/**
 * @swagger
 * /inquiries/{propertyId}:
 *   post:
 *     summary: Send an inquiry to a property's owner. Resending updates the existing inquiry (upsert). Rate-limited to 5 per 15 minutes per user.
 *     tags: [Inquiries]
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
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InquiryInput'
 *     responses:
 *       201:
 *         description: Inquiry sent or updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inquiry updated
 *                 inquiry:
 *                   $ref: '#/components/schemas/Inquiry'
 *       400:
 *         description: Validation failed, or user is inquiring on their own property
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
 *       429:
 *         description: Too many inquiries sent recently
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:propertyId', requireAuth, inquiryRateLimiter, createInquiry);

export default router;
