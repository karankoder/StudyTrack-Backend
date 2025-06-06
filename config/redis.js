import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD || '',
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

const redis = new Redis(redisConfig);
redis
  .on('connect', () => console.log('Redis: connected'))
  .on('ready', () => console.log('Redis: ready'))
  .on('close', () => console.log('Redis: connection closed'))
  .on('reconnecting', () => console.log('Redis: reconnecting…'))
  .on('error', (err) => console.log('Redis: connection error', err));

const gracefulQuit = async () => {
  console.log('Redis: quitting…');
  try {
    await redis.quit();
    console.log('Redis: quit complete');
  } catch (err) {
    console.log('Redis quit error', err);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', gracefulQuit);
process.on('SIGTERM', gracefulQuit);

export default redis;
