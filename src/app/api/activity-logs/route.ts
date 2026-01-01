import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { activityLogs } from '@/db/schema';
import { eq, and, gte, lte, like, sql } from 'drizzle-orm';

const VALID_USER_ROLES = ['admin', 'buyer', 'seller', 'driver'];

function parseMetadata(metadata: string | null): any {
  if (!metadata) return null;
  try {
    return JSON.parse(metadata);
  } catch {
    return metadata;
  }
}

function stringifyMetadata(metadata: any): string | null {
  if (!metadata) return null;
  if (typeof metadata === 'string') {
    try {
      JSON.parse(metadata);
      return metadata;
    } catch {
      return JSON.stringify(metadata);
    }
  }
  return JSON.stringify(metadata);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        }, { status: 400 });
      }

      const log = await db.select()
        .from(activityLogs)
        .where(eq(activityLogs.id, parseInt(id)))
        .limit(1);

      if (log.length === 0) {
        return NextResponse.json({
          error: 'Activity log not found',
          code: 'NOT_FOUND'
        }, { status: 404 });
      }

      const result = {
        ...log[0],
        metadata: parseMetadata(log[0].metadata)
      };

      return NextResponse.json(result);
    }

    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    const activityType = searchParams.get('activityType');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const conditions = [];

    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({
          error: 'Valid userId must be an integer',
          code: 'INVALID_USER_ID'
        }, { status: 400 });
      }
      conditions.push(eq(activityLogs.userId, parseInt(userId)));
    }

    if (userRole) {
      if (!VALID_USER_ROLES.includes(userRole)) {
        return NextResponse.json({
          error: `User role must be one of: ${VALID_USER_ROLES.join(', ')}`,
          code: 'INVALID_USER_ROLE'
        }, { status: 400 });
      }
      conditions.push(eq(activityLogs.userRole, userRole));
    }

    if (activityType) {
      conditions.push(eq(activityLogs.activityType, activityType));
    }

    if (entityType) {
      conditions.push(eq(activityLogs.entityType, entityType));
    }

    if (entityId) {
      if (isNaN(parseInt(entityId))) {
        return NextResponse.json({
          error: 'Valid entityId must be an integer',
          code: 'INVALID_ENTITY_ID'
        }, { status: 400 });
      }
      conditions.push(eq(activityLogs.entityId, parseInt(entityId)));
    }

    if (startDate) {
      try {
        const date = new Date(startDate);
        if (isNaN(date.getTime())) {
          return NextResponse.json({
            error: 'Invalid startDate format. Use ISO date string',
            code: 'INVALID_START_DATE'
          }, { status: 400 });
        }
        conditions.push(gte(activityLogs.createdAt, date));
      } catch {
        return NextResponse.json({
          error: 'Invalid startDate format. Use ISO date string',
          code: 'INVALID_START_DATE'
        }, { status: 400 });
      }
    }

    if (endDate) {
      try {
        const date = new Date(endDate);
        if (isNaN(date.getTime())) {
          return NextResponse.json({
            error: 'Invalid endDate format. Use ISO date string',
            code: 'INVALID_END_DATE'
          }, { status: 400 });
        }
        conditions.push(lte(activityLogs.createdAt, date));
      } catch {
        return NextResponse.json({
          error: 'Invalid endDate format. Use ISO date string',
          code: 'INVALID_END_DATE'
        }, { status: 400 });
      }
    }

    if (search) {
      conditions.push(sql`LOWER(${activityLogs.description}) LIKE LOWER(${`%${search}%`})`);
    }

    let query = db.select().from(activityLogs);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(sql`${activityLogs.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    const parsedResults = results.map(log => ({
      ...log,
      metadata: parseMetadata(log.metadata)
    }));

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      userRole,
      activityType,
      entityType,
      entityId,
      description,
      ipAddress,
      userAgent,
      metadata
    } = body;

    if (!activityType) {
      return NextResponse.json({
        error: 'activityType is required',
        code: 'MISSING_ACTIVITY_TYPE'
      }, { status: 400 });
    }

    if (activityType.length > 50) {
      return NextResponse.json({
        error: 'activityType must not exceed 50 characters',
        code: 'ACTIVITY_TYPE_TOO_LONG'
      }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({
        error: 'description is required',
        code: 'MISSING_DESCRIPTION'
      }, { status: 400 });
    }

    if (typeof description === 'string' && description.trim() === '') {
      return NextResponse.json({
        error: 'description cannot be empty',
        code: 'EMPTY_DESCRIPTION'
      }, { status: 400 });
    }

    if (userRole && !VALID_USER_ROLES.includes(userRole)) {
      return NextResponse.json({
        error: `userRole must be one of: ${VALID_USER_ROLES.join(', ')}`,
        code: 'INVALID_USER_ROLE'
      }, { status: 400 });
    }

    if (userId !== undefined && userId !== null) {
      if (typeof userId !== 'number' || isNaN(userId)) {
        return NextResponse.json({
          error: 'userId must be a valid integer',
          code: 'INVALID_USER_ID'
        }, { status: 400 });
      }
    }

    if (entityId !== undefined && entityId !== null) {
      if (typeof entityId !== 'number' || isNaN(entityId)) {
        return NextResponse.json({
          error: 'entityId must be a valid integer',
          code: 'INVALID_ENTITY_ID'
        }, { status: 400 });
      }
    }

    if (ipAddress && ipAddress.length > 45) {
      return NextResponse.json({
        error: 'ipAddress must not exceed 45 characters',
        code: 'IP_ADDRESS_TOO_LONG'
      }, { status: 400 });
    }

    let processedMetadata = null;
    if (metadata !== undefined && metadata !== null) {
      try {
        processedMetadata = stringifyMetadata(metadata);
      } catch {
        return NextResponse.json({
          error: 'metadata must be valid JSON',
          code: 'INVALID_METADATA'
        }, { status: 400 });
      }
    }

    await db.insert(activityLogs)
      .values({
        userId: userId || null,
        userRole: userRole || null,
        activityType: activityType.trim(),
        entityType: entityType?.trim() || null,
        entityId: entityId || null,
        description: description.trim(),
        ipAddress: ipAddress?.trim() || null,
        userAgent: userAgent || null,
        metadata: processedMetadata,
        createdAt: new Date()
      });

    const lastInserted = await db.execute(sql`SELECT * FROM activity_logs ORDER BY id DESC LIMIT 1`);
    const newLog = Array.isArray(lastInserted) && lastInserted.length > 0 ? lastInserted[0] : [];
    const logData = Array.isArray(newLog) && newLog.length > 0 ? newLog[0] : null;

    if (!logData) {
      return NextResponse.json({
        error: 'Failed to retrieve created activity log',
        code: 'CREATION_FAILED'
      }, { status: 500 });
    }

    const result = {
      ...logData,
      metadata: parseMetadata(logData.metadata)
    };

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: 'ID is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    if (isNaN(parseInt(id))) {
      return NextResponse.json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(activityLogs)
      .where(eq(activityLogs.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        error: 'Activity log not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    const logToDelete = {
      ...existing[0],
      metadata: parseMetadata(existing[0].metadata)
    };

    await db.delete(activityLogs)
      .where(eq(activityLogs.id, parseInt(id)));

    return NextResponse.json({
      message: 'Activity log deleted successfully',
      data: logToDelete
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}