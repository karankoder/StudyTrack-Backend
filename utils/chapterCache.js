import redis from '../config/redis.js';

export const generateCacheKey = (queryParams) => {
  const {
    class: className,
    unit,
    status,
    weakChapters,
    subject,
    page,
    limit,
  } = queryParams;
  const keyParts = ['chapters'];

  if (className) keyParts.push(`class:${className}`);
  if (unit) keyParts.push(`unit:${unit}`);
  if (status) keyParts.push(`status:${status}`);
  if (subject) keyParts.push(`subject:${subject}`);
  if (weakChapters !== undefined) keyParts.push(`weak:${weakChapters}`);
  keyParts.push(`page:${page || 1}`);
  keyParts.push(`limit:${limit || 10}`);

  return keyParts.join(':');
};

export const invalidateChapterCache = async () => {
  try {
    const keys = await redis.keys('chapters:*');
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`Invalidated ${keys.length} chapter cache keys`);
    }
  } catch (error) {
    console.error('Error invalidating chapter cache:', error);
  }
};
