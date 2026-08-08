import express from 'express'
import {register} from '../controllers/authController.js'

const authrouter = express.Router();

authrouter.post('/signup', register);

export default authrouter