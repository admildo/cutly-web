ALTER TABLE `creator_applications` ADD `credit_limit_cents` integer;
--> statement-breakpoint
ALTER TABLE `creator_applications` ADD `openrouter_key_hash` text;
--> statement-breakpoint
ALTER TABLE `creator_applications` ADD `openrouter_key_ciphertext` text;
