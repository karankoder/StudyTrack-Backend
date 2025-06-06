import express from 'express';
import {
  uploadChapters,
  getAllChapters,
  getChapterById,
  clearChapterCache,
} from '../controllers/chapter.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { cookieRefresher } from '../utils/features.js';
import rateLimiter from '../middlewares/rateLimiter.js';

const router = express.Router();

router.use(rateLimiter);

router
  .route('/')
  .post(isAuthenticated, cookieRefresher, upload.single('file'), uploadChapters)
  .get(isAuthenticated, cookieRefresher, getAllChapters);

router.route('/:id').get(isAuthenticated, cookieRefresher, getChapterById);
router.post('/clear-cache', isAuthenticated, clearChapterCache);

export default router;
