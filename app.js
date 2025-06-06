import express from 'express';
import { config } from 'dotenv';
import { errorMiddleware } from './middlewares/error.js';
import userRouter from './routes/user.js';
import chapterRouter from './routes/chapter.js';
import rateLimitRouter from './routes/rateLimit.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimiter from './middlewares/rateLimiter.js';

config({
  path: './.env',
});

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(rateLimiter);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/chapters', chapterRouter);
app.use('/api/v1/rate-limit', rateLimitRouter);

app.get('/ping', (req, res) => {
  res.send('Pong!');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/failure', (req, res) => {
  res.send('Oops! Something went wrong');
});

app.use(errorMiddleware);
