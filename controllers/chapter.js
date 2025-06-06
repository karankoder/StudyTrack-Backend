import ErrorHandler from '../middlewares/error.js';
import { Chapter } from '../models/chapter.js';
import redis from '../config/redis.js';
import {
  generateCacheKey,
  invalidateChapterCache,
} from '../utils/chapterCache.js';

export const uploadChapters = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new ErrorHandler('Only admin can upload chapters', 403));
    }

    if (!req.file) {
      return next(new ErrorHandler('No file uploaded', 400));
    }

    let chaptersData;
    try {
      const fileContent = req.file.buffer.toString('utf-8');
      chaptersData = JSON.parse(fileContent);
    } catch (err) {
      return next(new ErrorHandler('Invalid JSON file', 400));
    }

    if (!Array.isArray(chaptersData)) {
      return next(new ErrorHandler('JSON must be an array of chapters', 400));
    }

    const failedChapters = [];
    const insertedChapters = [];

    for (const chapterObj of chaptersData) {
      try {
        const chapter = new Chapter(chapterObj);
        await chapter.validate();
        await chapter.save();
        insertedChapters.push(chapter);
      } catch (err) {
        failedChapters.push({
          chapter: chapterObj,
          error: err.message,
        });
      }
    }

    if (insertedChapters.length > 0) {
      await invalidateChapterCache();
    }

    res.status(201).json({
      success: true,
      message: 'Chapters uploaded',
      insertedCount: insertedChapters.length,
      failedCount: failedChapters.length,
      failedChapters,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllChapters = async (req, res, next) => {
  try {
    const {
      class: className,
      unit,
      status,
      weakChapters,
      subject,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Number.parseInt(limit, 10) || 10);

    const cacheKey = generateCacheKey(req.query);

    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log('Cache hit for:', cacheKey);
        return res.status(200).json(JSON.parse(cachedData));
      }
      console.log('Cache miss for:', cacheKey);
    } catch (cacheError) {
      console.error('Redis cache error:', cacheError);
    }

    const filter = {};

    if (className) filter.class = className;
    if (unit) filter.unit = unit;
    if (status) filter.status = status;
    if (subject) filter.subject = subject;
    if (weakChapters !== undefined) {
      filter.isWeakChapter = weakChapters === 'true';
    }

    const [totalFiltered, totalAll, chapters] = await Promise.all([
      Chapter.countDocuments(filter),
      Chapter.estimatedDocumentCount(),
      Chapter.find(filter)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
    ]);

    const responseData = {
      success: true,
      page: pageNum,
      limit: limitNum,
      totalFiltered,
      totalAll,
      data: chapters,
    };

    try {
      await redis.setex(cacheKey, 3600, JSON.stringify(responseData));
      console.log('Data cached for:', cacheKey);
    } catch (cacheError) {
      console.error('Error caching data:', cacheError);
    }

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

export const getChapterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cacheKey = `chapter:${id}`;

    try {
      const cachedChapter = await redis.get(cacheKey);
      if (cachedChapter) {
        console.log('Cache hit for chapter:', id);
        return res.status(200).json(JSON.parse(cachedChapter));
      }
      console.log('Cache miss for chapter:', id);
    } catch (cacheError) {
      console.error('Redis cache error:', cacheError);
    }

    const chapter = await Chapter.findById(id).lean();
    if (!chapter) {
      return next(new ErrorHandler('Chapter not found', 404));
    }

    const responseData = {
      success: true,
      data: chapter,
    };

    try {
      await redis.setex(cacheKey, 3600, JSON.stringify(responseData));
      console.log('Chapter cached:', id);
    } catch (cacheError) {
      console.error('Error caching chapter:', cacheError);
    }

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

export const clearChapterCache = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new ErrorHandler('Only admin can clear cache', 403));
    }

    await invalidateChapterCache();

    res.status(200).json({
      success: true,
      message: 'Chapter cache cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};
