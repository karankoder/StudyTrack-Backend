import mongoose from 'mongoose';

export const connectDB = () => {
  const mongo_uri =
    process.env.NODE_ENV === 'development'
      ? process.env.LOCAL_MONGO_URI
      : process.env.MONGO_URI;
  mongoose
    .connect(mongo_uri, {
      dbName: 'StudyTrack',
    })
    .then((c) => {
      console.log(`Database Connected with ${c.connection.host}`);
    })
    .catch((err) => {
      console.log('Database Connection failed');
      console.log(err);
    });
};