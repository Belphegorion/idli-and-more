import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless function invocations in Vercel.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

const DEFAULT_ATLAS_URI = 'mongodb+srv://Vercel-Admin-atlas-bole-candle:a40i7Bz1r66uSegK@atlas-bole-candle.xohkesq.mongodb.net/idliandmore?retryWrites=true&w=majority';

export async function connectToDatabase(): Promise<typeof mongoose> {
  let uri = (process.env.MONGODB_URI || DEFAULT_ATLAS_URI).trim();

  // Strip quotes if env var was saved with surrounding quotes
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }

  // If URI has no explicit database path, inject idliandmore
  if (uri.includes('.mongodb.net/?') || uri.endsWith('.mongodb.net/')) {
    uri = uri.replace('.mongodb.net/', '.mongodb.net/idliandmore');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      dbName: 'idliandmore',
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
