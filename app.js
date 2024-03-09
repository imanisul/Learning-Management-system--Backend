import express from 'express';
const app = express()
import cors from 'cors';

import dotenv from 'dotenv'
dotenv.config();


import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import userRoutes from './router/userRoutes.js';
import courseRoutes from './router/courseRouter.js';
import paymentRoutes from './router/paymentRoutes.js';
import contactRoutes from './router/contactRouter.js'
import errorMiddleware from './middlewares/errorMiddleware.js';




app.use(express.json()); 
app.use(express.urlencoded({extended: true}));

app.use(morgan("dev"));

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));

app.use(cookieParser());



app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/conatct', contactRoutes);




app.all('*', (req, res) => {
    res.status(404).send("OOPS!!! 404 Page Not found.")
});

app.use(errorMiddleware);

export default app;