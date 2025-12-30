CREATE TABLE `bioRadarDiagnosis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`instagramHandle` varchar(255) NOT NULL,
	`bioAnalysis` text,
	`recommendations` text,
	`score` int,
	`leadEmail` varchar(320),
	`leadPhone` varchar(20),
	`convertedToUser` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bioRadarDiagnosis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brandEssence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`brandName` varchar(255) NOT NULL,
	`brandDescription` text,
	`targetAudience` text,
	`brandValues` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brandEssence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentGeneration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`metadata` text,
	`creditsUsed` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentGeneration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('free','pro','pro_plus') NOT NULL DEFAULT 'free',
	`status` enum('active','inactive','cancelled') NOT NULL DEFAULT 'active',
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`creditsRemaining` int NOT NULL DEFAULT 100,
	`monthlyCreditsLimit` int NOT NULL DEFAULT 100,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`renewalDate` timestamp,
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bioRadarDiagnosis` ADD CONSTRAINT `bioRadarDiagnosis_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `brandEssence` ADD CONSTRAINT `brandEssence_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contentGeneration` ADD CONSTRAINT `contentGeneration_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;