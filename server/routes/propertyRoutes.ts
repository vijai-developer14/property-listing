import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createProperty, getMyProperties, updateProperty, deleteProperty } from '../controllers/propertyController.js';
import { searchProperties } from '../controllers/searchController.js';

const router = express.Router();

router.post('/', requireAuth, createProperty);
router.get('/mine', requireAuth, getMyProperties);
router.put('/:id', requireAuth, updateProperty);
router.delete('/:id', requireAuth, deleteProperty);
router.get('/search', searchProperties);

export default router;