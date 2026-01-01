import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { abandonedProcesses, activityLogs } from '@/db/schema';
import { eq, and, lt, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      processTypes = ['order', 'delivery_task', 'transaction', 'activity_log'],
      olderThanDays = 30,
      dryRun = false
    } = body;

    // Validate olderThanDays
    if (!Number.isInteger(olderThanDays) || olderThanDays <= 0) {
      return NextResponse.json({
        error: 'olderThanDays must be a positive integer',
        code: 'INVALID_OLDER_THAN_DAYS'
      }, { status: 400 });
    }

    // Validate processTypes
    const validProcessTypes = ['order', 'delivery_task', 'transaction', 'activity_log'];
    if (!Array.isArray(processTypes) || processTypes.length === 0) {
      return NextResponse.json({
        error: 'processTypes must be a non-empty array',
        code: 'INVALID_PROCESS_TYPES'
      }, { status: 400 });
    }

    for (const type of processTypes) {
      if (!validProcessTypes.includes(type)) {
        return NextResponse.json({
          error: `Invalid process type: ${type}. Valid types are: ${validProcessTypes.join(', ')}`,
          code: 'INVALID_PROCESS_TYPE'
        }, { status: 400 });
      }
    }

    const cleanedAt = new Date().toISOString();
    const cleanupResults = {
      abandonedProcessesDeleted: 0,
      byType: {
        order: 0,
        delivery_task: 0,
        transaction: 0,
        activity_log: 0
      },
      activityLogsArchived: 0,
      olderThanDays,
      dryRun
    };

    if (dryRun) {
      // Dry run: Count records that would be deleted
      let abandonedProcessCount = 0;
      let activityLogsCount = 0;

      // Count abandoned processes
      for (const processType of processTypes) {
        const countResult = await db.execute(sql`
          SELECT COUNT(*) as count
          FROM ${abandonedProcesses}
          WHERE ${abandonedProcesses.processType} = ${processType}
          AND ${abandonedProcesses.status} = 'resolved'
          AND ${abandonedProcesses.resolvedAt} < DATE_SUB(NOW(), INTERVAL ${olderThanDays} DAY)
        `);
        const count = Number((countResult.rows[0] as any).count || 0);
        abandonedProcessCount += count;
      }

      // Count activity logs if included
      if (processTypes.includes('activity_log')) {
        const activityCountResult = await db.execute(sql`
          SELECT COUNT(*) as count
          FROM ${activityLogs}
          WHERE ${activityLogs.createdAt} < DATE_SUB(NOW(), INTERVAL 90 DAY)
        `);
        activityLogsCount = Number((activityCountResult.rows[0] as any).count || 0);
      }

      return NextResponse.json({
        success: true,
        dryRun: true,
        wouldDelete: {
          abandonedProcesses: abandonedProcessCount,
          activityLogs: activityLogsCount
        },
        message: 'Dry run completed - no data was deleted'
      }, { status: 200 });
    }

    // Actual cleanup operations
    for (const processType of processTypes) {
      try {
        // Delete resolved abandoned processes older than specified days
        const deleteResult = await db.execute(sql`
          DELETE FROM ${abandonedProcesses}
          WHERE ${abandonedProcesses.processType} = ${processType}
          AND ${abandonedProcesses.status} = 'resolved'
          AND ${abandonedProcesses.resolvedAt} < DATE_SUB(NOW(), INTERVAL ${olderThanDays} DAY)
        `);

        const deletedCount = (deleteResult as any).rowsAffected || 0;
        cleanupResults.byType[processType as keyof typeof cleanupResults.byType] = deletedCount;
        cleanupResults.abandonedProcessesDeleted += deletedCount;

        // If processType is activity_log, also delete actual activity logs older than 90 days
        if (processType === 'activity_log') {
          const activityDeleteResult = await db.execute(sql`
            DELETE FROM ${activityLogs}
            WHERE ${activityLogs.createdAt} < DATE_SUB(NOW(), INTERVAL 90 DAY)
          `);

          cleanupResults.activityLogsArchived = (activityDeleteResult as any).rowsAffected || 0;
        }
      } catch (error) {
        console.error(`Error cleaning up ${processType}:`, error);
        // Continue with other process types even if one fails
      }
    }

    // Log the cleanup operation to activity logs
    try {
      await db.insert(activityLogs).values({
        userId: null,
        userRole: 'system',
        activityType: 'garbage_collection',
        entityType: 'abandoned_processes',
        entityId: null,
        description: `Automatic cleanup: Deleted ${cleanupResults.abandonedProcessesDeleted} abandoned processes and ${cleanupResults.activityLogsArchived} activity logs`,
        metadata: JSON.stringify({
          cleanupResults,
          processTypes,
          olderThanDays,
          cleanedAt
        }),
        createdAt: new Date()
      });
    } catch (logError) {
      console.error('Error logging cleanup operation:', logError);
      // Don't fail the cleanup if logging fails
    }

    return NextResponse.json({
      success: true,
      cleanupResults,
      message: 'Cleanup completed successfully',
      cleanedAt
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}