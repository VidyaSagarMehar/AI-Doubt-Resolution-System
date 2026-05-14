import mongoose from "mongoose";

type GlobalWithMongoose = typeof globalThis & {
  mongooseCache?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

const globalWithMongoose = globalThis as GlobalWithMongoose;

const cache = globalWithMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalWithMongoose.mongooseCache = cache;

export async function connectToDatabase() {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(mongodbUri, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
