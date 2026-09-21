CREATE TABLE `users` (
	`clerk_id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_login_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `users_deleted_idx` ON `users` (`deleted_at`);
--> statement-breakpoint
INSERT OR IGNORE INTO `users` (`clerk_id`, `last_login_at`)
VALUES ('user_3J8698e9lr93z4rWuRWEOR183dL', CURRENT_TIMESTAMP);
--> statement-breakpoint
INSERT OR IGNORE INTO `licenses`
	(`id`, `user_id`, `type`, `status`, `plan_name`, `device_limit`, `payment_provider`)
VALUES
	('license_seed_user_3J8698e9lr93z4rWuRWEOR183dL', 'user_3J8698e9lr93z4rWuRWEOR183dL', 'lifetime', 'active', 'Lifetime', 2, 'seed');
