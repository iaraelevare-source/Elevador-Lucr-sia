-- ============================================
-- 🎯 GAMIFICAÇÃO - SISTEMA DE TRIAL & REFERRAL
-- Migration: 0005_gamification_system.sql
-- ============================================

-- 📊 DIAGNOSTICOS COMPLETOS
CREATE TABLE IF NOT EXISTS `diagnosticos` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int,
  `visitorId` varchar(64),
  `visitorEmail` varchar(320),
  `visitorNome` varchar(255),
  `bioAnalysis` text,
  `conscienciaAnalysis` text,
  `financeiroAnalysis` text,
  `bioScore` int,
  `conscienciaScore` int,
  `financeiroScore` int,
  `bioNivel` varchar(50),
  `conscienciaNivel` varchar(50),
  `financeiroNivel` varchar(50),
  `planoCorrecao` text,
  `referredBy` int,
  `referralCode` varchar(64),
  `completedAt` timestamp,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `diagnosticos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `diagnosticos_referredBy_users_id_fk` FOREIGN KEY (`referredBy`) REFERENCES `users`(`id`)
);

CREATE INDEX `diagnosticos_user_id_idx` ON `diagnosticos` (`userId`);
CREATE INDEX `diagnosticos_visitor_id_idx` ON `diagnosticos` (`visitorId`);
CREATE INDEX `diagnosticos_referral_code_idx` ON `diagnosticos` (`referralCode`);

-- ⭐ FEEDBACK - Avaliações internas
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int,
  `diagnosticoId` int,
  `rating` int NOT NULL,
  `comment` text,
  `trialActivated` int DEFAULT 0 NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `feedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `feedback_diagnosticoId_diagnosticos_id_fk` FOREIGN KEY (`diagnosticoId`) REFERENCES `diagnosticos`(`id`) ON DELETE CASCADE
);

CREATE INDEX `feedback_user_id_idx` ON `feedback` (`userId`);
CREATE INDEX `feedback_diagnostico_id_idx` ON `feedback` (`diagnosticoId`);

-- 🔗 REFERRALS - Sistema de indicação
CREATE TABLE IF NOT EXISTS `referrals` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `referrerId` int NOT NULL,
  `referredEmail` varchar(320),
  `referredUserId` int,
  `referralCode` varchar(64) NOT NULL UNIQUE,
  `clicked` int DEFAULT 0 NOT NULL,
  `converted` int DEFAULT 0 NOT NULL,
  `shareMethod` varchar(50),
  `trialActivated` int DEFAULT 0 NOT NULL,
  `clickedAt` timestamp,
  `convertedAt` timestamp,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `referrals_referrerId_users_id_fk` FOREIGN KEY (`referrerId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `referrals_referredUserId_users_id_fk` FOREIGN KEY (`referredUserId`) REFERENCES `users`(`id`)
);

CREATE INDEX `referrals_referrer_id_idx` ON `referrals` (`referrerId`);
CREATE INDEX `referrals_code_idx` ON `referrals` (`referralCode`);

-- 🌟 GOOGLE REVIEW INTENTS
CREATE TABLE IF NOT EXISTS `googleReviewIntents` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int,
  `diagnosticoId` int,
  `clickedAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `trialActivated` int DEFAULT 0 NOT NULL,
  CONSTRAINT `googleReviewIntents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `googleReviewIntents_diagnosticoId_diagnosticos_id_fk` FOREIGN KEY (`diagnosticoId`) REFERENCES `diagnosticos`(`id`) ON DELETE CASCADE
);

CREATE INDEX `google_review_user_id_idx` ON `googleReviewIntents` (`userId`);

-- 🎁 FREE TRIALS - Controle de trials
CREATE TABLE IF NOT EXISTS `freeTrials` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `activationMethod` varchar(50) NOT NULL,
  `activatedAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `expiresAt` timestamp NOT NULL,
  `isActive` int DEFAULT 1 NOT NULL,
  CONSTRAINT `freeTrials_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE INDEX `free_trials_user_id_idx` ON `freeTrials` (`userId`);
CREATE INDEX `free_trials_expires_idx` ON `freeTrials` (`expiresAt`);
