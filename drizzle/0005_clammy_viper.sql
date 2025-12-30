CREATE TABLE `diagnosticos` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diagnosticos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`diagnosticoId` int,
	`rating` int NOT NULL,
	`comment` text,
	`trialActivated` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `freeTrials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activationMethod` varchar(50) NOT NULL,
	`activatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	CONSTRAINT `freeTrials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `googleReviewIntents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`diagnosticoId` int,
	`clickedAt` timestamp NOT NULL DEFAULT (now()),
	`trialActivated` int NOT NULL DEFAULT 0,
	CONSTRAINT `googleReviewIntents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredEmail` varchar(320),
	`referredUserId` int,
	`referralCode` varchar(64) NOT NULL,
	`clicked` int NOT NULL DEFAULT 0,
	`converted` int NOT NULL DEFAULT 0,
	`shareMethod` varchar(50),
	`trialActivated` int NOT NULL DEFAULT 0,
	`clickedAt` timestamp,
	`convertedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
ALTER TABLE `subscription` MODIFY COLUMN `plan` enum('free','essencial','profissional') NOT NULL DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorEnabled` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorSecret` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorBackupCodes` text;--> statement-breakpoint
ALTER TABLE `diagnosticos` ADD CONSTRAINT `diagnosticos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `diagnosticos` ADD CONSTRAINT `diagnosticos_referredBy_users_id_fk` FOREIGN KEY (`referredBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_diagnosticoId_diagnosticos_id_fk` FOREIGN KEY (`diagnosticoId`) REFERENCES `diagnosticos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `freeTrials` ADD CONSTRAINT `freeTrials_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `googleReviewIntents` ADD CONSTRAINT `googleReviewIntents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `googleReviewIntents` ADD CONSTRAINT `googleReviewIntents_diagnosticoId_diagnosticos_id_fk` FOREIGN KEY (`diagnosticoId`) REFERENCES `diagnosticos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrerId_users_id_fk` FOREIGN KEY (`referrerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referredUserId_users_id_fk` FOREIGN KEY (`referredUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `diagnosticos_user_id_idx` ON `diagnosticos` (`userId`);--> statement-breakpoint
CREATE INDEX `diagnosticos_visitor_id_idx` ON `diagnosticos` (`visitorId`);--> statement-breakpoint
CREATE INDEX `diagnosticos_referral_code_idx` ON `diagnosticos` (`referralCode`);--> statement-breakpoint
CREATE INDEX `feedback_user_id_idx` ON `feedback` (`userId`);--> statement-breakpoint
CREATE INDEX `feedback_diagnostico_id_idx` ON `feedback` (`diagnosticoId`);--> statement-breakpoint
CREATE INDEX `free_trials_user_id_idx` ON `freeTrials` (`userId`);--> statement-breakpoint
CREATE INDEX `free_trials_expires_idx` ON `freeTrials` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `google_review_user_id_idx` ON `googleReviewIntents` (`userId`);--> statement-breakpoint
CREATE INDEX `referrals_referrer_id_idx` ON `referrals` (`referrerId`);--> statement-breakpoint
CREATE INDEX `referrals_code_idx` ON `referrals` (`referralCode`);