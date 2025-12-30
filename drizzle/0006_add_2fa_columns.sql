-- Add Two-Factor Authentication columns to users table
ALTER TABLE `users` ADD COLUMN `twoFactorEnabled` INT DEFAULT 0;
ALTER TABLE `users` ADD COLUMN `twoFactorSecret` VARCHAR(255);
ALTER TABLE `users` ADD COLUMN `twoFactorBackupCodes` TEXT;
