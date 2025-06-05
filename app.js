import express from 'express';
import { config } from 'dotenv';
import { errorMiddleware } from './middlewares/error.js';
import userRouter from './routes/user.js';
import cors from 'cors';

export const app = express();
export const backendUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.LOCAL_BACKEND_URL
    : process.env.BACKEND_URL;


config({
  path: './.env',
});

app.use(express.json());
app.use(
  cors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);


app.use('/api/v1/users', userRouter);

app.get('/', (req, res) => {
  res.send('Server is working');
});

app.get('/failure', (req, res) => {
  res.send('Failed to Login');
});

app.use(errorMiddleware);