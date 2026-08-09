import express from 'express'
import {register, login, refreshAccessToken} from '../controllers/authController.js'

const authrouter = express.Router();

authrouter.post('/auth/register', register);
authrouter.post('/auth/login', login);
authrouter.post('/auth/refresh', refreshAccessToken);

export default authrouter