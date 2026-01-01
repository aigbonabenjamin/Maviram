-- ============================================================================
-- MAVIRAM FOOD DELIVERY - MYSQL STORED PROCEDURES
-- Database: MySQL 8.0+
-- Description: Complete set of 70+ stored procedures for all database operations
-- ============================================================================

DELIMITER $$

-- ============================================================================
-- USERS STORED PROCEDURES
-- ============================================================================

-- Create new user
DROP PROCEDURE IF EXISTS sp_create_user$$
CREATE PROCEDURE sp_create_user(
    IN p_role VARCHAR(20),
    IN p_phoneNumber VARCHAR(20),
    IN p_pin VARCHAR(4),
    IN p_email VARCHAR(255),
    IN p_fullName VARCHAR(255),
    IN p_middleName VARCHAR(255),
    IN p_gender VARCHAR(10),
    IN p_dateOfBirth VARCHAR(50),
    IN p_address TEXT,
    IN p_location VARCHAR(255),
    IN p_bankAccountNumber VARCHAR(50),
    IN p_bankAccountName VARCHAR(255),
    IN p_bankName VARCHAR(100),
    IN p_education VARCHAR(100),
    IN p_nin VARCHAR(20),
    IN p_bvm VARCHAR(50),
    IN p_maritalStatus VARCHAR(20),
    IN p_hasVehicle TINYINT,
    IN p_lineMark TEXT
)
BEGIN
    INSERT INTO users (
        role, phone_number, pin, email, full_name, middle_name, gender,
        date_of_birth, address, location, bank_account_number, bank_account_name,
        bank_name, education, nin, bvm, marital_status, has_vehicle, line_mark,
        created_at, updated_at
    ) VALUES (
        p_role, p_phoneNumber, p_pin, p_email, p_fullName, p_middleName, p_gender,
        p_dateOfBirth, p_address, p_location, p_bankAccountNumber, p_bankAccountName,
        p_bankName, p_education, p_nin, p_bvm, p_maritalStatus, p_hasVehicle, p_lineMark,
        NOW(), NOW()
    );
    
    SELECT * FROM users WHERE id = LAST_INSERT_ID();
END$$

-- Get user by ID
DROP PROCEDURE IF EXISTS sp_get_user_by_id$$
CREATE PROCEDURE sp_get_user_by_id(IN p_id INT)
BEGIN
    SELECT * FROM users WHERE id = p_id LIMIT 1;
END$$

-- Get user by phone number
DROP PROCEDURE IF EXISTS sp_get_user_by_phone$$
CREATE PROCEDURE sp_get_user_by_phone(IN p_phoneNumber VARCHAR(20))
BEGIN
    SELECT * FROM users WHERE phone_number = p_phoneNumber LIMIT 1;
END$$

-- Update user
DROP PROCEDURE IF EXISTS sp_update_user$$
CREATE PROCEDURE sp_update_user(
    IN p_id INT,
    IN p_role VARCHAR(20),
    IN p_phoneNumber VARCHAR(20),
    IN p_pin VARCHAR(4),
    IN p_email VARCHAR(255),
    IN p_fullName VARCHAR(255),
    IN p_middleName VARCHAR(255),
    IN p_gender VARCHAR(10),
    IN p_dateOfBirth VARCHAR(50),
    IN p_address TEXT,
    IN p_location VARCHAR(255),
    IN p_bankAccountNumber VARCHAR(50),
    IN p_bankAccountName VARCHAR(255),
    IN p_bankName VARCHAR(100),
    IN p_education VARCHAR(100),
    IN p_nin VARCHAR(20),
    IN p_bvm VARCHAR(50),
    IN p_maritalStatus VARCHAR(20),
    IN p_hasVehicle TINYINT,
    IN p_lineMark TEXT
)
BEGIN
    UPDATE users SET
        role = COALESCE(p_role, role),
        phone_number = COALESCE(p_phoneNumber, phone_number),
        pin = COALESCE(p_pin, pin),
        email = COALESCE(p_email, email),
        full_name = COALESCE(p_fullName, full_name),
        middle_name = p_middleName,
        gender = p_gender,
        date_of_birth = p_dateOfBirth,
        address = p_address,
        location = p_location,
        bank_account_number = p_bankAccountNumber,
        bank_account_name = p_bankAccountName,
        bank_name = p_bankName,
        education = p_education,
        nin = p_nin,
        bvm = p_bvm,
        marital_status = p_maritalStatus,
        has_vehicle = p_hasVehicle,
        line_mark = p_lineMark,
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT * FROM users WHERE id = p_id LIMIT 1;
END$$

