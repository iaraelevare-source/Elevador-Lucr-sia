import { getDb, getDbType } from "../db";
import { logger } from "../_core/logger";

/**
 * Auto-migration script
 * Executes on server startup to ensure all tables exist
 * Supports both MySQL and SQLite
 */
export async function runMigrations() {
  try {
    logger.info("🔄 Starting database migrations...");
    console.log("[Migration] 🔄 Starting...");

    const db = await getDb();
    
    if (!db) {
      logger.error("❌ Database connection failed - cannot run migrations");
      console.error("[Migration] ❌ No database connection");
      return false;
    }

    const dbType = getDbType();
    logger.info(`📊 Database type: ${dbType}`);
    console.log(`[Migration] 📊 Using ${dbType}`);

    if (dbType === 'mysql') {
      await runMySQLMigrations(db);
    } else if (dbType === 'sqlite') {
      await runSQLiteMigrations(db);
    } else {
      logger.error("❌ Unknown database type");
      return false;
    }

    logger.info("🎉 All database migrations completed successfully!");
    console.log("[Migration] 🎉 Completed successfully!");
    return true;
    
  } catch (error: any) {
    logger.error("❌ Migration failed:", { 
      message: error.message,
      code: error.code,
      errno: error.errno,
      stack: error.stack 
    });
    console.error("[Migration] ❌ Failed:", error.message);
    return false;
  }
}

async function runMySQLMigrations(db: any) {
  console.log("[Migration] Running MySQL migrations...");

  // Create users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      openId VARCHAR(64) UNIQUE,
      passwordHash VARCHAR(255),
      name TEXT,
      email VARCHAR(320) UNIQUE,
      loginMethod VARCHAR(64),
      role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
      twoFactorEnabled INT DEFAULT 0,
      twoFactorSecret VARCHAR(255),
      twoFactorBackupCodes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);
  console.log("[Migration] ✅ Table 'users' ready");

  // Create other tables...
  await db.execute(`
    CREATE TABLE IF NOT EXISTS brandEssence (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      brandName VARCHAR(255) NOT NULL,
      brandDescription TEXT,
      targetAudience TEXT,
      brandValues TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("[Migration] ✅ Table 'brandEssence' ready");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS contentGeneration (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      metadata TEXT,
      creditsUsed INT DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX user_id_idx (userId),
      INDEX type_idx (type),
      INDEX created_at_idx (createdAt)
    )
  `);
  console.log("[Migration] ✅ Table 'contentGeneration' ready");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS bioRadarDiagnosis (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      instagramHandle VARCHAR(255) NOT NULL,
      bioAnalysis TEXT,
      recommendations TEXT,
      score INT,
      leadEmail VARCHAR(320),
      leadPhone VARCHAR(20),
      leadWhatsapp VARCHAR(20),
      convertedToUser INT DEFAULT 0 NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX bioradar_user_id_idx (userId),
      INDEX instagram_handle_idx (instagramHandle)
    )
  `);
  console.log("[Migration] ✅ Table 'bioRadarDiagnosis' ready");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS subscription (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      plan VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'inactive' NOT NULL,
      stripeCustomerId VARCHAR(255),
      stripeSubscriptionId VARCHAR(255),
      currentPeriodEnd TIMESTAMP,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX sub_user_id_idx (userId)
    )
  `);
  console.log("[Migration] ✅ Table 'subscription' ready");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS credits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      amount INT DEFAULT 0 NOT NULL,
      lastReset TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX credits_user_id_idx (userId)
    )
  `);
  console.log("[Migration] ✅ Table 'credits' ready");
}

async function runSQLiteMigrations(db: any) {
  console.log("[Migration] Running SQLite migrations...");

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openId TEXT UNIQUE,
      passwordHash TEXT,
      name TEXT,
      email TEXT UNIQUE,
      loginMethod TEXT,
      role TEXT DEFAULT 'user' NOT NULL,
      twoFactorEnabled INTEGER DEFAULT 0,
      twoFactorSecret TEXT,
      twoFactorBackupCodes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      lastSignedIn TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);
  console.log("[Migration] ✅ Table 'users' ready");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS brandEssence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      brandName TEXT NOT NULL,
      brandDescription TEXT,
      targetAudience TEXT,
      brandValues TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("[Migration] ✅ Table 'brandEssence' ready");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS contentGeneration (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      metadata TEXT,
      creditsUsed INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  await db.exec(`CREATE INDEX IF NOT EXISTS user_id_idx ON contentGeneration(userId)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS type_idx ON contentGeneration(type)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS created_at_idx ON contentGeneration(createdAt)`);
  console.log("[Migration] ✅ Table 'contentGeneration' ready");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS bioRadarDiagnosis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      instagramHandle TEXT NOT NULL,
      bioAnalysis TEXT,
      recommendations TEXT,
      score INTEGER,
      leadEmail TEXT,
      leadPhone TEXT,
      leadWhatsapp TEXT,
      convertedToUser INTEGER DEFAULT 0 NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  await db.exec(`CREATE INDEX IF NOT EXISTS bioradar_user_id_idx ON bioRadarDiagnosis(userId)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS instagram_handle_idx ON bioRadarDiagnosis(instagramHandle)`);
  console.log("[Migration] ✅ Table 'bioRadarDiagnosis' ready");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS subscription (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      plan TEXT NOT NULL,
      status TEXT DEFAULT 'inactive' NOT NULL,
      stripeCustomerId TEXT,
      stripeSubscriptionId TEXT,
      currentPeriodEnd TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  await db.exec(`CREATE INDEX IF NOT EXISTS sub_user_id_idx ON subscription(userId)`);
  console.log("[Migration] ✅ Table 'subscription' ready");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS credits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      amount INTEGER DEFAULT 0 NOT NULL,
      lastReset TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  await db.exec(`CREATE INDEX IF NOT EXISTS credits_user_id_idx ON credits(userId)`);
  console.log("[Migration] ✅ Table 'credits' ready");
}
