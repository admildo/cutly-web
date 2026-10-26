CREATE TABLE `download_counts` (
	`day` text NOT NULL,
	`platform` text NOT NULL,
	`version` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `download_counts_day_platform_version_idx` ON `download_counts` (`day`,`platform`,`version`);
