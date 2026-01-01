import { mysqlTable, int, text, timestamp, tinyint } from 'drizzle-orm/mysql-core';

// Users table
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  role: text('role').notNull(),
  phoneNumber: text('phone_number').notNull().unique(),
  pin: text('pin').notNull(),
  email: text('email'),
  fullName: text('full_name').notNull(),
  middleName: text('middle_name'),
  gender: text('gender'),
  dateOfBirth: text('date_of_birth'),
  address: text('address'),
  location: text('location'),
  bankAccountNumber: text('bank_account_number'),
  bankAccountName: text('bank_account_name'),
  bankName: text('bank_name'),
  education: text('education'),
  nin: text('nin'),
  bvn: text('bvn'),
  maritalStatus: text('marital_status'),
  hasVehicle: tinyint('has_vehicle'),
  lineMark: text('line_mark'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// Products table
export const products = mysqlTable('products', {
  id: int('id').primaryKey().autoincrement(),
  sellerId: int('seller_id').notNull().references(() => users.id),
  productName: text('product_name').notNull(),
  productType: text('product_type').notNull(),
  quantity: int('quantity').notNull(),
  pricePerUnit: text('price_per_unit').notNull(),
  totalPrice: text('total_price').notNull(),
  status: text('status').notNull().default('available'),
  listNumber: int('list_number'),
  photos: text('photos'),
  videos: text('videos'),
  verifiedBy: int('verified_by').references(() => users.id),
  verifiedAt: text('verified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// Orders table
export const orders = mysqlTable('orders', {
  id: int('id').primaryKey().autoincrement(),
  orderNumber: text('order_number').notNull().unique(),
  buyerId: int('buyer_id').notNull().references(() => users.id),
  totalAmount: text('total_amount').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  escrowStatus: text('escrow_status').notNull().default('pending'),
  orderStatus: text('order_status').notNull().default('placed'),
  buyerApproved: tinyint('buyer_approved').notNull().default(0),
  buyerApprovedAt: text('buyer_approved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// Order Items table
export const orderItems = mysqlTable('order_items', {
  id: int('id').primaryKey().autoincrement(),
  orderId: int('order_id').notNull().references(() => orders.id),
  productId: int('product_id').notNull().references(() => products.id),
  quantity: int('quantity').notNull(),
  pricePerUnit: text('price_per_unit').notNull(),
  totalPrice: text('total_price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Delivery Tasks table
export const deliveryTasks = mysqlTable('delivery_tasks', {
  id: int('id').primaryKey().autoincrement(),
  orderId: int('order_id').notNull().references(() => orders.id),
  driverId: int('driver_id').notNull().references(() => users.id),
  sellerId: int('seller_id').notNull().references(() => users.id),
  pickupAddress: text('pickup_address').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  pickupContactName: text('pickup_contact_name'),
  pickupContactPhone: text('pickup_contact_phone'),
  deliveryContactName: text('delivery_contact_name'),
  deliveryContactPhone: text('delivery_contact_phone'),
  status: text('status').notNull().default('assigned'),
  pickupVerificationPhotos: text('pickup_verification_photos'),
  pickupQrCode: text('pickup_qr_code'),
  pickupVerifiedAt: text('pickup_verified_at'),
  deliverySignature: text('delivery_signature'),
  deliveryPhotos: text('delivery_photos'),
  deliveryVerifiedAt: text('delivery_verified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// Proof of Delivery table
export const proofOfDelivery = mysqlTable('proof_of_delivery', {
  id: int('id').primaryKey().autoincrement(),
  deliveryTaskId: int('delivery_task_id').notNull().references(() => deliveryTasks.id),
  orderId: int('order_id').notNull().references(() => orders.id),
  buyerSignature: text('buyer_signature').notNull(),
  deliveryPhotos: text('delivery_photos').notNull(),
  buyerConfirmation: tinyint('buyer_confirmation').notNull(),
  buyerFeedback: text('buyer_feedback'),
  legalAgreementAccepted: tinyint('legal_agreement_accepted').notNull(),
  legalAgreementVersion: text('legal_agreement_version'),
  legalAgreementText: text('legal_agreement_text').notNull(),
  agreementAcceptedAt: text('agreement_accepted_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Transactions table
export const transactions = mysqlTable('transactions', {
  id: int('id').primaryKey().autoincrement(),
  orderId: int('order_id').notNull().references(() => orders.id),
  buyerId: int('buyer_id').notNull().references(() => users.id),
  sellerId: int('seller_id').notNull().references(() => users.id),
  amount: text('amount').notNull(),
  platformFee: text('platform_fee').notNull(),
  logisticsFee: text('logistics_fee').notNull(),
  netAmount: text('net_amount').notNull(),
  transactionType: text('transaction_type').notNull(),
  transactionStatus: text('transaction_status').notNull().default('pending'),
  escrowAccountRef: text('escrow_account_ref'),
  payoutRef: text('payout_ref'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// Notifications table
export const notifications = mysqlTable('notifications', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id),
  notificationType: text('notification_type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: tinyint('is_read').notNull().default(0),
  metadata: text('metadata'),
  sentAt: text('sent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Activity Logs table
export const activityLogs = mysqlTable('activity_logs', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').references(() => users.id),
  userRole: text('user_role'),
  activityType: text('activity_type').notNull(),
  entityType: text('entity_type'),
  entityId: int('entity_id'),
  description: text('description').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Abandoned Processes table
export const abandonedProcesses = mysqlTable('abandoned_processes', {
  id: int('id').primaryKey().autoincrement(),
  processType: text('process_type').notNull(),
  entityId: int('entity_id').notNull(),
  status: text('status').notNull().default('detected'),
  detectedAt: text('detected_at').notNull(),
  lastNotifiedAt: text('last_notified_at'),
  resolvedAt: text('resolved_at'),
  resolutionAction: text('resolution_action'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});