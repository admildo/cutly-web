CREATE TABLE `creator_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`profile_url` text NOT NULL,
	`platforms_json` text NOT NULL,
	`audience` text NOT NULL,
	`plan` text NOT NULL,
	`decision_note` text,
	`decided_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `creator_applications_user_idx` ON `creator_applications` (`user_id`);
--> statement-breakpoint
CREATE INDEX `creator_applications_status_idx` ON `creator_applications` (`status`,`created_at`);
