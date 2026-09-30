CREATE TABLE `trial_accounts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `trial_accounts_status_idx` ON `trial_accounts` (`status`);
--> statement-breakpoint
CREATE TABLE `trial_device_claims` (
	`device_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `trial_device_claims_user_idx` ON `trial_device_claims` (`user_id`);
--> statement-breakpoint
CREATE TABLE `trial_usage_counts` (
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`used_count` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trial_usage_counts_user_action_idx` ON `trial_usage_counts` (`user_id`, `action`);
--> statement-breakpoint
CREATE INDEX `trial_usage_counts_user_idx` ON `trial_usage_counts` (`user_id`);
--> statement-breakpoint
CREATE TABLE `trial_action_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`request_id` text NOT NULL,
	`action` text NOT NULL,
	`status` text NOT NULL,
	`response_json` text,
	`error_message` text,
	`day_key` text NOT NULL,
	`reserved_micros` integer DEFAULT 0 NOT NULL,
	`input_tokens` integer DEFAULT 0 NOT NULL,
	`output_tokens` integer DEFAULT 0 NOT NULL,
	`cost_micros` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trial_action_requests_user_request_idx` ON `trial_action_requests` (`user_id`, `request_id`);
--> statement-breakpoint
CREATE INDEX `trial_action_requests_status_created_idx` ON `trial_action_requests` (`status`, `created_at`);
--> statement-breakpoint
CREATE INDEX `trial_action_requests_day_idx` ON `trial_action_requests` (`day_key`);
--> statement-breakpoint
CREATE TABLE `trial_daily_spend` (
	`day_key` text PRIMARY KEY NOT NULL,
	`reserved_micros` integer DEFAULT 0 NOT NULL,
	`spent_micros` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trial_config` (
	`id` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`clip_generations_max` integer DEFAULT 2 NOT NULL,
	`smart_clean_max` integer DEFAULT 1 NOT NULL,
	`caption_translations_max` integer DEFAULT 1 NOT NULL,
	`daily_budget_micros` integer DEFAULT 1000000 NOT NULL,
	`updated_by` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `trial_config` (`id`, `enabled`, `clip_generations_max`, `smart_clean_max`, `caption_translations_max`, `daily_budget_micros`)
VALUES ('global', 1, 2, 1, 1, 1000000);
