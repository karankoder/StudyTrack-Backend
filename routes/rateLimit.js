import express from 'express';
import {
  getRateLimitStatus,
  clearRateLimit,
  getRateLimitedIPs,
} from '../controllers/rateLimit.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.get('/status', getRateLimitStatus);
router.post('/clear', isAuthenticated, clearRateLimit);
router.get('/ips', isAuthenticated, getRateLimitedIPs);

export default router;
