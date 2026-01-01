import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { activityLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const logId = parseInt(id);

    // Query database for activity log with matching id
    const result = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.id, logId))
      .limit(1);

    // Return 404 if log not found
    if (result.length === 0) {
      return NextResponse.json(
        {
          error: 'Activity log not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const activityLog = result[0];

    // Parse metadata field as JSON if it's a string
    let parsedLog = { ...activityLog };
    if (activityLog.metadata && typeof activityLog.metadata === 'string') {
      try {
        parsedLog.metadata = JSON.parse(activityLog.metadata);
      } catch (error) {
        console.error('Failed to parse metadata JSON:', error);
        // Keep original string if parsing fails
      }
    }

    return NextResponse.json(parsedLog, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const logId = parseInt(id);

    const existingLog = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.id, logId))
      .limit(1);

    if (existingLog.length === 0) {
      return NextResponse.json(
        {
          error: 'Activity log not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    let deletedLog = { ...existingLog[0] };
    if (deletedLog.metadata && typeof deletedLog.metadata === 'string') {
      try {
        deletedLog.metadata = JSON.parse(deletedLog.metadata);
      } catch (error) {
        console.error('Failed to parse metadata JSON:', error);
      }
    }

    await db
      .delete(activityLogs)
      .where(eq(activityLogs.id, logId));

    return NextResponse.json(
      {
        message: 'Activity log deleted successfully',
        deletedLog: deletedLog,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
      },
      { status: 500 }
    );
  }
}