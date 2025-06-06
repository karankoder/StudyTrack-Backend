import express from 'express';
import { config } from 'dotenv';
import { errorMiddleware } from './middlewares/error.js';
import userRouter from './routes/user.js';
import chapterRouter from './routes/chapter.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

config({
  path: './.env',
});

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/chapters', chapterRouter);

app.get('/ping', (req, res) => {
  res.send('Pong!');
});

app.get('/failure', (req, res) => {
  res.send('Oops! Something went wrong');
});

app.use(errorMiddleware);
