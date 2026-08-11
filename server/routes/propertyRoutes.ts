import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createProperty, getMyProperties, updateProperty, deleteProperty,getPropertyById, getSimilarProperties } from '../controllers/propertyController.js';
import { searchProperties } from '../controllers/searchController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Property CRUD, public search, and similar-property recommendations
 */

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Create a new property (owned by the logged-in user)
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyInput'
 *     responses:
 *       201:
 *         description: Property created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property created
 *                 property:
 *                   $ref: '#/components/schemas/Property'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', requireAuth, createProperty);

/**
 * @swagger
 * /properties/search:
 *   get:
 *     summary: Search properties with filters, sorting, and cursor pagination
 *     tags: [Properties]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *         example: Chennai
 *       - in: query
 *         name: property_type_id
 *         schema: { type: integer }
 *       - in: query
 *         name: property_bhk
 *         schema: { type: integer }
 *       - in: query
 *         name: min_price
 *         schema: { type: integer }
 *       - in: query
 *         name: max_price
 *         schema: { type: integer }
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, price_low, price_high]
 *           default: newest
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *         description: Value of the sort column from the last item of the previous page
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12, maximum: 50 }
 *     responses:
 *       200:
 *         description: Paginated search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResult'
 */
router.get('/search', searchProperties);

/**
 * @swagger
 * /properties/mine:
 *   get:
 *     summary: Get all properties owned by the logged-in user
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of the user's own properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 properties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/mine', requireAuth, getMyProperties);

/**
 * @swagger
 * /properties/{id}:
 *   put:
 *     summary: Update a property (owner only)
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyInput'
 *     responses:
 *       200:
 *         description: Property updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property updated
 *                 property:
 *                   $ref: '#/components/schemas/Property'
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
router.put('/:id', requireAuth, updateProperty);

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Delete a property (owner only)
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Property deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property deleted
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
router.delete('/:id', requireAuth, deleteProperty);

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Get a single property by ID (public)
 *     tags: [Properties]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Property details, including its type name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 property:
 *                   $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getPropertyById);

/**
 * @swagger
 * /properties/{id}/similar:
 *   get:
 *     summary: Get up to 4 similar properties (locality+price match, falling back to city-wide)
 *     tags: [Properties]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Similar properties (may be fewer than 4, or empty)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 properties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/similar', getSimilarProperties);

export default router;
