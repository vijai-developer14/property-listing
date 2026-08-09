import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import cookieParser from "cookie-parser";
import authrouter from './routes/authRoutes.js'
import propertyRouter from './routes/propertyRoutes.js';
import propertyTypeRouter from './routes/propertyTypeRoutes.js';
import propertyImageRouter from './routes/propertyImageRoutes.js';

const app = express();
const env = dotenv.config()
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3001",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// === env
const PORT = process.env.PORT || 3000;

// == LOGIN ==
app.use('/api', authrouter);

// == PROPERTIES
app.use('/api/properties', propertyRouter);
app.use('/api/property-types', propertyTypeRouter);

// == IMAGES
app.use('/api/property-images', propertyImageRouter);

app.listen(PORT, ()=>{
    console.log('app listening to ' + PORT);
});