import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { deliveryTasks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
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

    const deliveryTask = await db
      .select()
      .from(deliveryTasks)
      .where(eq(deliveryTasks.id, parseInt(id)))
      .limit(1);

    if (deliveryTask.length === 0) {
      return NextResponse.json(
        {
          error: 'Delivery task not found',
          code: 'DELIVERY_TASK_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const task = deliveryTask[0];

    const parsedTask = {
      ...task,
      pickupVerificationPhotos: task.pickupVerificationPhotos
        ? JSON.parse(task.pickupVerificationPhotos)
        : null,
      deliveryPhotos: task.deliveryPhotos
        ? JSON.parse(task.deliveryPhotos)
        : null,
    };

    return NextResponse.json(parsedTask, { status: 200 });
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

export async function PUT(
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

    const existingTask = await db
      .select()
      .from(deliveryTasks)
      .where(eq(deliveryTasks.id, parseInt(id)))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        {
          error: 'Delivery task not found',
          code: 'DELIVERY_TASK_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      status,
      pickupContactName,
      pickupContactPhone,
      deliveryContactName,
      deliveryContactPhone,
      pickupVerificationPhotos,
      pickupQrCode,
      pickupVerifiedAt,
      deliverySignature,
      deliveryPhotos,
      deliveryVerifiedAt,
    } = body;

    if (
      status &&
      !['assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery', 'delivered'].includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid status. Must be one of: assigned, en_route_pickup, picked_up, en_route_delivery, delivered',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status !== undefined) updateData.status = status;
    if (pickupContactName !== undefined)
      updateData.pickupContactName = pickupContactName;
    if (pickupContactPhone !== undefined)
      updateData.pickupContactPhone = pickupContactPhone;
    if (deliveryContactName !== undefined)
      updateData.deliveryContactName = deliveryContactName;
    if (deliveryContactPhone !== undefined)
      updateData.deliveryContactPhone = deliveryContactPhone;
    if (pickupVerificationPhotos !== undefined)
      updateData.pickupVerificationPhotos =
        Array.isArray(pickupVerificationPhotos)
          ? JSON.stringify(pickupVerificationPhotos)
          : pickupVerificationPhotos;
    if (pickupQrCode !== undefined) updateData.pickupQrCode = pickupQrCode;
    if (pickupVerifiedAt !== undefined)
      updateData.pickupVerifiedAt = pickupVerifiedAt
        ? new Date(pickupVerifiedAt)
        : null;
    if (deliverySignature !== undefined)
      updateData.deliverySignature = deliverySignature;
    if (deliveryPhotos !== undefined)
      updateData.deliveryPhotos = Array.isArray(deliveryPhotos)
        ? JSON.stringify(deliveryPhotos)
        : deliveryPhotos;
    if (deliveryVerifiedAt !== undefined)
      updateData.deliveryVerifiedAt = deliveryVerifiedAt
        ? new Date(deliveryVerifiedAt)
        : null;

    const updated = await db
      .update(deliveryTasks)
      .set(updateData)
      .where(eq(deliveryTasks.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update delivery task',
          code: 'UPDATE_FAILED',
        },
        { status: 500 }
      );
    }

    const updatedTask = updated[0];
    const parsedTask = {
      ...updatedTask,
      pickupVerificationPhotos: updatedTask.pickupVerificationPhotos
        ? JSON.parse(updatedTask.pickupVerificationPhotos)
        : null,
      deliveryPhotos: updatedTask.deliveryPhotos
        ? JSON.parse(updatedTask.deliveryPhotos)
        : null,
    };

    return NextResponse.json(parsedTask, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
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

    const existingTask = await db
      .select()
      .from(deliveryTasks)
      .where(eq(deliveryTasks.id, parseInt(id)))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        {
          error: 'Delivery task not found',
          code: 'DELIVERY_TASK_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(deliveryTasks)
      .where(eq(deliveryTasks.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to delete delivery task',
          code: 'DELETE_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Delivery task deleted successfully',
        deletedTask: deleted[0],
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