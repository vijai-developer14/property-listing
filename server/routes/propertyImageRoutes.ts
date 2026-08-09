import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { uploadPropertyImages, getPropertyImages, deletePropertyImage } from '../controllers/propertyImageController.js';

const router = express.Router();

router.post('/:propertyId', requireAuth, upload.array('images', 10), uploadPropertyImages);
router.get('/:propertyId', getPropertyImages);
router.delete('/:imageId', requireAuth, deletePropertyImage);

export default router;