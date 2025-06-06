import redis from '../config/redis.js';
import ErrorHandler from './error.js';
import {
  RATE_LIMIT_CONFIG,
  getClientIP,
  generateRateLimitKey,
  slidingWindowRateLimit,
} from '../utils/rateLimit.js';

export const createRateLimit = (options = {}) => {
  const config = { ...RATE_LIMIT_CONFIG, ...options };

  return async (req, res, next) => {
    try {
      const clientIP = getClientIP(req);
      const route = config.useRouteSpecific
        ? req.route?.path || req.path
        : 'global';
      const key = generateRateLimitKey(clientIP, route);

      const result = await slidingWindowRateLimit(
        key,
        config.windowMs,
        config.maxRequests
      );

      res.set({
        'X-RateLimit-Limit': config.maxRequests,
        'X-RateLimit-Remaining': result.remainingRequests,
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        'X-RateLimit-RetryAfter': Math.ceil(config.windowMs / 1000),
      });

      if (!result.isAllowed) {
        const resetInSeconds = Math.ceil(
          (result.resetTime - Date.now()) / 1000
        );

        return next(
          new ErrorHandler(
            `Too many requests. You have exceeded the rate limit of ${config.maxRequests} requests per minute. Please try again in ${resetInSeconds} seconds.`,
            429,
            'RATE_LIMIT_EXCEEDED'
          )
        );
      }

      req.rateLimit = {
        current: result.currentCount,
        remaining: result.remainingRequests,
        resetTime: result.resetTime,
        clientIP,
      };

      next();
    } catch (error) {
      console.error('Rate limiting middleware error:', error);
      next();
    }
  };
};

export const rateLimiter = createRateLimit();

export const routeSpecificRateLimiter = createRateLimit({
  useRouteSpecific: true,
});

export default rateLimiter;
