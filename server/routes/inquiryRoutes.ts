import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { inquiryRateLimiter } from '../middleware/rateLimiter.js';
import { createInquiry, getMyInquiries } from '../controllers/inquiryController.js';

const router = express.Router();

router.get('/mine', requireAuth, getMyInquiries);
router.post('/:propertyId', requireAuth, inquiryRateLimiter, createInquiry);

export default router;