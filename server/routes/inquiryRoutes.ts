import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createInquiry } from '../controllers/inquiryController.js';

const router = express.Router();
router.post('/:propertyId', requireAuth, createInquiry);

export default router;