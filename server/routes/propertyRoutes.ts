import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createProperty, getMyProperties, updateProperty, deleteProperty,getPropertyById, getSimilarProperties } from '../controllers/propertyController.js';
import { searchProperties } from '../controllers/searchController.js';

const router = express.Router();

router.post('/', requireAuth, createProperty);

router.get('/search', searchProperties);
router.get('/mine', requireAuth, getMyProperties);

router.put('/:id', requireAuth, updateProperty);
router.delete('/:id', requireAuth, deleteProperty);
router.get('/:id', getPropertyById);
router.get('/:id/similar', getSimilarProperties);

export default router;