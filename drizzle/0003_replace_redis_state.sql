CREATE TABLE `desktop_auth_grants` (
	`jti` text PRIMARY KEY NOT NULL,
	`expires_at` text NOT NULL,
	`consumed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `desktop_auth_grants_expiry_idx` ON `desktop_auth_grants` (`expires_at`);
--> statement-breakpoint
CREATE TABLE `desktop_sessions` (
	`jti` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `desktop_sessions_expiry_idx` ON `desktop_sessions` (`expires_at`);
--> statement-breakpoint
CREATE TABLE `rate_limit_buckets` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limit_buckets_expiry_idx` ON `rate_limit_buckets` (`expires_at`);
