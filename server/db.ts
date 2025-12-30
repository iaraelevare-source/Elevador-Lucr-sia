import { eq } from "drizzle-orm";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { logger } from './_core/logger';

let _db: any | null = null;
let _dbType: 'mysql' | 'sqlite' | null = null;

// Lazily create the drizzle instance with fallback to SQLite
export async function getDb() {
  if (_db) return _db;

  // Try MySQL first
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql://')) {
    try {
      logger.info("🔄 Attempting MySQL connection...");
      console.log("[DB] Trying MySQL connection...");
      
      _db = drizzleMysql(process.env.DATABASE_URL);
      _dbType = 'mysql';
      
      // Test connection
      await _db.execute('SELECT 1');
      
      logger.info("✅ MySQL connected successfully");
      console.log("[DB] ✅ MySQL connected");
      return _db;
    } catch (error: any) {
      logger.error("❌ MySQL connection failed", { 
        error: error.message,
        code: error.code,
        errno: error.errno 
      });
      console.error("[DB] ❌ MySQL failed:", error.message);
      _db = null;
      _dbType = null;
    }
  }

  // Fallback to SQLite
  try {
    logger.info("🔄 Falling back to SQLite...");
    console.log("[DB] Using SQLite fallback...");
    
    const sqlite = new Database('./data/app.db');
    sqlite.pragma('journal_mode = WAL');
    
    _db = drizzleSqlite(sqlite);
    _dbType = 'sqlite';
    
    logger.info("✅ SQLite connected successfully");
    console.log("[DB] ✅ SQLite connected");
    return _db;
  } catch (error: any) {
    logger.error("❌ SQLite connection failed", { error: error.message });
    console.error("[DB] ❌ SQLite failed:", error.message);
    _db = null;
    _dbType = null;
  }

  return _db;
}

// Get database type
export function getDbType(): 'mysql' | 'sqlite' | null {
  return _dbType;
}

// Lazy synchronous db instance for routers
export function getDbSync() {
  if (_db) return _db;

  // Try MySQL first
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql://')) {
    try {
      console.log("[DB] Sync: Trying MySQL...");
      _db = drizzleMysql(process.env.DATABASE_URL);
      _dbType = 'mysql';
      console.log("[DB] Sync: MySQL connected");
      return _db;
    } catch (error: any) {
      console.error("[DB] Sync: MySQL failed:", error.message);
      _db = null;
      _dbType = null;
    }
  }

  // Fallback to SQLite
  try {
    console.log("[DB] Sync: Using SQLite fallback...");
    const sqlite = new Database('./data/app.db');
    sqlite.pragma('journal_mode = WAL');
    _db = drizzleSqlite(sqlite);
    _dbType = 'sqlite';
    console.log("[DB] Sync: SQLite connected");
    return _db;
  } catch (error: any) {
    console.error("[DB] Sync: SQLite failed:", error.message);
    _db = null;
    _dbType = null;
  }

  return _db;
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

    const dbType = getDbType();
    if (dbType === 'mysql') {
      await db.insert(users).values(values).onDuplicateKeyUpdate({
        set: updateSet,
      });
    } else {
      // SQLite: use INSERT OR REPLACE
      const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
      if (existing.length > 0) {
        await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
      } else {
        await db.insert(users).values(values);
      }
    }
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
