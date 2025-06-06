import redis from '../config/redis.js';
import ErrorHandler from '../middlewares/error.js';
import {
  RATE_LIMIT_CONFIG,
  getClientIP,
  generateRateLimitKey,
} from '../utils/rateLimit.js';

export const getRateLimitStatus = async (req, res, next) => {
  try {
    const clientIP = getClientIP(req);
    const key = generateRateLimitKey(clientIP);
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_CONFIG.windowMs;
    const currentCount = await redis.zcount(key, windowStart, now);
    const remainingRequests = Math.max(
      0,
      RATE_LIMIT_CONFIG.maxRequests - currentCount
    );
    const resetTime = now + RATE_LIMIT_CONFIG.windowMs;
    res.status(200).json({
      success: true,
      rateLimit: {
        limit: RATE_LIMIT_CONFIG.maxRequests,
        current: currentCount,
        remaining: remainingRequests,
        resetTime: new Date(resetTime).toISOString(),
        clientIP,
        windowMs: RATE_LIMIT_CONFIG.windowMs,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const clearRateLimit = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new ErrorHandler('Only admin can clear rate limits', 403));
    }
    const { ip } = req.body;
    if (!ip) {
      return next(new ErrorHandler('IP address is required', 400));
    }
    const pattern = `${RATE_LIMIT_CONFIG.keyPrefix}${ip}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
    res.status(200).json({
      success: true,
      message: `Rate limit cleared for IP: ${ip}`,
      clearedKeys: keys.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getRateLimitedIPs = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(
        new ErrorHandler('Only admin can view rate limited IPs', 403)
      );
    }
    const pattern = `${RATE_LIMIT_CONFIG.keyPrefix}*`;
    const keys = await redis.keys(pattern);
    const rateLimitedIPs = [];
    for (const key of keys) {
      const [, ipAndRoute] = key.split(RATE_LIMIT_CONFIG.keyPrefix);
      const [ip, route] = ipAndRoute.split(':');
      const now = Date.now();
      const windowStart = now - RATE_LIMIT_CONFIG.windowMs;
      const count = await redis.zcount(key, windowStart, now);
      if (count > 0) {
        rateLimitedIPs.push({
          ip,
          route: route || 'global',
          currentRequests: count,
          remaining: Math.max(0, RATE_LIMIT_CONFIG.maxRequests - count),
          key,
        });
      }
    }
    res.status(200).json({
      success: true,
      rateLimitedIPs,
      total: rateLimitedIPs.length,
    });
  } catch (error) {
    next(error);
  }
};
