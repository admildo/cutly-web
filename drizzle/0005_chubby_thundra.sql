CREATE TABLE `trial_monthly_spend` (
	`month_key` text PRIMARY KEY NOT NULL,
	`reserved_micros` integer DEFAULT 0 NOT NULL,
	`spent_micros` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `trial_action_requests` ADD `month_key` text NOT NULL;--> statement-breakpoint
ALTER TABLE `trial_config` ADD `monthly_budget_micros` integer DEFAULT 10000000 NOT NULL;