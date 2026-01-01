import { db } from '@/db';
import { abandonedProcesses } from '@/db/schema';

async function main() {
    const sampleAbandonedProcesses = [
        {
            processType: 'order',
            entityId: 1,
            status: 'detected',
            detectedAt: new Date('2024-01-15T10:30:00').toISOString(),
            lastNotifiedAt: new Date('2024-01-15T10:35:00').toISOString(),
            resolvedAt: null,
            resolutionAction: null,
            metadata: JSON.stringify({
                stuckState: 'payment_pending',
                reason: 'Buyer has not completed payment after 24 hours',
                orderNumber: 'ORD-2024-001',
                buyerId: 1,
                totalAmount: '50000.00',
                notificationsSent: 2
            }),
            createdAt: new Date('2024-01-15T10:30:00').toISOString(),
            updatedAt: new Date('2024-01-15T10:35:00').toISOString(),
        },
        {
            processType: 'delivery_task',
            entityId: 2,
            status: 'notified',
            detectedAt: new Date('2024-01-16T14:20:00').toISOString(),
            lastNotifiedAt: new Date('2024-01-16T16:20:00').toISOString(),
            resolvedAt: null,
            resolutionAction: null,
            metadata: JSON.stringify({
                stuckState: 'in_transit',
                reason: 'Driver has not updated delivery status for 48 hours',
                orderId: 2,
                driverId: 3,
                assignedAt: '2024-01-14T09:00:00Z',
                notificationsSent: 3,
                escalationLevel: 1
            }),
            createdAt: new Date('2024-01-16T14:20:00').toISOString(),
            updatedAt: new Date('2024-01-16T16:20:00').toISOString(),
        },
        {
            processType: 'order',
            entityId: 3,
            status: 'escalated',
            detectedAt: new Date('2024-01-17T08:15:00').toISOString(),
            lastNotifiedAt: new Date('2024-01-18T10:00:00').toISOString(),
            resolvedAt: null,
            resolutionAction: null,
            metadata: JSON.stringify({
                stuckState: 'verification_pending',
                reason: 'Product verification pending for more than 72 hours',
                orderNumber: 'ORD-2024-003',
                sellerId: 2,
                productId: 3,
                notificationsSent: 5,
                escalationLevel: 2,
                escalatedToAdmin: true
            }),
            createdAt: new Date('2024-01-17T08:15:00').toISOString(),
            updatedAt: new Date('2024-01-18T10:00:00').toISOString(),
        },
        {
            processType: 'transaction',
            entityId: 4,
            status: 'resolved',
            detectedAt: new Date('2024-01-18T11:30:00').toISOString(),
            lastNotifiedAt: new Date('2024-01-18T15:45:00').toISOString(),
            resolvedAt: new Date('2024-01-19T09:20:00').toISOString(),
            resolutionAction: 'manual_payout_processed',
            metadata: JSON.stringify({
                stuckState: 'payout_failed',
                reason: 'Automated payout to seller failed due to bank account issues',
                orderId: 4,
                sellerId: 2,
                amount: '75000.00',
                notificationsSent: 4,
                resolutionDetails: 'Seller updated bank account details, manual payout initiated and completed',
                resolvedBy: 'admin_user_1'
            }),
            createdAt: new Date('2024-01-18T11:30:00').toISOString(),
            updatedAt: new Date('2024-01-19T09:20:00').toISOString(),
        },
        {
            processType: 'delivery_task',
            entityId: 5,
            status: 'detected',
            detectedAt: new Date('2024-01-19T13:45:00').toISOString(),
            lastNotifiedAt: new Date('2024-01-19T13:50:00').toISOString(),
            resolvedAt: null,
            resolutionAction: null,
            metadata: JSON.stringify({
                stuckState: 'pickup_pending',
                reason: 'Driver assigned but has not picked up items within 12 hours',
                orderId: 5,
                driverId: 4,
                sellerId: 1,
                pickupAddress: '123 Market Street, Lagos',
                notificationsSent: 1
            }),
            createdAt: new Date('2024-01-19T13:45:00').toISOString(),
            updatedAt: new Date('2024-01-19T13:50:00').toISOString(),
        },
        {
            processType: 'order',
            entityId: 6,
            status: 'resolved',
            detectedAt: new Date('2024-01-20T09:00:00').toISOString(),
            lastNotifiedAt: new Date('2024-01-20T12:00:00').toISOString(),
            resolvedAt: new Date('2024-01-20T16:30:00').toISOString(),
            resolutionAction: 'buyer_approved_delivery',
            metadata: JSON.stringify({
                stuckState: 'buyer_approval_pending',
                reason: 'Buyer has not approved delivery for 36 hours after delivery completion',
                orderNumber: 'ORD-2024-006',
                buyerId: 2,
                deliveredAt: '2024-01-19T10:00:00Z',
                notificationsSent: 3,
                resolutionDetails: 'Buyer contacted via phone and approved delivery'
            }),
            createdAt: new Date('2024-01-20T09:00:00').toISOString(),
            updatedAt: new Date('2024-01-20T16:30:00').toISOString(),
        },
        {
            processType: 'activity_log',
            entityId: 7,
            status: 'notified',
            detectedAt: new Date('2024-01-21T07:30:00').toISOString(),
            lastNotifiedAt: new Date('2024-01-21T11:30:00').toISOString(),
            resolvedAt: null,
            resolutionAction: null,
            metadata: JSON.stringify({
                stuckState: 'duplicate_entries',
                reason: 'Multiple duplicate activity log entries detected for single action',
                userId: 3,
                activityType: 'order_placed',
                duplicateCount: 5,
                timeRange: '2024-01-21T07:00:00Z to 2024-01-21T07:05:00Z',
                notificationsSent: 2,
                requiresCleanup: true
            }),
            createdAt: new Date('2024-01-21T07:30:00').toISOString(),
            updatedAt: new Date('2024-01-21T11:30:00').toISOString(),
        },
        {
            processType: 'transaction',
            entityId: 8,
            status: 'escalated',
            detectedAt: new Date('2024-01-22T10:15:00').toISOString(),
            lastNotifiedAt: new Date('2024-01-23T09:00:00').toISOString(),
            resolvedAt: null,
            resolutionAction: null,
            metadata: JSON.stringify({
                stuckState: 'escrow_release_pending',
                reason: 'Funds in escrow but release conditions not triggered after 5 days',
                orderId: 8,
                buyerId: 1,
                sellerId: 3,
                amount: '120000.00',
                escrowStatus: 'held',
                deliveryCompleted: true,
                buyerApprovalPending: false,
                notificationsSent: 6,
                escalationLevel: 2,
                requiresManualReview: true
            }),
            createdAt: new Date('2024-01-22T10:15:00').toISOString(),
            updatedAt: new Date('2024-01-23T09:00:00').toISOString(),
        }
    ];

    await db.insert(abandonedProcesses).values(sampleAbandonedProcesses);
    
    console.log('✅ Abandoned processes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});