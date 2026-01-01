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

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid delivery task ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const taskId = parseInt(id);

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    const { signature, photos } = requestBody;

    // Validate signature is required
    if (!signature || typeof signature !== 'string' || signature.trim() === '') {
      return NextResponse.json(
        {
          error: 'Signature is required and must be a valid base64 string',
          code: 'MISSING_SIGNATURE'
        },
        { status: 400 }
      );
    }

    // Validate photos array is required and not empty
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        {
          error: 'Photos array is required and must not be empty',
          code: 'MISSING_PHOTOS'
        },
        { status: 400 }
      );
    }

    // Validate photos array contains valid strings
    if (!photos.every(photo => typeof photo === 'string' && photo.trim() !== '')) {
      return NextResponse.json(
        {
          error: 'All photos must be valid non-empty strings',
          code: 'INVALID_PHOTOS_FORMAT'
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

    // Update delivery task
    const now = new Date();
    const updatedTask = await db
      .update(deliveryTasks)
      .set({
        deliverySignature: signature.trim(),
        deliveryPhotos: JSON.stringify(photos),
        deliveryVerifiedAt: now,
        status: 'delivered',
        updatedAt: now
      })
      .where(eq(deliveryTasks.id, taskId))
      .returning();

    if (updatedTask.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update delivery task',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    // Parse deliveryPhotos back to array in response
    const responseTask = {
      ...updatedTask[0],
      deliveryPhotos: updatedTask[0].deliveryPhotos 
        ? JSON.parse(updatedTask[0].deliveryPhotos) 
        : []
    };

    return NextResponse.json(responseTask, { status: 200 });

  } catch (error) {
    console.error('PATCH /api/delivery-tasks/[id]/verify-delivery error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}