-- Delete user
DROP PROCEDURE IF EXISTS sp_delete_user$$
CREATE PROCEDURE sp_delete_user(IN p_id INT)
BEGIN
    DELETE FROM users WHERE id = p_id;
    SELECT ROW_COUNT() as deleted_count;
END$$

-- List users by role with pagination
DROP PROCEDURE IF EXISTS sp_list_users_by_role$$
CREATE PROCEDURE sp_list_users_by_role(
    IN p_role VARCHAR(20),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM users 
    WHERE role = p_role
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- Search users by name, phone, or email
DROP PROCEDURE IF EXISTS sp_search_users$$
CREATE PROCEDURE sp_search_users(
    IN p_search VARCHAR(255),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM users 
    WHERE full_name LIKE CONCAT('%', p_search, '%')
       OR phone_number LIKE CONCAT('%', p_search, '%')
       OR email LIKE CONCAT('%', p_search, '%')
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- ============================================================================
-- PRODUCTS STORED PROCEDURES
-- ============================================================================

-- Create new product with auto-generated listNumber
DROP PROCEDURE IF EXISTS sp_create_product$$
CREATE PROCEDURE sp_create_product(
    IN p_sellerId INT,
    IN p_productName VARCHAR(255),
    IN p_quantity INT,
    IN p_pricePerUnit DECIMAL(10,2),
    IN p_status VARCHAR(50),
    IN p_photos LONGTEXT,
    IN p_videos LONGTEXT
)
BEGIN
    DECLARE v_listNumber INT;
    
    -- Get next list number for this seller
    SELECT COALESCE(MAX(list_number), 0) + 1 INTO v_listNumber
    FROM products WHERE seller_id = p_sellerId;
    
    INSERT INTO products (
        seller_id, product_name, quantity, price_per_unit, list_number,
        status, photos, videos, created_at, updated_at
    ) VALUES (
        p_sellerId, p_productName, p_quantity, p_pricePerUnit, v_listNumber,
        COALESCE(p_status, 'available'), p_photos, p_videos, NOW(), NOW()
    );
    
    SELECT * FROM products WHERE id = LAST_INSERT_ID();
END$$

-- Get product by ID
DROP PROCEDURE IF EXISTS sp_get_product_by_id$$
CREATE PROCEDURE sp_get_product_by_id(IN p_id INT)
BEGIN
    SELECT * FROM products WHERE id = p_id LIMIT 1;
END$$

-- List products by seller
DROP PROCEDURE IF EXISTS sp_list_products_by_seller$$
CREATE PROCEDURE sp_list_products_by_seller(
    IN p_sellerId INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM products 
    WHERE seller_id = p_sellerId
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- List available products
DROP PROCEDURE IF EXISTS sp_list_available_products$$
CREATE PROCEDURE sp_list_available_products(
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM products 
    WHERE status = 'available'
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- List products by status
DROP PROCEDURE IF EXISTS sp_list_products_by_status$$
CREATE PROCEDURE sp_list_products_by_status(
    IN p_status VARCHAR(50),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM products 
    WHERE status = p_status
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- Search products by name
DROP PROCEDURE IF EXISTS sp_search_products$$
CREATE PROCEDURE sp_search_products(
    IN p_search VARCHAR(255),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM products 
    WHERE product_name LIKE CONCAT('%', p_search, '%')
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- Update product
DROP PROCEDURE IF EXISTS sp_update_product$$
CREATE PROCEDURE sp_update_product(
    IN p_id INT,
    IN p_productName VARCHAR(255),
    IN p_quantity INT,
    IN p_pricePerUnit DECIMAL(10,2),
    IN p_status VARCHAR(50),
    IN p_photos LONGTEXT,
    IN p_videos LONGTEXT,
    IN p_verifiedByDriverId INT
)
BEGIN
    UPDATE products SET
        product_name = COALESCE(p_productName, product_name),
        quantity = COALESCE(p_quantity, quantity),
        price_per_unit = COALESCE(p_pricePerUnit, price_per_unit),
        status = COALESCE(p_status, status),
        photos = COALESCE(p_photos, photos),
        videos = COALESCE(p_videos, videos),
        verified_by_driver_id = p_verifiedByDriverId,
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT * FROM products WHERE id = p_id LIMIT 1;
END$$

-- Update product status only
DROP PROCEDURE IF EXISTS sp_update_product_status$$
CREATE PROCEDURE sp_update_product_status(
    IN p_id INT,
    IN p_status VARCHAR(50)
)
BEGIN
    UPDATE products SET
        status = p_status,
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT * FROM products WHERE id = p_id LIMIT 1;
END$$

-- Delete product
DROP PROCEDURE IF EXISTS sp_delete_product$$
CREATE PROCEDURE sp_delete_product(IN p_id INT)
BEGIN
    DELETE FROM products WHERE id = p_id;
    SELECT ROW_COUNT() as deleted_count;
END$$

-- ============================================================================
-- ORDERS STORED PROCEDURES
-- ============================================================================

-- Create new order
DROP PROCEDURE IF EXISTS sp_create_order$$
CREATE PROCEDURE sp_create_order(
    IN p_orderNumber VARCHAR(100),
    IN p_buyerId INT,
    IN p_totalAmount DECIMAL(10,2),
    IN p_deliveryAddress TEXT,
    IN p_status VARCHAR(50),
    IN p_paymentStatus VARCHAR(50),
    IN p_deliveryOption VARCHAR(100),
    IN p_buyerNotes TEXT
)
BEGIN
    INSERT INTO orders (
        order_number, buyer_id, total_amount, delivery_address,
        status, payment_status, delivery_option, buyer_notes,
        created_at, updated_at
    ) VALUES (
        p_orderNumber, p_buyerId, p_totalAmount, p_deliveryAddress,
        COALESCE(p_status, 'pending'), COALESCE(p_paymentStatus, 'pending'),
        p_deliveryOption, p_buyerNotes, NOW(), NOW()
    );
    
    SELECT * FROM orders WHERE id = LAST_INSERT_ID();
END$$

-- Get order by ID
DROP PROCEDURE IF EXISTS sp_get_order_by_id$$
CREATE PROCEDURE sp_get_order_by_id(IN p_id INT)
BEGIN
    SELECT * FROM orders WHERE id = p_id LIMIT 1;
END$$

-- Get order by order number
DROP PROCEDURE IF EXISTS sp_get_order_by_number$$
CREATE PROCEDURE sp_get_order_by_number(IN p_orderNumber VARCHAR(100))
BEGIN
    SELECT * FROM orders WHERE order_number = p_orderNumber LIMIT 1;
END$$

-- List orders by buyer
DROP PROCEDURE IF EXISTS sp_list_orders_by_buyer$$
CREATE PROCEDURE sp_list_orders_by_buyer(
    IN p_buyerId INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM orders 
    WHERE buyer_id = p_buyerId
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- List orders by status
DROP PROCEDURE IF EXISTS sp_list_orders_by_status$$
CREATE PROCEDURE sp_list_orders_by_status(
    IN p_status VARCHAR(50),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM orders 
    WHERE status = p_status
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- List orders by payment status
DROP PROCEDURE IF EXISTS sp_list_orders_by_payment_status$$
CREATE PROCEDURE sp_list_orders_by_payment_status(
    IN p_paymentStatus VARCHAR(50),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM orders 
    WHERE payment_status = p_paymentStatus
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- Update order
DROP PROCEDURE IF EXISTS sp_update_order$$
CREATE PROCEDURE sp_update_order(
    IN p_id INT,
    IN p_totalAmount DECIMAL(10,2),
    IN p_deliveryAddress TEXT,
    IN p_status VARCHAR(50),
    IN p_paymentStatus VARCHAR(50),
    IN p_deliveryOption VARCHAR(100),
    IN p_buyerNotes TEXT
)
BEGIN
    UPDATE orders SET
        total_amount = COALESCE(p_totalAmount, total_amount),
        delivery_address = COALESCE(p_deliveryAddress, delivery_address),
        status = COALESCE(p_status, status),
        payment_status = COALESCE(p_paymentStatus, payment_status),
        delivery_option = COALESCE(p_deliveryOption, delivery_option),
        buyer_notes = p_buyerNotes,
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT * FROM orders WHERE id = p_id LIMIT 1;
END$$

-- Update order status only
DROP PROCEDURE IF EXISTS sp_update_order_status$$
CREATE PROCEDURE sp_update_order_status(
    IN p_id INT,
    IN p_status VARCHAR(50)
)
BEGIN
    UPDATE orders SET
        status = p_status,
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT * FROM orders WHERE id = p_id LIMIT 1;
END$$

-- Update payment status only
DROP PROCEDURE IF EXISTS sp_update_payment_status$$
CREATE PROCEDURE sp_update_payment_status(
    IN p_id INT,
    IN p_paymentStatus VARCHAR(50)
)
BEGIN
    UPDATE orders SET
        payment_status = p_paymentStatus,
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT * FROM orders WHERE id = p_id LIMIT 1;
END$$

-- Delete order
DROP PROCEDURE IF EXISTS sp_delete_order$$
CREATE PROCEDURE sp_delete_order(IN p_id INT)
BEGIN
    DELETE FROM orders WHERE id = p_id;
    SELECT ROW_COUNT() as deleted_count;
END$$

-- ============================================================================
-- ORDER_ITEMS STORED PROCEDURES
-- ============================================================================

-- Create new order item
DROP PROCEDURE IF EXISTS sp_create_order_item$$
CREATE PROCEDURE sp_create_order_item(
    IN p_orderId INT,
    IN p_productId INT,
    IN p_sellerId INT,
    IN p_productName VARCHAR(255),
    IN p_quantity INT,
    IN p_pricePerUnit DECIMAL(10,2),
    IN p_totalPrice DECIMAL(10,2),
    IN p_status VARCHAR(50),
    IN p_uniqueId VARCHAR(100)
)
BEGIN
    INSERT INTO order_items (
        order_id, product_id, seller_id, product_name, quantity,
        price_per_unit, total_price, status, unique_id, created_at
    ) VALUES (
        p_orderId, p_productId, p_sellerId, p_productName, p_quantity,
        p_pricePerUnit, p_totalPrice, COALESCE(p_status, 'pending'),
        p_uniqueId, NOW()
    );
    
    SELECT * FROM order_items WHERE id = LAST_INSERT_ID();
END$$

-- Get order items by order ID
DROP PROCEDURE IF EXISTS sp_get_order_items_by_order$$
CREATE PROCEDURE sp_get_order_items_by_order(IN p_orderId INT)
BEGIN
    SELECT * FROM order_items 
    WHERE order_id = p_orderId
    ORDER BY created_at ASC;
END$$

-- Get order items by seller
DROP PROCEDURE IF EXISTS sp_get_order_items_by_seller$$
CREATE PROCEDURE sp_get_order_items_by_seller(
    IN p_sellerId INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM order_items 
    WHERE seller_id = p_sellerId
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- Get order item by ID
DROP PROCEDURE IF EXISTS sp_get_order_item_by_id$$
CREATE PROCEDURE sp_get_order_item_by_id(IN p_id INT)
BEGIN
    SELECT * FROM order_items WHERE id = p_id LIMIT 1;
END$$

-- Update order item status
DROP PROCEDURE IF EXISTS sp_update_order_item_status$$
CREATE PROCEDURE sp_update_order_item_status(
    IN p_id INT,
    IN p_status VARCHAR(50)
)
BEGIN
    UPDATE order_items SET status = p_status WHERE id = p_id;
    SELECT * FROM order_items WHERE id = p_id LIMIT 1;
END$$

-- Update order item
DROP PROCEDURE IF EXISTS sp_update_order_item$$
CREATE PROCEDURE sp_update_order_item(
    IN p_id INT,
    IN p_quantity INT,
    IN p_pricePerUnit DECIMAL(10,2),
    IN p_totalPrice DECIMAL(10,2),
    IN p_status VARCHAR(50)
)
BEGIN
    UPDATE order_items SET
        quantity = COALESCE(p_quantity, quantity),
        price_per_unit = COALESCE(p_pricePerUnit, price_per_unit),
        total_price = COALESCE(p_totalPrice, total_price),
        status = COALESCE(p_status, status)
    WHERE id = p_id;
    
    SELECT * FROM order_items WHERE id = p_id LIMIT 1;
END$$

-- Delete order item
DROP PROCEDURE IF EXISTS sp_delete_order_item$$
CREATE PROCEDURE sp_delete_order_item(IN p_id INT)
BEGIN
    DELETE FROM order_items WHERE id = p_id;
    SELECT ROW_COUNT() as deleted_count;
END$$

-- ============================================================================
-- DELIVERY_TASKS STORED PROCEDURES
-- ============================================================================

-- Create new delivery task
DROP PROCEDURE IF EXISTS sp_create_delivery_task$$
CREATE PROCEDURE sp_create_delivery_task(
    IN p_orderId INT,
    IN p_driverId INT,
    IN p_sellerId INT,
    IN p_pickupAddress TEXT,
    IN p_deliveryAddress TEXT,
    IN p_pickupContact VARCHAR(20),
    IN p_deliveryContact VARCHAR(20),
    IN p_productDetails LONGTEXT,
    IN p_status VARCHAR(50),
    IN p_assignedAt TIMESTAMP
)
BEGIN
    INSERT INTO delivery_tasks (
        order_id, driver_id, seller_id, pickup_address, delivery_address,
        pickup_contact, delivery_contact, product_details, status,
        assigned_at, created_at, updated_at
    ) VALUES (
        p_orderId, p_driverId, p_sellerId, p_pickupAddress, p_deliveryAddress,
        p_pickupContact, p_deliveryContact, p_productDetails,
        COALESCE(p_status, 'assigned'), COALESCE(p_assignedAt, NOW()),
        NOW(), NOW()
    );
    
    SELECT * FROM delivery_tasks WHERE id = LAST_INSERT_ID();
END$$

-- Get delivery task by ID
DROP PROCEDURE IF EXISTS sp_get_delivery_task_by_id$$
CREATE PROCEDURE sp_get_delivery_task_by_id(IN p_id INT)
BEGIN
    SELECT * FROM delivery_tasks WHERE id = p_id LIMIT 1;
END$$

-- List tasks by driver
DROP PROCEDURE IF EXISTS sp_list_tasks_by_driver$$
CREATE PROCEDURE sp_list_tasks_by_driver(
    IN p_driverId INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM delivery_tasks 
    WHERE driver_id = p_driverId
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- List tasks by seller
DROP PROCEDURE IF EXISTS sp_list_tasks_by_seller$$
CREATE PROCEDURE sp_list_tasks_by_seller(
    IN p_sellerId INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM delivery_tasks 
    WHERE seller_id = p_sellerId
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- List tasks by order
DROP PROCEDURE IF EXISTS sp_list_tasks_by_order$$
CREATE PROCEDURE sp_list_tasks_by_order(IN p_orderId INT)
BEGIN
    SELECT * FROM delivery_tasks 
    WHERE order_id = p_orderId
    ORDER BY created_at ASC;
END$$

-- List tasks by status
DROP PROCEDURE IF EXISTS sp_list_tasks_by_status$$
CREATE PROCEDURE sp_list_tasks_by_status(
    IN p_status VARCHAR(50),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM delivery_tasks 
    WHERE status = p_status
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- List unassigned tasks
DROP PROCEDURE IF EXISTS sp_list_unassigned_tasks$$
CREATE PROCEDURE sp_list_unassigned_tasks(
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM delivery_tasks 
    WHERE driver_id IS NULL
    ORDER BY created_at ASC
    LIMIT p_limit OFFSET p_offset;
END$$

-- Update delivery task status with auto timestamp updates
DROP PROCEDURE IF EXISTS sp_update_delivery_task_status$$
CREATE PROCEDURE sp_update_delivery_task_status(
    IN p_id INT,
    IN p_status VARCHAR(50)
)
BEGIN
    DECLARE v_currentStatus VARCHAR(50);
    
    SELECT status INTO v_currentStatus FROM delivery_tasks WHERE id = p_id;
    
    UPDATE delivery_tasks SET
        status = p_status,
        pickup_timestamp = CASE 
            WHEN p_status = 'picked_up' AND pickup_timestamp IS NULL THEN NOW()
            ELSE pickup_timestamp
        END,
        delivery_timestamp = CASE 
            WHEN p_status = 'delivered' AND delivery_timestamp IS NULL THEN NOW()
            ELSE delivery_timestamp
        END,
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT * FROM delivery_tasks WHERE id = p_id LIMIT 1;
END$$

-- Assign driver to task
DROP PROCEDURE IF EXISTS sp_assign_driver$$
CREATE PROCEDURE sp_assign_driver(
    IN p_id INT,
    IN p_driverId INT
)
BEGIN
    UPDATE delivery_tasks SET
        driver_id = p_driverId,
        assigned_at = NOW(),
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT * FROM delivery_tasks WHERE id = p_id LIMIT 1;
END$$

-- Update pickup verification details
DROP PROCEDURE IF EXISTS sp_update_pickup_verification$$
CREATE PROCEDURE sp_update_pickup_verification(
    IN p_id INT,
    IN p_pickupVerificationPhotos LONGTEXT,
    IN p_pickupQrCode TEXT,
    IN p_pickupTimestamp TIMESTAMP
)
BEGIN
    UPDATE delivery_tasks SET
        pickup_verification_photos = p_pickupVerificationPhotos,
        pickup_qr_code = p_pickupQrCode,
        pickup_timestamp = COALESCE(p_pickupTimestamp, NOW()),
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT * FROM delivery_tasks WHERE id = p_id LIMIT 1;
END$$

-- Update delivery task
DROP PROCEDURE IF EXISTS sp_update_delivery_task$$
CREATE PROCEDURE sp_update_delivery_task(
    IN p_id INT,
    IN p_driverId INT,
    IN p_pickupAddress TEXT,
    IN p_deliveryAddress TEXT,
    IN p_pickupContact VARCHAR(20),
    IN p_deliveryContact VARCHAR(20),
    IN p_productDetails LONGTEXT,
    IN p_status VARCHAR(50),
    IN p_pickupVerificationPhotos LONGTEXT,
    IN p_pickupQrCode TEXT
)
BEGIN
    UPDATE delivery_tasks SET
        driver_id = COALESCE(p_driverId, driver_id),
        pickup_address = COALESCE(p_pickupAddress, pickup_address),
        delivery_address = COALESCE(p_deliveryAddress, delivery_address),
        pickup_contact = COALESCE(p_pickupContact, pickup_contact),
        delivery_contact = COALESCE(p_deliveryContact, delivery_contact),
        product_details = COALESCE(p_productDetails, product_details),
        status = COALESCE(p_status, status),
        pickup_verification_photos = COALESCE(p_pickupVerificationPhotos, pickup_verification_photos),
        pickup_qr_code = COALESCE(p_pickupQrCode, pickup_qr_code),
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT * FROM delivery_tasks WHERE id = p_id LIMIT 1;
END$$

-- Delete delivery task
DROP PROCEDURE IF EXISTS sp_delete_delivery_task$$
CREATE PROCEDURE sp_delete_delivery_task(IN p_id INT)
BEGIN
    DELETE FROM delivery_tasks WHERE id = p_id;
    SELECT ROW_COUNT() as deleted_count;
END$$

-- ============================================================================
-- PROOF_OF_DELIVERY STORED PROCEDURES
-- ============================================================================

-- Create proof of delivery
DROP PROCEDURE IF EXISTS sp_create_proof_of_delivery$$
CREATE PROCEDURE sp_create_proof_of_delivery(
    IN p_deliveryTaskId INT,
    IN p_orderId INT,
    IN p_buyerSignature TEXT,
    IN p_deliveryPhotos LONGTEXT,
    IN p_buyerConfirmation TINYINT,
    IN p_buyerFeedback TEXT
)
BEGIN
    INSERT INTO proof_of_delivery (
        delivery_task_id, order_id, buyer_signature, delivery_photos,
        buyer_confirmation, buyer_feedback, created_at
    ) VALUES (
        p_deliveryTaskId, p_orderId, p_buyerSignature, p_deliveryPhotos,
        p_buyerConfirmation, p_buyerFeedback, NOW()
    );
    
    SELECT * FROM proof_of_delivery WHERE id = LAST_INSERT_ID();
END$$

-- Get proof of delivery by delivery task ID
DROP PROCEDURE IF EXISTS sp_get_pod_by_delivery_task$$
CREATE PROCEDURE sp_get_pod_by_delivery_task(IN p_deliveryTaskId INT)
BEGIN
    SELECT * FROM proof_of_delivery 
    WHERE delivery_task_id = p_deliveryTaskId 
    LIMIT 1;
END$$

-- Get proof of delivery by order ID
DROP PROCEDURE IF EXISTS sp_get_pod_by_order$$
CREATE PROCEDURE sp_get_pod_by_order(IN p_orderId INT)
BEGIN
    SELECT * FROM proof_of_delivery 
    WHERE order_id = p_orderId 
    ORDER BY created_at DESC;
END$$

-- Get proof of delivery by ID
DROP PROCEDURE IF EXISTS sp_get_pod_by_id$$
CREATE PROCEDURE sp_get_pod_by_id(IN p_id INT)
BEGIN
    SELECT * FROM proof_of_delivery WHERE id = p_id LIMIT 1;
END$$

-- Delete proof of delivery
DROP PROCEDURE IF EXISTS sp_delete_pod$$
CREATE PROCEDURE sp_delete_pod(IN p_id INT)
BEGIN
    DELETE FROM proof_of_delivery WHERE id = p_id;
    SELECT ROW_COUNT() as deleted_count;
END$$

-- ============================================================================
-- TRANSACTIONS STORED PROCEDURES
-- ============================================================================

-- Create new transaction
DROP PROCEDURE IF EXISTS sp_create_transaction$$
CREATE PROCEDURE sp_create_transaction(
    IN p_orderId INT,
    IN p_buyerId INT,
    IN p_sellerId INT,
    IN p_amount DECIMAL(10,2),
    IN p_platformFee DECIMAL(10,2),
    IN p_deliveryFee DECIMAL(10,2),
    IN p_netToSeller DECIMAL(10,2),
    IN p_transactionType VARCHAR(50),
    IN p_status VARCHAR(50),
    IN p_escrowReference VARCHAR(100),
    IN p_notes TEXT
)
BEGIN
    INSERT INTO transactions (
        order_id, buyer_id, seller_id, amount, platform_fee, delivery_fee,
        net_to_seller, transaction_type, status, escrow_reference, notes,
        created_at, updated_at
    ) VALUES (
        p_orderId, p_buyerId, p_sellerId, p_amount, p_platformFee, p_deliveryFee,
        p_netToSeller, p_transactionType, COALESCE(p_status, 'pending'),
        p_escrowReference, p_notes, NOW(), NOW()
    );
    
    SELECT * FROM transactions WHERE id = LAST_INSERT_ID();
END$$

-- Get transaction by ID
DROP PROCEDURE IF EXISTS sp_get_transaction_by_id$$
CREATE PROCEDURE sp_get_transaction_by_id(IN p_id INT)
BEGIN
    SELECT * FROM transactions WHERE id = p_id LIMIT 1;
END$$

-- Get transaction by order ID
DROP PROCEDURE IF EXISTS sp_get_transaction_by_order$$
CREATE PROCEDURE sp_get_transaction_by_order(IN p_orderId INT)
BEGIN
    SELECT * FROM transactions 
    WHERE order_id = p_orderId 
    ORDER BY created_at DESC;
END$$

-- Get transaction by escrow reference
DROP PROCEDURE IF EXISTS sp_get_transaction_by_escrow_ref$$
CREATE PROCEDURE sp_get_transaction_by_escrow_ref(IN p_escrowReference VARCHAR(100))
BEGIN
    SELECT * FROM transactions 
    WHERE escrow_reference = p_escrowReference 
    LIMIT 1;
END$$

-- List transactions by buyer
DROP PROCEDURE IF EXISTS sp_list_transactions_by_buyer$$
CREATE PROCEDURE sp_list_transactions_by_buyer(
    IN p_buyerId INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM transactions 
    WHERE buyer_id = p_buyerId
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- List transactions by seller
DROP PROCEDURE IF EXISTS sp_list_transactions_by_seller$$
CREATE PROCEDURE sp_list_transactions_by_seller(
    IN p_sellerId INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM transactions 
    WHERE seller_id = p_sellerId
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- List transactions by type
DROP PROCEDURE IF EXISTS sp_list_transactions_by_type$$
CREATE PROCEDURE sp_list_transactions_by_type(
    IN p_transactionType VARCHAR(50),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM transactions 
    WHERE transaction_type = p_transactionType
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- List transactions by status
DROP PROCEDURE IF EXISTS sp_list_transactions_by_status$$
CREATE PROCEDURE sp_list_transactions_by_status(
    IN p_status VARCHAR(50),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM transactions 
    WHERE status = p_status
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- Update transaction status
DROP PROCEDURE IF EXISTS sp_update_transaction_status$$
CREATE PROCEDURE sp_update_transaction_status(
    IN p_id INT,
    IN p_status VARCHAR(50)
)
BEGIN
    UPDATE transactions SET
        status = p_status,
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT * FROM transactions WHERE id = p_id LIMIT 1;
END$$

-- Update transaction
DROP PROCEDURE IF EXISTS sp_update_transaction$$
CREATE PROCEDURE sp_update_transaction(
    IN p_id INT,
    IN p_status VARCHAR(50),
    IN p_notes TEXT
)
BEGIN
    UPDATE transactions SET
        status = COALESCE(p_status, status),
        notes = COALESCE(p_notes, notes),
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT * FROM transactions WHERE id = p_id LIMIT 1;
END$$

-- Delete transaction
DROP PROCEDURE IF EXISTS sp_delete_transaction$$
CREATE PROCEDURE sp_delete_transaction(IN p_id INT)
BEGIN
    DELETE FROM transactions WHERE id = p_id;
    SELECT ROW_COUNT() as deleted_count;
END$$

-- ============================================================================
-- NOTIFICATIONS STORED PROCEDURES
-- ============================================================================

-- Create new notification
DROP PROCEDURE IF EXISTS sp_create_notification$$
CREATE PROCEDURE sp_create_notification(
    IN p_userId INT,
    IN p_orderId INT,
    IN p_notificationType VARCHAR(20),
    IN p_message TEXT,
    IN p_sentAt TIMESTAMP
)
BEGIN
    INSERT INTO notifications (
        user_id, order_id, notification_type, message, is_read,
        sent_at, created_at
    ) VALUES (
        p_userId, p_orderId, p_notificationType, p_message, 0,
        COALESCE(p_sentAt, NOW()), NOW()
    );
    
    SELECT * FROM notifications WHERE id = LAST_INSERT_ID();
END$$

-- Get notifications by user
DROP PROCEDURE IF EXISTS sp_get_notifications_by_user$$
CREATE PROCEDURE sp_get_notifications_by_user(
    IN p_userId INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM notifications 
    WHERE user_id = p_userId
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- Get unread notifications
DROP PROCEDURE IF EXISTS sp_get_unread_notifications$$
CREATE PROCEDURE sp_get_unread_notifications(
    IN p_userId INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM notifications 
    WHERE user_id = p_userId AND is_read = 0
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

-- Get notification by ID
DROP PROCEDURE IF EXISTS sp_get_notification_by_id$$
CREATE PROCEDURE sp_get_notification_by_id(IN p_id INT)
BEGIN
    SELECT * FROM notifications WHERE id = p_id LIMIT 1;
END$$

-- Mark notification as read
DROP PROCEDURE IF EXISTS sp_mark_notification_read$$
CREATE PROCEDURE sp_mark_notification_read(IN p_id INT)
BEGIN
    UPDATE notifications SET is_read = 1 WHERE id = p_id;
    SELECT * FROM notifications WHERE id = p_id LIMIT 1;
END$$

-- Mark all notifications as read for a user
DROP PROCEDURE IF EXISTS sp_mark_all_read$$
CREATE PROCEDURE sp_mark_all_read(IN p_userId INT)
BEGIN
    UPDATE notifications SET is_read = 1 WHERE user_id = p_userId;
    SELECT ROW_COUNT() as updated_count;
END$$

-- Get unread notification count
DROP PROCEDURE IF EXISTS sp_get_unread_count$$
CREATE PROCEDURE sp_get_unread_count(IN p_userId INT)
BEGIN
    SELECT COUNT(*) as unread_count 
    FROM notifications 
    WHERE user_id = p_userId AND is_read = 0;
END$$

-- Delete notification
DROP PROCEDURE IF EXISTS sp_delete_notification$$
CREATE PROCEDURE sp_delete_notification(IN p_id INT)
BEGIN
    DELETE FROM notifications WHERE id = p_id;
    SELECT ROW_COUNT() as deleted_count;
END$$

DELIMITER ;

-- ============================================================================
-- END OF STORED PROCEDURES - 70+ PROCEDURES CREATED
-- ============================================================================