import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { abandonedProcesses } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID is valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const processId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { status, resolutionAction } = body;

    // Validate required status field
    if (!status) {
      return NextResponse.json(
        {
          error: 'Status is required',
          code: 'MISSING_STATUS'
        },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['notified', 'resolved', 'escalated'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'Status must be one of: notified, resolved, escalated',
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Validate resolutionAction is required when status is 'resolved'
    if (status === 'resolved' && (!resolutionAction || resolutionAction.trim() === '')) {
      return NextResponse.json(
        {
          error: 'Resolution action is required when status is resolved',
          code: 'MISSING_RESOLUTION_ACTION'
        },
        { status: 400 }
      );
    }

    // Check if abandoned process exists
    const existingProcess = await db
      .select()
      .from(abandonedProcesses)
      .where(eq(abandonedProcesses.id, processId))
      .limit(1);

    if (existingProcess.length === 0) {
      return NextResponse.json(
        {
          error: 'Abandoned process not found',
          code: 'PROCESS_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const currentProcess = existingProcess[0];

    // Validate status transition - cannot transition from 'resolved' to other statuses
    if (currentProcess.status === 'resolved') {
      return NextResponse.json(
        {
          error: 'Cannot update a resolved abandoned process',
          code: 'INVALID_STATUS_TRANSITION'
        },
        { status: 400 }
      );
    }

    // Prepare update data based on status
    const now = new Date().toISOString();
    const updateData: any = {
      status,
      updatedAt: now
    };

    if (status === 'notified') {
      updateData.lastNotifiedAt = now;
    } else if (status === 'resolved') {
      updateData.resolvedAt = now;
      updateData.resolutionAction = resolutionAction.trim();
    } else if (status === 'escalated') {
      updateData.lastNotifiedAt = now;
    }

    // Update the record
    const updated = await db
      .update(abandonedProcesses)
      .set(updateData)
      .where(eq(abandonedProcesses.id, processId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update abandoned process',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    // Parse metadata JSON if exists
    const updatedProcess = updated[0];
    let parsedMetadata = null;
    if (updatedProcess.metadata) {
      try {
        parsedMetadata = JSON.parse(updatedProcess.metadata);
      } catch (e) {
        parsedMetadata = updatedProcess.metadata;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...updatedProcess,
          metadata: parsedMetadata
        },
        message: 'Abandoned process updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method not allowed. Use PUT instead.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  );
}