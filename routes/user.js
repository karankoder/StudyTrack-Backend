import express from 'express';
import {
  createNewUser,
  userLogin,
  userProfile,
  logout,
} from '../controllers/user.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { cookieRefresher } from '../utils/features.js';

const router = express.Router();

router.post('/register', createNewUser);
router.post('/login', userLogin);
router.get('/me', isAuthenticated, cookieRefresher, userProfile);
router.get('/logout', logout);

export default router;