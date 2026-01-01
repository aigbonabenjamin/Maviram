import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { deliveryTasks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const taskId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { photos, qrCode } = body;

    // Validate photos array is required and not empty
    if (!photos) {
      return NextResponse.json(
        {
          error: 'Photos are required',
          code: 'MISSING_PHOTOS'
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(photos)) {
      return NextResponse.json(
        {
          error: 'Photos must be an array',
          code: 'INVALID_PHOTOS_FORMAT'
        },
        { status: 400 }
      );
    }

    if (photos.length === 0) {
      return NextResponse.json(
        {
          error: 'Photos array cannot be empty',
          code: 'EMPTY_PHOTOS_ARRAY'
        },
        { status: 400 }
      );
    }

    // Check if delivery task exists
    const existingTask = await db
      .select()
      .from(deliveryTasks)
      .where(eq(deliveryTasks.id, taskId))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        {
          error: 'Delivery task not found',
          code: 'TASK_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Update delivery task with pickup verification
    const updated = await db
      .update(deliveryTasks)
      .set({
        pickupVerificationPhotos: JSON.stringify(photos),
        pickupQrCode: qrCode || null,
        pickupVerifiedAt: new Date(),
        status: 'picked_up',
        updatedAt: new Date()
      })
      .where(eq(deliveryTasks.id, taskId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update delivery task',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    // Parse pickupVerificationPhotos back to array in response
    const updatedTask = {
      ...updated[0],
      pickupVerificationPhotos: updated[0].pickupVerificationPhotos
        ? JSON.parse(updated[0].pickupVerificationPhotos)
        : []
    };

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/delivery-tasks/[id]/verify-pickup error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error
      },
      { status: 500 }
    );
  }
}