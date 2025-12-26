import mongoose, { Connection, ConnectOptions, Mongoose } from 'mongoose';

/**
 * Strongly-typed shape of the cached Mongoose connection stored on `global`.
 */
interface GlobalMongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Augment the Node.js global type so we can attach a cache for the Mongoose
 * connection. This avoids creating multiple connections during Next.js
 * development with hot reloading.
 */
declare global {
  // `var` is required when augmenting the Node.js global object
  // eslint-disable-next-line no-var
  var _mongoose: GlobalMongooseCache | undefined;
}

// Read the MongoDB connection string from environment variables.
// This should be set in `.env.local` or the deployment environment.
const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined.');
}

// Initialize the cache on the global object (primarily for development).
// In production, this will effectively behave like a singleton as well.
let cached: GlobalMongooseCache = global._mongoose ?? { conn: null, promise: null };

if (!global._mongoose) {
  global._mongoose = cached;
}

/**
 * Public return type for callers that need both the Mongoose instance and
 * the underlying native connection.
 */
export interface DbConnection {
  mongoose: Mongoose;
  connection: Connection;
}

/**
 * Establishes (or reuses) a Mongoose connection to MongoDB.
 *
 * - Uses a global cache to prevent creating multiple connections in
 *   development when files are reloaded by Next.js.
 * - Throws immediately if the `MONGODB_URI` env variable is missing.
 */
export async function connectToDatabase(): Promise<DbConnection> {
  // If a connection already exists, reuse it.
  if (cached.conn) {
    return { mongoose: cached.conn, connection: cached.conn.connection };
  }

  // If no connection promise exists yet, create one and store it in the cache.
  if (!cached.promise) {
    const options: ConnectOptions = {
      // Customize connection options here if needed, for example:
      // maxPoolSize: 10,
      // serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongooseInstance: Mongoose) => {
      return mongooseInstance;
    });
  }

  try {
    const mongooseInstance: Mongoose = await cached.promise;
    cached.conn = mongooseInstance;

    return { mongoose: mongooseInstance, connection: mongooseInstance.connection };
  } catch (error) {
    // If the connection fails, reset the cached promise so future calls can retry.
    cached.promise = null;
    throw error;
  }
}
