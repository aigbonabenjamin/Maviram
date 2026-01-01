CREATE TABLE `delivery_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`driver_id` integer,
	`seller_id` integer NOT NULL,
	`pickup_address` text NOT NULL,
	`delivery_address` text NOT NULL,
	`pickup_contact` text NOT NULL,
	`delivery_contact` text NOT NULL,
	`product_details` text NOT NULL,
	`status` text DEFAULT 'assigned' NOT NULL,
	`pickup_verification_photos` text,
	`pickup_qr_code` text,
	`pickup_timestamp` text,
	`delivery_timestamp` text,
	`assigned_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`order_id` integer,
	`notification_type` text NOT NULL,
	`message` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`sent_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`seller_id` integer NOT NULL,
	`product_name` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_per_unit` real NOT NULL,
	`total_price` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`unique_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_number` text NOT NULL,
	`buyer_id` integer NOT NULL,
	`total_amount` real NOT NULL,
	`delivery_address` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`delivery_option` text,
	`buyer_notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`seller_id` integer NOT NULL,
	`product_name` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_per_unit` real NOT NULL,
	`list_number` integer,
	`status` text DEFAULT 'available' NOT NULL,
	`photos` text,
	`videos` text,
	`verified_by_driver_id` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`verified_by_driver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `proof_of_delivery` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`delivery_task_id` integer NOT NULL,
	`order_id` integer NOT NULL,
	`buyer_signature` text NOT NULL,
	`delivery_photos` text NOT NULL,
	`buyer_confirmation` integer NOT NULL,
	`buyer_feedback` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`delivery_task_id`) REFERENCES `delivery_tasks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`buyer_id` integer NOT NULL,
	`seller_id` integer NOT NULL,
	`amount` real NOT NULL,
	`platform_fee` real NOT NULL,
	`delivery_fee` real NOT NULL,
	`net_to_seller` real NOT NULL,
	`transaction_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`escrow_reference` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_escrow_reference_unique` ON `transactions` (`escrow_reference`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role` text NOT NULL,
	`phone_number` text NOT NULL,
	`pin` text NOT NULL,
	`email` text,
	`full_name` text NOT NULL,
	`middle_name` text,
	`gender` text,
	`date_of_birth` text,
	`address` text,
	`location` text,
	`bank_account_number` text,
	`bank_account_name` text,
	`bank_name` text,
	`education` text,
	`nin` text,
	`bvm` text,
	`marital_status` text,
	`has_vehicle` integer,
	`line_mark` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_number_unique` ON `users` (`phone_number`);