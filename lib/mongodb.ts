import mongoose, { Mongoose } from 'mongoose';

/**
 * Global variable to cache the Mongoose connection.
 * In Next.js, during development, modules can be reloaded, which would create
 * multiple connections. This cache ensures we reuse the existing connection.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null } | undefined;
}

/**
 * Cached connection object to prevent multiple connections.
 * Uses a global variable that persists across hot reloads in development.
 */
const cached: { conn: Mongoose | null; promise: Promise<Mongoose> | null } = global.mongoose ?? {
  conn: null,
  promise: null,
};

// Assign to global in development to persist across hot reloads
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * MongoDB connection options for optimal performance and reliability.
 */
const mongooseOptions: mongoose.ConnectOptions = {
  bufferCommands: false, // Disable mongoose buffering
  maxPoolSize: 10, // Maximum number of connections in the connection pool
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server before timing out
  socketTimeoutMS: 45000, // How long a send or receive on a socket can take before timing out
};

/**
 * Establishes a connection to MongoDB using Mongoose.
 * 
 * This function implements connection caching to prevent multiple connections
 * during development hot-reloads. It reuses an existing connection if available,
 * or creates a new one if needed.
 * 
 * @returns {Promise<Mongoose>} A promise that resolves to the Mongoose instance
 * @throws {Error} If MONGODB_URI environment variable is not set
 * 
 * @example
 * ```typescript
 * import connectDB from '@/lib/mongodb';
 * 
 * async function myFunction() {
 *   await connectDB();
 *   // Now you can use mongoose models
 * }
 * ```
 */
async function connectDB(): Promise<Mongoose> {
  // Get MongoDB URI from environment variables
  const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

  // Validate that MONGODB_URI is set
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local or .env'
    );
  }

  // If we already have a cached connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If we don't have a connection promise yet, create one
  if (!cached.promise) {
    // Set connection options
    const opts: mongoose.ConnectOptions = {
      ...mongooseOptions,
      dbName: process.env.MONGODB_DB_NAME, // Optional: specify database name
    };

    // Create the connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance: Mongoose) => {
      // Connection successful
      console.log('✅ MongoDB connected successfully');
      return mongooseInstance;
    });
  }

  try {
    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;
  } catch (error) {
    // If connection fails, clear the promise so we can retry
    cached.promise = null;
    
    // Log error and rethrow
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }

  // Return the cached connection
  return cached.conn;
}

export default connectDB;
