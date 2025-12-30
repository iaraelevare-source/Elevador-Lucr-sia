CREATE TABLE `agendamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`leadId` int,
	`clienteNome` varchar(255) NOT NULL,
	`procedimento` varchar(255) NOT NULL,
	`valor` int NOT NULL,
	`data` varchar(10) NOT NULL,
	`horario` varchar(5) NOT NULL,
	`status` enum('confirmado','pendente','realizado','cancelado','remarcado') NOT NULL DEFAULT 'pendente',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agendamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendarioPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int,
	`titulo` varchar(255) NOT NULL,
	`tipo` enum('autoridade','desejo','fechamento','conexao') NOT NULL DEFAULT 'conexao',
	`plataforma` varchar(50) NOT NULL DEFAULT 'instagram',
	`dataAgendada` varchar(10) NOT NULL,
	`horario` varchar(5) NOT NULL DEFAULT '19:00',
	`legenda` text,
	`hashtags` text,
	`status` enum('pendente','publicado','cancelado') NOT NULL DEFAULT 'pendente',
	`engajamento` text,
	`publicadoEm` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendarioPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`telefone` varchar(20),
	`procedimento` varchar(255),
	`origem` varchar(100),
	`temperatura` enum('frio','morno','quente') NOT NULL DEFAULT 'frio',
	`status` enum('novo','contatado','agendado','convertido','perdido') NOT NULL DEFAULT 'novo',
	`valorEstimado` int,
	`observacoes` text,
	`ultimoContato` timestamp,
	`proximoContato` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_leadId_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendarioPosts` ADD CONSTRAINT `calendarioPosts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendarioPosts` ADD CONSTRAINT `calendarioPosts_contentId_contentGeneration_id_fk` FOREIGN KEY (`contentId`) REFERENCES `contentGeneration`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `agendamentos_user_id_idx` ON `agendamentos` (`userId`);--> statement-breakpoint
CREATE INDEX `agendamentos_lead_id_idx` ON `agendamentos` (`leadId`);--> statement-breakpoint
CREATE INDEX `agendamentos_data_idx` ON `agendamentos` (`data`);--> statement-breakpoint
CREATE INDEX `agendamentos_status_idx` ON `agendamentos` (`status`);--> statement-breakpoint
CREATE INDEX `calendario_user_id_idx` ON `calendarioPosts` (`userId`);--> statement-breakpoint
CREATE INDEX `calendario_data_idx` ON `calendarioPosts` (`dataAgendada`);--> statement-breakpoint
CREATE INDEX `calendario_status_idx` ON `calendarioPosts` (`status`);--> statement-breakpoint
CREATE INDEX `calendario_tipo_idx` ON `calendarioPosts` (`tipo`);--> statement-breakpoint
CREATE INDEX `leads_user_id_idx` ON `leads` (`userId`);--> statement-breakpoint
CREATE INDEX `leads_status_idx` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX `leads_temperatura_idx` ON `leads` (`temperatura`);