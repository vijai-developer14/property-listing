import express from 'express'
const {login} = require('../controllers/login-controller')

const Loginrouter = express.Router();

Loginrouter.post('/login', login)

export default Loginrouter