CREATE TABLE `object_types` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `objects` (
	`id` text PRIMARY KEY NOT NULL,
	`object_type_id` text,
	`label` text NOT NULL,
	`is_confidential` integer DEFAULT false NOT NULL,
	`valid_from` text,
	`valid_to` text,
	FOREIGN KEY (`object_type_id`) REFERENCES `object_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `parameter_values` (
	`id` text PRIMARY KEY NOT NULL,
	`parameter_id` text NOT NULL,
	`target_type` text DEFAULT 'object' NOT NULL,
	`target_id` text NOT NULL,
	`value` text NOT NULL,
	`is_confidential` integer DEFAULT false NOT NULL,
	`valid_from` text,
	`valid_to` text,
	FOREIGN KEY (`parameter_id`) REFERENCES `parameters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `parameters` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`value_type_id` text,
	`unit_id` text,
	`valid_from` text,
	`valid_to` text,
	FOREIGN KEY (`value_type_id`) REFERENCES `value_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `relation_values` (
	`id` text PRIMARY KEY NOT NULL,
	`relation_id` text NOT NULL,
	`source_id` text NOT NULL,
	`target_id` text NOT NULL,
	`volgorde` text,
	`is_confidential` integer DEFAULT false NOT NULL,
	`valid_from` text,
	`valid_to` text,
	FOREIGN KEY (`relation_id`) REFERENCES `relations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `objects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_id`) REFERENCES `objects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `relations` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`symbol` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `value_types` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL
);
