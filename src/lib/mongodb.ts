import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

// Singleton cache — prevents multiple connections in Next.js dev (hot reload)
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const cache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      family: 4,
      maxPoolSize: 10,
      // Fail in 10s instead of the 30s default — e.g. when the free Atlas cluster is paused
      serverSelectionTimeoutMS: 10_000,
    }).catch((err) => {
      cache.promise = null; // let the next request retry instead of reusing a failed promise
      throw err;
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
