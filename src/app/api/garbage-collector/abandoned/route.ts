import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { abandonedProcesses } from '@/db/schema';
import { eq, and, desc, asc, sql, or } from 'drizzle-orm';

const VALID_PROCESS_TYPES = ['order', 'delivery_task', 'transaction', 'activity_log'];
const VALID_STATUSES = ['detected', 'notified', 'resolved', 'escalated'];
const VALID_SORT_FIELDS = ['detectedAt', 'createdAt', 'updatedAt', 'lastNotifiedAt', 'resolvedAt'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract and validate query parameters
    const processType = searchParams.get('processType');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'detectedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate processType
    if (processType && !VALID_PROCESS_TYPES.includes(processType)) {
      return NextResponse.json({
        error: `Invalid processType. Must be one of: ${VALID_PROCESS_TYPES.join(', ')}`,
        code: 'INVALID_PROCESS_TYPE'
      }, { status: 400 });
    }

    // Validate status
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        code: 'INVALID_STATUS'
      }, { status: 400 });
    }

    // Validate sortBy
    if (!VALID_SORT_FIELDS.includes(sortBy)) {
      return NextResponse.json({
        error: `Invalid sortBy field. Must be one of: ${VALID_SORT_FIELDS.join(', ')}`,
        code: 'INVALID_SORT_FIELD'
      }, { status: 400 });
    }

    // Validate sortOrder
    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      return NextResponse.json({
        error: "Invalid sortOrder. Must be 'asc' or 'desc'",
        code: 'INVALID_SORT_ORDER'
      }, { status: 400 });
    }

    // Validate pagination parameters
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({
        error: 'Invalid limit parameter',
        code: 'INVALID_LIMIT'
      }, { status: 400 });
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({
        error: 'Invalid offset parameter',
        code: 'INVALID_OFFSET'
      }, { status: 400 });
    }

    // Build WHERE conditions
    const conditions = [];
    if (processType) {
      conditions.push(eq(abandonedProcesses.processType, processType));
    }
    if (status) {
      conditions.push(eq(abandonedProcesses.status, status));
    }

    // Build main query
    let query = db.select().from(abandonedProcesses);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = abandonedProcesses[sortBy as keyof typeof abandonedProcesses];
    if (sortOrder === 'desc') {
      query = query.orderBy(desc(sortColumn));
    } else {
      query = query.orderBy(asc(sortColumn));
    }

    // Apply pagination
    const results = await query.limit(limit + 1).offset(offset);

    // Check if there are more results
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    // Parse metadata JSON for each record
    const parsedData = data.map(record => ({
      ...record,
      metadata: record.metadata ? JSON.parse(record.metadata) : null
    }));

    // Get summary counts
    // Total count
    const totalCountQuery = db.select({ count: sql<number>`count(*)` })
      .from(abandonedProcesses);
    
    const totalCountConditions = [];
    if (processType) {
      totalCountConditions.push(eq(abandonedProcesses.processType, processType));
    }
    if (status) {
      totalCountConditions.push(eq(abandonedProcesses.status, status));
    }

    const totalResult = await (totalCountConditions.length > 0 
      ? totalCountQuery.where(and(...totalCountConditions))
      : totalCountQuery);
    const total = totalResult[0]?.count || 0;

    // Count by status
    const statusCountsQuery = db.select({
      status: abandonedProcesses.status,
      count: sql<number>`count(*)`
    })
    .from(abandonedProcesses)
    .groupBy(abandonedProcesses.status);

    const statusCounts = await (processType 
      ? statusCountsQuery.where(eq(abandonedProcesses.processType, processType))
      : statusCountsQuery);

    const byStatus: Record<string, number> = {};
    statusCounts.forEach(row => {
      byStatus[row.status] = row.count;
    });

    // Count by type
    const typeCountsQuery = db.select({
      processType: abandonedProcesses.processType,
      count: sql<number>`count(*)`
    })
    .from(abandonedProcesses)
    .groupBy(abandonedProcesses.processType);

    const typeCounts = await (status 
      ? typeCountsQuery.where(eq(abandonedProcesses.status, status))
      : typeCountsQuery);

    const byType: Record<string, number> = {};
    typeCounts.forEach(row => {
      byType[row.processType] = row.count;
    });

    return NextResponse.json({
      success: true,
      data: parsedData,
      summary: {
        total,
        byStatus,
        byType
      },
      pagination: {
        limit,
        offset,
        hasMore
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET abandoned processes error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}