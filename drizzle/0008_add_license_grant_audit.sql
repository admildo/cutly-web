CREATE TABLE `license_grant_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`changed_by` text NOT NULL,
	`target_user_id` text NOT NULL,
	`license_id` text NOT NULL,
	`reason` text NOT NULL,
	`details_json` text NOT NULL,
	`changed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `license_grant_audit_changed_idx` ON `license_grant_audit` (`changed_at`);
--> statement-breakpoint
CREATE INDEX `license_grant_audit_target_idx` ON `license_grant_audit` (`target_user_id`);
