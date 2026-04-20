import mongoose from "mongoose";

// In serverless environments each function invocation may reuse an existing
// Node.js process. Caching the connection on `global` avoids reconnecting on
// every request.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri).then((m) => m);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
