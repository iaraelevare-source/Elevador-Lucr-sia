import { getDb } from "../db";
import { logger } from "../_core/logger";

/**
 * Auto-migration script
 * Executes on server startup to ensure all tables exist
 */
export async function runMigrations() {
  const db = await getDb();
  
  if (!db) {
    logger.error("Database connection failed - cannot run migrations");
    return false;
  }

  try {
    logger.info("🔄 Starting database migrations...");

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
    logger.info("✅ Table 'users' ready");

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
    logger.info("✅ Table 'brandEssence' ready");

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
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes for contentGeneration
    await db.execute(`
      CREATE INDEX IF NOT EXISTS user_id_idx ON contentGeneration(userId)
    `).catch(() => {}); // Ignore if already exists
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS type_idx ON contentGeneration(type)
    `).catch(() => {});
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS user_type_idx ON contentGeneration(userId, type)
    `).catch(() => {});
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS created_at_idx ON contentGeneration(createdAt)
    `).catch(() => {});
    
    logger.info("✅ Table 'contentGeneration' ready");

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
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes for bioRadarDiagnosis
    await db.execute(`
      CREATE INDEX IF NOT EXISTS bioradar_user_id_idx ON bioRadarDiagnosis(userId)
    `).catch(() => {});
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS bioradar_created_at_idx ON bioRadarDiagnosis(createdAt)
    `).catch(() => {});
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS instagram_handle_idx ON bioRadarDiagnosis(instagramHandle)
    `).catch(() => {});
    
    logger.info("✅ Table 'bioRadarDiagnosis' ready");

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
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes for subscription
    await db.execute(`
      CREATE INDEX IF NOT EXISTS sub_user_id_idx ON subscription(userId)
    `).catch(() => {});
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS sub_status_idx ON subscription(status)
    `).catch(() => {});
    
    logger.info("✅ Table 'subscription' ready");

    // Create credits table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS credits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        amount INT DEFAULT 0 NOT NULL,
        lastReset TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create index for credits
    await db.execute(`
      CREATE INDEX IF NOT EXISTS credits_user_id_idx ON credits(userId)
    `).catch(() => {});
    
    logger.info("✅ Table 'credits' ready");

    logger.info("🎉 All database migrations completed successfully!");
    return true;
    
  } catch (error) {
    logger.error("❌ Migration failed:", error);
    return false;
  }
}
