import express from 'express';
import {
  uploadChapters,
  getAllChapters,
  getChapterById,
  clearChapterCache,
} from '../controllers/chapter.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router
  .route('/')
  .post(isAuthenticated, upload.single('file'), uploadChapters)
  .get(getAllChapters);

router.route('/:id').get(getChapterById);
router.post('/clear-cache', isAuthenticated, clearChapterCache);

export default router;
