CREATE TABLE `download_events` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`version` text NOT NULL,
	`country` text,
	`user_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `download_events_created_idx` ON `download_events` (`created_at`);
--> statement-breakpoint
CREATE INDEX `download_events_user_idx` ON `download_events` (`user_id`);
