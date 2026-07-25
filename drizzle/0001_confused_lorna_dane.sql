PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_relation_values` (
	`id` text PRIMARY KEY NOT NULL,
	`relation_id` text NOT NULL,
	`source_id` text NOT NULL,
	`target_id` text NOT NULL,
	`volgorde` text,
	`is_confidential` integer DEFAULT false NOT NULL,
	`valid_from` text,
	`valid_to` text,
	FOREIGN KEY (`relation_id`) REFERENCES `relations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_relation_values`("id", "relation_id", "source_id", "target_id", "volgorde", "is_confidential", "valid_from", "valid_to") SELECT "id", "relation_id", "source_id", "target_id", "volgorde", "is_confidential", "valid_from", "valid_to" FROM `relation_values`;--> statement-breakpoint
DROP TABLE `relation_values`;--> statement-breakpoint
ALTER TABLE `__new_relation_values` RENAME TO `relation_values`;--> statement-breakpoint
PRAGMA foreign_keys=ON;