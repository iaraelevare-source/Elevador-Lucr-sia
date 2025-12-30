import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { logger } from './_core/logger';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

/**
 * Get database connection with proper MySQL2 pool
 * This fixes the "Identifier name too long" error
 */
export async function getDb() {
  if (_db) return _db;

  if (!process.env.DATABASE_URL) {
    logger.warn("DATABASE_URL not set, database unavailable");
    console.log("[DB] ⚠️ DATABASE_URL not set");
    return null;
  }

  try {
    logger.info("🔄 Creating MySQL connection pool...");
    console.log("[DB] 🔄 Creating MySQL pool...");
    
    // Create MySQL2 pool with proper configuration
    _pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
    
    // Test connection
    const connection = await _pool.getConnection();
    await connection.ping();
    connection.release();
    
    // Create Drizzle instance with pool
    _db = drizzle(_pool);
    
    logger.info("✅ MySQL pool created and tested successfully");
    console.log("[DB] ✅ MySQL connected via pool");
    return _db;
    
  } catch (error: any) {
    logger.error("❌ MySQL connection failed", { 
      error: error.message,
      code: error.code,
      errno: error.errno 
    });
    console.error("[DB] ❌ MySQL failed:", error.message);
    
    // Clean up on error
    if (_pool) {
      await _pool.end().catch(() => {});
      _pool = null;
    }
    _db = null;
    return null;
  }
}

/**
 * Synchronous database getter (for routers)
 * Returns null if not yet initialized
 */
export function getDbSync() {
  return _db;
}

/**
 * Close database connection pool
 */
export async function closeDb() {
  if (_pool) {
    logger.info("Closing MySQL pool...");
    await _pool.end();
    _pool = null;
    _db = null;
  }
}

// Deprecated: Use getDb() or getDbSync() instead
export const db = null as any;

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    logger.warn("Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    logger.error("Failed to upsert user", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    logger.warn("Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.
