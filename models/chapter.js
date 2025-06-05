import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    chapter: {
      type: String,
      required: true,
      trim: true,
    },
    class: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    yearWiseQuestionCount: {
      type: Map,
      of: Number,
      required: true,
    },
    questionSolved: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['Not Started', 'In Progress', 'Completed'],
    },
    isWeakChapter: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export const Chapter = mongoose.model('Chapter', chapterSchema);
