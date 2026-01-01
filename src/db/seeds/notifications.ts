import { db } from '@/db';
import { notifications } from '@/db/schema';

async function main() {
    const sampleNotifications = [
        {
            userId: 2,
            notificationType: 'app',
            title: 'New Order Received',
            message: 'You have received a new order ORD-2024-001 for 50 bags of rice. Total amount: ₦45,000. Please confirm and prepare items for delivery.',
            isRead: 0,
            metadata: JSON.stringify({
                orderId: 1,
                orderNumber: 'ORD-2024-001',
                amount: '45000',
                productName: 'Local Rice',
                quantity: 50,
                buyerLocation: 'Ikeja, Lagos'
            }),
            sentAt: new Date('2024-12-15T09:30:00Z').toISOString(),
            createdAt: new Date('2024-12-15T09:30:00Z').toISOString(),
        },
        {
            userId: 5,
            notificationType: 'sms',
            title: 'Order Confirmed',
            message: 'Your order ORD-2024-001 has been confirmed by the seller. Delivery will be arranged within 24 hours to your address in Ikeja, Lagos.',
            isRead: 1,
            metadata: JSON.stringify({
                orderId: 1,
                orderNumber: 'ORD-2024-001',
                sellerName: 'Adekunle Farms',
                estimatedDelivery: '2024-12-16',
                deliveryAddress: '45 Allen Avenue, Ikeja, Lagos'
            }),
            sentAt: new Date('2024-12-15T10:15:00Z').toISOString(),
            createdAt: new Date('2024-12-15T10:15:00Z').toISOString(),
        },
        {
            userId: 9,
            notificationType: 'app',
            title: 'Delivery Assignment',
            message: 'New delivery task assigned: Order ORD-2024-001. Pickup from Ojota Market, Lagos to Ikeja. Payment: ₦3,500. Please confirm acceptance.',
            isRead: 0,
            metadata: JSON.stringify({
                orderId: 1,
                orderNumber: 'ORD-2024-001',
                pickupAddress: 'Ojota Market, Lagos',
                deliveryAddress: '45 Allen Avenue, Ikeja, Lagos',
                deliveryFee: '3500',
                distance: '12km'
            }),
            sentAt: new Date('2024-12-16T07:00:00Z').toISOString(),
            createdAt: new Date('2024-12-16T07:00:00Z').toISOString(),
        },
        {
            userId: 3,
            notificationType: 'email',
            title: 'Payment Received in Escrow',
            message: 'Payment of ₦78,500 for order ORD-2024-002 has been received and held in escrow. Funds will be released upon successful delivery confirmation.',
            isRead: 1,
            metadata: JSON.stringify({
                orderId: 2,
                orderNumber: 'ORD-2024-002',
                amount: '78500',
                platformFee: '1570',
                netAmount: '76930',
                escrowAccountRef: 'ESC-2024-002'
            }),
            sentAt: new Date('2024-12-17T11:20:00Z').toISOString(),
            createdAt: new Date('2024-12-17T11:20:00Z').toISOString(),
        },
        {
            userId: 6,
            notificationType: 'push',
            title: 'Delivery Completed',
            message: 'Your order ORD-2024-003 has been delivered to your address in Abuja. Please confirm receipt and approve payment release to the seller.',
            isRead: 0,
            metadata: JSON.stringify({
                orderId: 3,
                orderNumber: 'ORD-2024-003',
                deliveryTime: '2024-12-18T14:30:00Z',
                deliveryAddress: 'Maitama District, Abuja',
                driverName: 'Ibrahim Mohammed'
            }),
            sentAt: new Date('2024-12-18T14:35:00Z').toISOString(),
            createdAt: new Date('2024-12-18T14:35:00Z').toISOString(),
        },
        {
            userId: 4,
            notificationType: 'sms',
            title: 'Low Stock Alert',
            message: 'Your product "Yellow Maize" is running low (15 bags remaining). Consider restocking to avoid missing out on orders.',
            isRead: 0,
            metadata: JSON.stringify({
                productId: 4,
                productName: 'Yellow Maize',
                currentStock: 15,
                alertThreshold: 20,
                recommendedRestock: 100
            }),
            sentAt: new Date('2024-12-19T08:00:00Z').toISOString(),
            createdAt: new Date('2024-12-19T08:00:00Z').toISOString(),
        },
        {
            userId: 7,
            notificationType: 'app',
            title: 'Delivery Delay Notice',
            message: 'Order ORD-2024-004 delivery has been delayed due to traffic on Lagos-Ibadan expressway. New estimated delivery: 6:00 PM today. We apologize for the inconvenience.',
            isRead: 1,
            metadata: JSON.stringify({
                orderId: 4,
                orderNumber: 'ORD-2024-004',
                originalTime: '2024-12-20T16:00:00Z',
                newEstimatedTime: '2024-12-20T18:00:00Z',
                delayReason: 'traffic',
                driverPhone: '0803-456-7890'
            }),
            sentAt: new Date('2024-12-20T15:30:00Z').toISOString(),
            createdAt: new Date('2024-12-20T15:30:00Z').toISOString(),
        },
        {
            userId: 2,
            notificationType: 'email',
            title: 'Payment Released',
            message: 'Congratulations! Payment of ₦52,400 for order ORD-2024-005 has been released from escrow to your account. Amount will reflect in your bank within 24 hours.',
            isRead: 0,
            metadata: JSON.stringify({
                orderId: 5,
                orderNumber: 'ORD-2024-005',
                amount: '52400',
                platformFee: '1048',
                logisticsFee: '2500',
                netAmount: '48852',
                payoutRef: 'PAY-2024-005',
                bankName: 'GTBank',
                accountNumber: '0123456789'
            }),
            sentAt: new Date('2024-12-21T16:45:00Z').toISOString(),
            createdAt: new Date('2024-12-21T16:45:00Z').toISOString(),
        },
        {
            userId: 10,
            notificationType: 'sms',
            title: 'Delivery Task Reminder',
            message: 'Reminder: You have a pending pickup for order ORD-2024-006 at Wuse Market, Abuja. Please complete pickup verification by 2:00 PM today.',
            isRead: 0,
            metadata: JSON.stringify({
                orderId: 6,
                orderNumber: 'ORD-2024-006',
                pickupAddress: 'Wuse Market, Abuja',
                pickupDeadline: '2024-12-22T14:00:00Z',
                sellerPhone: '0802-345-6789',
                deliveryFee: '4200'
            }),
            sentAt: new Date('2024-12-22T10:00:00Z').toISOString(),
            createdAt: new Date('2024-12-22T10:00:00Z').toISOString(),
        },
        {
            userId: 3,
            notificationType: 'app',
            title: 'New Order Received',
            message: 'You have received a new order ORD-2024-007 for 30 crates of tomatoes. Total amount: ₦24,000. Buyer location: Surulere, Lagos.',
            isRead: 0,
            metadata: JSON.stringify({
                orderId: 7,
                orderNumber: 'ORD-2024-007',
                amount: '24000',
                productName: 'Fresh Tomatoes',
                quantity: 30,
                buyerLocation: 'Surulere, Lagos',
                urgency: 'standard'
            }),
            sentAt: new Date('2024-12-23T09:15:00Z').toISOString(),
            createdAt: new Date('2024-12-23T09:15:00Z').toISOString(),
        },
        {
            userId: 1,
            notificationType: 'push',
            title: 'System Alert: High Order Volume',
            message: 'Platform experiencing high order volume today (45 orders in last 2 hours). All systems operational. Monitor escrow balances and delivery assignments.',
            isRead: 1,
            metadata: JSON.stringify({
                orderCount: 45,
                timeWindow: '2 hours',
                activeDrivers: 12,
                pendingVerifications: 8,
                escrowBalance: '1250000',
                alertLevel: 'info'
            }),
            sentAt: new Date('2024-12-24T12:00:00Z').toISOString(),
            createdAt: new Date('2024-12-24T12:00:00Z').toISOString(),
        },
        {
            userId: 5,
            notificationType: 'app',
            title: 'Driver Assignment Confirmed',
            message: 'Driver Ibrahim Mohammed has been assigned to your order ORD-2024-008. Pickup scheduled for tomorrow 9:00 AM. Track delivery in real-time.',
            isRead: 0,
            metadata: JSON.stringify({
                orderId: 8,
                orderNumber: 'ORD-2024-008',
                driverId: 9,
                driverName: 'Ibrahim Mohammed',
                driverPhone: '0805-678-9012',
                pickupTime: '2024-12-26T09:00:00Z',
                vehicleType: 'Van'
            }),
            sentAt: new Date('2024-12-25T17:30:00Z').toISOString(),
            createdAt: new Date('2024-12-25T17:30:00Z').toISOString(),
        },
        {
            userId: 4,
            notificationType: 'sms',
            title: 'Payment Received in Escrow',
            message: 'Payment of ₦92,000 for order ORD-2024-009 received. Prepare 100 bags of beans for pickup tomorrow at Mile 12 Market, Lagos.',
            isRead: 0,
            metadata: JSON.stringify({
                orderId: 9,
                orderNumber: 'ORD-2024-009',
                amount: '92000',
                productName: 'Brown Beans',
                quantity: 100,
                pickupAddress: 'Mile 12 Market, Lagos',
                pickupTime: '2024-12-27T08:00:00Z'
            }),
            sentAt: new Date('2024-12-26T14:20:00Z').toISOString(),
            createdAt: new Date('2024-12-26T14:20:00Z').toISOString(),
        },
        {
            userId: 2,
            notificationType: 'email',
            title: 'Seller Performance Update',
            message: 'Your seller rating this month: 4.8/5.0 stars (based on 23 completed orders). Total revenue: ₦456,000. Keep up the excellent service!',
            isRead: 1,
            metadata: JSON.stringify({
                rating: 4.8,
                totalOrders: 23,
                completedOrders: 23,
                totalRevenue: '456000',
                month: 'December 2024',
                topProduct: 'Local Rice',
                repeatCustomers: 8
            }),
            sentAt: new Date('2024-12-27T18:00:00Z').toISOString(),
            createdAt: new Date('2024-12-27T18:00:00Z').toISOString(),
        },
        {
            userId: 6,
            notificationType: 'app',
            title: 'Order Placed Successfully',
            message: 'Your order ORD-2024-010 has been placed successfully. Amount ₦35,500 is held in escrow. Seller will confirm within 2 hours.',
            isRead: 0,
            metadata: JSON.stringify({
                orderId: 10,
                orderNumber: 'ORD-2024-010',
                amount: '35500',
                productName: 'White Garri',
                quantity: 20,
                sellerName: 'Adekunle Farms',
                estimatedDelivery: '2024-12-29',
                escrowAccountRef: 'ESC-2024-010'
            }),
            sentAt: new Date('2024-12-28T11:45:00Z').toISOString(),
            createdAt: new Date('2024-12-28T11:45:00Z').toISOString(),
        },
    ];

    await db.insert(notifications).values(sampleNotifications);
    
    console.log('✅ Notifications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});