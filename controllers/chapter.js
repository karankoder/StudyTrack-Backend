import ErrorHandler from '../middlewares/error.js';
import { Chapter } from '../models/chapter.js';

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

    res.status(200).json({
      success: true,

      page: pageNum,
      limit: limitNum,
      totalFiltered,
      totalAll,
      data: chapters,
    });
  } catch (error) {
    next(error);
  }
};

export const getChapterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id).lean();
    if (!chapter) {
      return next(new ErrorHandler('Chapter not found', 404));
    }
    res.status(200).json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};
