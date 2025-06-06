import redis from '../config/redis.js';

export const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000,
  maxRequests: 30,
  keyPrefix: 'rate_limit:',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

export const getClientIP = (req) => {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    '127.0.0.1'
  );
};

export const generateRateLimitKey = (ip, route = 'global') => {
  return `${RATE_LIMIT_CONFIG.keyPrefix}${ip}:${route}`;
};

export const slidingWindowRateLimit = async (key, windowMs, maxRequests) => {
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zcard(key);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.expire(key, Math.ceil(windowMs / 1000));
    const results = await pipeline.exec();
    if (!results || results.some(([err]) => err)) {
      throw new Error('Redis pipeline execution failed');
    }
    const currentCount = results[1][1];
    return {
      isAllowed: currentCount < maxRequests,
      currentCount: currentCount + 1,
      remainingRequests: Math.max(0, maxRequests - (currentCount + 1)),
      resetTime: now + windowMs,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    return {
      isAllowed: true,
      currentCount: 0,
      remainingRequests: maxRequests,
      resetTime: now + windowMs,
      error: true,
    };
  }
};
