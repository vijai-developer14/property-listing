import express from 'express';
import { getPropertyTypes } from '../controllers/propertyTypeController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Property Types
 *   description: Lookup list of property categories (Apartment, Villa, etc.)
 */

/**
 * @swagger
 * /property-types:
 *   get:
 *     summary: Get all property types
 *     tags: [Property Types]
 *     security: []
 *     responses:
 *       200:
 *         description: List of property types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 propertyTypes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PropertyType'
 */
router.get('/', getPropertyTypes);

export default router;
