import express from 'express';
import { getPropertyTypes } from '../controllers/propertyTypeController.js';

const router = express.Router();
router.get('/', getPropertyTypes);

export default router;