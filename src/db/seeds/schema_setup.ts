import { db } from '@/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('🔄 Starting schema setup for Turso database...');

    // 1. Create users table (no dependencies)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            phone_number TEXT NOT NULL UNIQUE,
            pin TEXT NOT NULL,
            email TEXT,
            full_name TEXT NOT NULL,
            middle_name TEXT,
            gender TEXT,
            date_of_birth TEXT,
            address TEXT,
            location TEXT,
            bank_account_number TEXT,
            bank_account_name TEXT,
            bank_name TEXT,
            education TEXT,
            nin TEXT,
            bvn TEXT,
            marital_status TEXT,
            has_vehicle INTEGER,
            line_mark TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);
    console.log('✅ Users table created');

    // 2. Create products table (references users.id for sellerId)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seller_id INTEGER NOT NULL REFERENCES users(id),
            product_name TEXT NOT NULL,
            product_type TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price_per_unit TEXT NOT NULL,
            total_price TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'available',
            list_number INTEGER,
            photos TEXT,
            videos TEXT,
            verified_by INTEGER REFERENCES users(id),
            verified_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);
    console.log('✅ Products table created');

    // 3. Create orders table (references users.id for buyerId)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT NOT NULL UNIQUE,
            buyer_id INTEGER NOT NULL REFERENCES users(id),
            total_amount TEXT NOT NULL,
            delivery_address TEXT NOT NULL,
            escrow_status TEXT NOT NULL DEFAULT 'pending',
            order_status TEXT NOT NULL DEFAULT 'placed',
            buyer_approved INTEGER NOT NULL DEFAULT 0,
            buyer_approved_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);
    console.log('✅ Orders table created');

    // 4. Create order_items table (references orders.id and products.id)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL REFERENCES orders(id),
            product_id INTEGER NOT NULL REFERENCES products(id),
            quantity INTEGER NOT NULL,
            price_per_unit TEXT NOT NULL,
            total_price TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    `);
    console.log('✅ Order items table created');

    // 5. Create delivery_tasks table (references orders.id, users.id for driverId and sellerId)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS delivery_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL REFERENCES orders(id),
            driver_id INTEGER NOT NULL REFERENCES users(id),
            seller_id INTEGER NOT NULL REFERENCES users(id),
            pickup_address TEXT NOT NULL,
            delivery_address TEXT NOT NULL,
            pickup_contact_name TEXT,
            pickup_contact_phone TEXT,
            delivery_contact_name TEXT,
            delivery_contact_phone TEXT,
            status TEXT NOT NULL DEFAULT 'assigned',
            pickup_verification_photos TEXT,
            pickup_qr_code TEXT,
            pickup_verified_at TEXT,
            delivery_signature TEXT,
            delivery_photos TEXT,
            delivery_verified_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);
    console.log('✅ Delivery tasks table created');

    // 6. Create proof_of_delivery table (references delivery_tasks.id and orders.id)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS proof_of_delivery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            delivery_task_id INTEGER NOT NULL REFERENCES delivery_tasks(id),
            order_id INTEGER NOT NULL REFERENCES orders(id),
            buyer_signature TEXT NOT NULL,
            delivery_photos TEXT NOT NULL,
            buyer_confirmation INTEGER NOT NULL,
            buyer_feedback TEXT,
            legal_agreement_accepted INTEGER NOT NULL,
            legal_agreement_version TEXT,
            legal_agreement_text TEXT NOT NULL,
            agreement_accepted_at TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            created_at TEXT NOT NULL
        )
    `);
    console.log('✅ Proof of delivery table created');

    // 7. Create transactions table (references orders.id, users.id for buyerId and sellerId)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL REFERENCES orders(id),
            buyer_id INTEGER NOT NULL REFERENCES users(id),
            seller_id INTEGER NOT NULL REFERENCES users(id),
            amount TEXT NOT NULL,
            platform_fee TEXT NOT NULL,
            logistics_fee TEXT NOT NULL,
            net_amount TEXT NOT NULL,
            transaction_type TEXT NOT NULL,
            transaction_status TEXT NOT NULL DEFAULT 'pending',
            escrow_account_ref TEXT,
            payout_ref TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);
    console.log('✅ Transactions table created');

    // 8. Create notifications table (references users.id)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            notification_type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read INTEGER NOT NULL DEFAULT 0,
            metadata TEXT,
            sent_at TEXT,
            created_at TEXT NOT NULL
        )
    `);
    console.log('✅ Notifications table created');

    // 9. Create activity_logs table (references users.id - nullable)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            user_role TEXT,
            activity_type TEXT NOT NULL,
            entity_type TEXT,
            entity_id INTEGER,
            description TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            metadata TEXT,
            created_at TEXT NOT NULL
        )
    `);
    console.log('✅ Activity logs table created');

    // 10. Create abandoned_processes table (no foreign keys)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS abandoned_processes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            process_type TEXT NOT NULL,
            entity_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'detected',
            detected_at TEXT NOT NULL,
            last_notified_at TEXT,
            resolved_at TEXT,
            resolution_action TEXT,
            metadata TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);
    console.log('✅ Abandoned processes table created');

    console.log('✅ Schema setup completed successfully - all tables created in Turso database');
}

main().catch((error) => {
    console.error('❌ Schema setup failed:', error);
    process.exit(1);
});