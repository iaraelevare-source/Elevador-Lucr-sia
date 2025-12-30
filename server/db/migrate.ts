import { getDb } from "../db";
import { logger } from "../_core/logger";

/**
 * Auto-migration script for MySQL
 * Executes on server startup to ensure all tables exist
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

    // Create brandEssence table
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

    // Create contentGeneration table
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

    // Create bioRadarDiagnosis table
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

    // Create subscription table
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

    // Create credits table
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

    logger.info("🎉 All database migrations completed successfully!");
    console.log("[Migration] 🎉 Completed successfully!");
    return true;
    
  } catch (error: any) {
    logger.error("❌ Migration failed:", { 
      message: error.message,
      code: error.code,
      errno: error.errno,
      sql: error.sql,
      stack: error.stack 
    });
    console.error("[Migration] ❌ Failed:", error.message);
    if (error.sql) {
      console.error("[Migration] SQL:", error.sql);
    }
    return false;
  }
}
