import express from 'express'
import {register, login, refreshAccessToken} from '../controllers/authController.js'
import { requireAuth } from '../middleware/authMiddleware.js';
import {getCurrentUser} from '../controllers/authController.js'

const authrouter = express.Router();

authrouter.post('/auth/register', register);
authrouter.post('/auth/login', login);
authrouter.post('/auth/refresh', refreshAccessToken);
authrouter.get('/auth/me', requireAuth, getCurrentUser);

export default authrouter