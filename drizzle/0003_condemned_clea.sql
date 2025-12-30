CREATE INDEX `bioradar_user_id_idx` ON `bioRadarDiagnosis` (`userId`);--> statement-breakpoint
CREATE INDEX `bioradar_created_at_idx` ON `bioRadarDiagnosis` (`createdAt`);--> statement-breakpoint
CREATE INDEX `instagram_handle_idx` ON `bioRadarDiagnosis` (`instagramHandle`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `contentGeneration` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `contentGeneration` (`type`);--> statement-breakpoint
CREATE INDEX `user_type_idx` ON `contentGeneration` (`userId`,`type`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `contentGeneration` (`createdAt`);--> statement-breakpoint
CREATE INDEX `subscription_user_id_idx` ON `subscription` (`userId`);--> statement-breakpoint
CREATE INDEX `stripe_customer_idx` ON `subscription` (`stripeCustomerId`);--> statement-breakpoint
CREATE INDEX `stripe_subscription_idx` ON `subscription` (`stripeSubscriptionId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `subscription` (`status`);