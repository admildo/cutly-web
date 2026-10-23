CREATE TABLE `trial_config_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`changed_by` text NOT NULL,
	`previous_json` text NOT NULL,
	`next_json` text NOT NULL,
	`changed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `trial_config_audit_changed_idx` ON `trial_config_audit` (`changed_at`);