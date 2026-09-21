CREATE TABLE `devices` (
	`id` text PRIMARY KEY NOT NULL,
	`license_id` text NOT NULL,
	`device_hash` text NOT NULL,
	`platform` text,
	`app_version` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deactivated_at` text,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `devices_license_hash_idx` ON `devices` (`license_id`,`device_hash`);--> statement-breakpoint
CREATE INDEX `devices_active_license_idx` ON `devices` (`license_id`,`deactivated_at`);--> statement-breakpoint
CREATE TABLE `licenses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`plan_name` text NOT NULL,
	`device_limit` integer DEFAULT 2 NOT NULL,
	`expires_at` text,
	`payment_provider` text,
	`provider_customer_id` text,
	`provider_transaction_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `licenses_active_user_idx` ON `licenses` (`user_id`,`status`,`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `licenses_provider_transaction_idx` ON `licenses` (`provider_transaction_id`);--> statement-breakpoint
CREATE TABLE `payment_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`provider_event_id` text NOT NULL,
	`event_type` text NOT NULL,
	`received_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_events_provider_event_idx` ON `payment_events` (`provider`,`provider_event_id`);
