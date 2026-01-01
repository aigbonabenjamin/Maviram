import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { abandonedProcesses, orders, deliveryTasks, transactions, activityLogs } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

interface ScanRequestBody {
  processTypes?: string[];
  dryRun?: boolean;
}

interface ProcessResult {
  found: number;
  newDetections: number;
  alreadyTracked: number;
}

interface ScanResults {
  [key: string]: ProcessResult;
}

const VALID_PROCESS_TYPES = ['order', 'delivery_task', 'transaction', 'activity_log'];

export async function POST(request: NextRequest) {
  try {
    const body: ScanRequestBody = await request.json();
    const { processTypes = VALID_PROCESS_TYPES, dryRun = false } = body;

    // Validate processTypes
    if (processTypes.some(type => !VALID_PROCESS_TYPES.includes(type))) {
      return NextResponse.json(
        { 
          error: 'Invalid process types provided. Valid types are: order, delivery_task, transaction, activity_log',
          code: 'INVALID_PROCESS_TYPES'
        },
        { status: 400 }
      );
    }

    const scanResults: ScanResults = {};
    let totalFound = 0;
    let totalNewDetections = 0;
    const scannedAt = new Date().toISOString();

    // Scan for abandoned orders (stuck in 'pending' or 'payment_received' for more than 24 hours)
    if (processTypes.includes('order')) {
      const abandonedOrders = await db.execute(sql`
        SELECT id, orderNumber, buyerId, totalAmount, status, paymentStatus, createdAt
        FROM orders
        WHERE status IN ('pending', 'payment_received')
        AND TIMESTAMPDIFF(HOUR, createdAt, NOW()) > 24
      `);

      const found = abandonedOrders.rows.length;
      let newDetections = 0;
      let alreadyTracked = 0;

      for (const order of abandonedOrders.rows) {
        // Check if already tracked
        const existing = await db.select()
          .from(abandonedProcesses)
          .where(
            and(
              eq(abandonedProcesses.processType, 'order'),
              eq(abandonedProcesses.entityId, order.id as number),
              eq(abandonedProcesses.status, 'detected')
            )
          )
          .limit(1);

        if (existing.length > 0) {
          alreadyTracked++;
        } else {
          // Check if previously resolved
          const resolved = await db.select()
            .from(abandonedProcesses)
            .where(
              and(
                eq(abandonedProcesses.processType, 'order'),
                eq(abandonedProcesses.entityId, order.id as number),
                eq(abandonedProcesses.status, 'resolved')
              )
            )
            .limit(1);

          newDetections++;

          if (!dryRun) {
            await db.insert(abandonedProcesses).values({
              processType: 'order',
              entityId: order.id as number,
              status: 'detected',
              detectedAt: new Date(),
              metadata: JSON.stringify({
                orderNumber: order.orderNumber,
                buyerId: order.buyerId,
                totalAmount: order.totalAmount,
                status: order.status,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt,
                hoursStuck: Math.floor((Date.now() - new Date(order.createdAt as string).getTime()) / (1000 * 60 * 60))
              }),
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      }

      scanResults.order = { found, newDetections, alreadyTracked };
      totalFound += found;
      totalNewDetections += newDetections;
    }

    // Scan for abandoned delivery tasks (stuck in 'assigned' or 'picked_up' for more than 48 hours)
    if (processTypes.includes('delivery_task')) {
      const abandonedDeliveries = await db.execute(sql`
        SELECT id, orderId, driverId, sellerId, status, assignedAt, createdAt
        FROM delivery_tasks
        WHERE status IN ('assigned', 'picked_up')
        AND TIMESTAMPDIFF(HOUR, createdAt, NOW()) > 48
      `);

      const found = abandonedDeliveries.rows.length;
      let newDetections = 0;
      let alreadyTracked = 0;

      for (const task of abandonedDeliveries.rows) {
        // Check if already tracked
        const existing = await db.select()
          .from(abandonedProcesses)
          .where(
            and(
              eq(abandonedProcesses.processType, 'delivery_task'),
              eq(abandonedProcesses.entityId, task.id as number),
              eq(abandonedProcesses.status, 'detected')
            )
          )
          .limit(1);

        if (existing.length > 0) {
          alreadyTracked++;
        } else {
          newDetections++;

          if (!dryRun) {
            await db.insert(abandonedProcesses).values({
              processType: 'delivery_task',
              entityId: task.id as number,
              status: 'detected',
              detectedAt: new Date(),
              metadata: JSON.stringify({
                orderId: task.orderId,
                driverId: task.driverId,
                sellerId: task.sellerId,
                status: task.status,
                assignedAt: task.assignedAt,
                createdAt: task.createdAt,
                hoursStuck: Math.floor((Date.now() - new Date(task.createdAt as string).getTime()) / (1000 * 60 * 60))
              }),
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      }

      scanResults.delivery_task = { found, newDetections, alreadyTracked };
      totalFound += found;
      totalNewDetections += newDetections;
    }

    // Scan for abandoned transactions (in 'pending' status for more than 1 hour)
    if (processTypes.includes('transaction')) {
      const abandonedTransactions = await db.execute(sql`
        SELECT id, orderId, buyerId, sellerId, amount, status, transactionType, createdAt
        FROM transactions
        WHERE status = 'pending'
        AND TIMESTAMPDIFF(HOUR, createdAt, NOW()) > 1
      `);

      const found = abandonedTransactions.rows.length;
      let newDetections = 0;
      let alreadyTracked = 0;

      for (const txn of abandonedTransactions.rows) {
        // Check if already tracked
        const existing = await db.select()
          .from(abandonedProcesses)
          .where(
            and(
              eq(abandonedProcesses.processType, 'transaction'),
              eq(abandonedProcesses.entityId, txn.id as number),
              eq(abandonedProcesses.status, 'detected')
            )
          )
          .limit(1);

        if (existing.length > 0) {
          alreadyTracked++;
        } else {
          newDetections++;

          if (!dryRun) {
            await db.insert(abandonedProcesses).values({
              processType: 'transaction',
              entityId: txn.id as number,
              status: 'detected',
              detectedAt: new Date(),
              metadata: JSON.stringify({
                orderId: txn.orderId,
                buyerId: txn.buyerId,
                sellerId: txn.sellerId,
                amount: txn.amount,
                status: txn.status,
                transactionType: txn.transactionType,
                createdAt: txn.createdAt,
                hoursStuck: Math.floor((Date.now() - new Date(txn.createdAt as string).getTime()) / (1000 * 60 * 60))
              }),
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      }

      scanResults.transaction = { found, newDetections, alreadyTracked };
      totalFound += found;
      totalNewDetections += newDetections;
    }

    // Scan for old activity logs (older than 90 days for archival)
    if (processTypes.includes('activity_log')) {
      const oldActivityLogs = await db.execute(sql`
        SELECT id, userId, activityType, entityType, entityId, createdAt
        FROM activity_logs
        WHERE TIMESTAMPDIFF(DAY, createdAt, NOW()) > 90
      `);

      const found = oldActivityLogs.rows.length;
      let newDetections = 0;
      let alreadyTracked = 0;

      for (const log of oldActivityLogs.rows) {
        // Check if already tracked
        const existing = await db.select()
          .from(abandonedProcesses)
          .where(
            and(
              eq(abandonedProcesses.processType, 'activity_log'),
              eq(abandonedProcesses.entityId, log.id as number),
              eq(abandonedProcesses.status, 'detected')
            )
          )
          .limit(1);

        if (existing.length > 0) {
          alreadyTracked++;
        } else {
          newDetections++;

          if (!dryRun) {
            await db.insert(abandonedProcesses).values({
              processType: 'activity_log',
              entityId: log.id as number,
              status: 'detected',
              detectedAt: new Date(),
              metadata: JSON.stringify({
                userId: log.userId,
                activityType: log.activityType,
                entityType: log.entityType,
                entityId: log.entityId,
                createdAt: log.createdAt,
                daysOld: Math.floor((Date.now() - new Date(log.createdAt as string).getTime()) / (1000 * 60 * 60 * 24))
              }),
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      }

      scanResults.activity_log = { found, newDetections, alreadyTracked };
      totalFound += found;
      totalNewDetections += newDetections;
    }

    return NextResponse.json({
      success: true,
      scanResults,
      totalFound,
      totalNewDetections,
      dryRun,
      scannedAt
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'SCAN_ERROR'
      },
      { status: 500 }
    );
  }
}