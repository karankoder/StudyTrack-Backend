import express from 'express';
import {
  createNewUser,
  userLogin,
  userProfile,
  logout,
} from '../controllers/user.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { cookieRefresher } from '../utils/features.js';
import rateLimiter from '../middlewares/rateLimiter.js';

const router = express.Router();

router.use(rateLimiter);

router.post('/register', createNewUser);
router.post('/login', userLogin);
router.get('/me', isAuthenticated, cookieRefresher, userProfile);
router.get('/logout', logout);

export default router;
