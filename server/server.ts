import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import authrouter from './routes/authRoutes.js'

const app = express();
const env = dotenv.config()
app.use(cors());
app.use(express.json());

// === env
const PORT = process.env.PORT || 3000;

// == LOGIN ==
app.use('/api', authrouter);


app.listen(PORT, ()=>{
    console.log('app listening to ' + PORT);
});