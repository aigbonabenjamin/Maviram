import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

const VALID_STATUSES = [
  'assigned', 'en_route_to_pickup', 'at_pickup', 'picked_up',
  'en_route_to_delivery', 'delivered'
] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const orderId = searchParams.get('orderId');
    const driverId = searchParams.get('driverId');
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single delivery task by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const result = await db.execute(sql`CALL sp_get_delivery_task_by_id(${parseInt(id)})`);
      const task = result[0];

      if (!task || task.length === 0) {
        return NextResponse.json(
          { error: 'Delivery task not found', code: 'TASK_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(task[0], { status: 200 });
    }

    // Filter by order
    if (orderId) {
      if (isNaN(parseInt(orderId))) {
        return NextResponse.json(
          { error: 'Valid order ID is required', code: 'INVALID_ORDER_ID' },
          { status: 400 }
        );
      }

      const result = await db.execute(sql`CALL sp_list_tasks_by_order(${parseInt(orderId)})`);
      return NextResponse.json(result[0] || [], { status: 200 });
    }

    // Filter by driver
    if (driverId) {
      if (driverId === 'unassigned') {
        const result = await db.execute(
          sql`CALL sp_list_unassigned_tasks(${limit}, ${offset})`
        );
        return NextResponse.json(result[0] || [], { status: 200 });
      }

      if (isNaN(parseInt(driverId))) {
        return NextResponse.json(
          { error: 'Valid driver ID is required', code: 'INVALID_DRIVER_ID' },
          { status: 400 }
        );
      }

      const result = await db.execute(
        sql`CALL sp_list_tasks_by_driver(${parseInt(driverId)}, ${limit}, ${offset})`
      );
      return NextResponse.json(result[0] || [], { status: 200 });
    }

    // Filter by seller
    if (sellerId) {
      if (isNaN(parseInt(sellerId))) {
        return NextResponse.json(
          { error: 'Valid seller ID is required', code: 'INVALID_SELLER_ID' },
          { status: 400 }
        );
      }

      const result = await db.execute(
        sql`CALL sp_list_tasks_by_seller(${parseInt(sellerId)}, ${limit}, ${offset})`
      );
      return NextResponse.json(result[0] || [], { status: 200 });
    }

    // Filter by status
    if (status) {
      const result = await db.execute(
        sql`CALL sp_list_tasks_by_status(${status}, ${limit}, ${offset})`
      );
      return NextResponse.json(result[0] || [], { status: 200 });
    }

    // Default: list all tasks
    const result = await db.execute(
      sql`SELECT * FROM delivery_tasks ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    );
    return NextResponse.json(result[0] || [], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId, driverId, sellerId, pickupAddress, deliveryAddress,
      pickupContact, deliveryContact, productDetails, status
    } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required', code: 'MISSING_ORDER_ID' },
        { status: 400 }
      );
    }

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required', code: 'MISSING_SELLER_ID' },
        { status: 400 }
      );
    }

    if (!pickupAddress) {
      return NextResponse.json(
        { error: 'Pickup address is required', code: 'MISSING_PICKUP_ADDRESS' },
        { status: 400 }
      );
    }

    if (!deliveryAddress) {
      return NextResponse.json(
        { error: 'Delivery address is required', code: 'MISSING_DELIVERY_ADDRESS' },
        { status: 400 }
      );
    }

    if (!pickupContact) {
      return NextResponse.json(
        { error: 'Pickup contact is required', code: 'MISSING_PICKUP_CONTACT' },
        { status: 400 }
      );
    }

    if (!deliveryContact) {
      return NextResponse.json(
        { error: 'Delivery contact is required', code: 'MISSING_DELIVERY_CONTACT' },
        { status: 400 }
      );
    }

    if (!productDetails) {
      return NextResponse.json(
        { error: 'Product details are required', code: 'MISSING_PRODUCT_DETAILS' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const productDetailsJson = JSON.stringify(productDetails);

    // Call stored procedure to create delivery task
    const result = await db.execute(sql`
      CALL sp_create_delivery_task(
        ${parseInt(orderId)}, ${driverId ? parseInt(driverId) : null}, ${parseInt(sellerId)},
        ${pickupAddress.trim()}, ${deliveryAddress.trim()}, ${pickupContact.trim()},
        ${deliveryContact.trim()}, ${productDetailsJson}, ${status || 'assigned'}, ${now}
      )
    `);

    const newTask = result[0];
    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if delivery task exists
    const existingResult = await db.execute(sql`CALL sp_get_delivery_task_by_id(${parseInt(id)})`);
    const existingTask = existingResult[0];

    if (!existingTask || existingTask.length === 0) {
      return NextResponse.json(
        { error: 'Delivery task not found', code: 'TASK_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { driverId, status, pickupVerificationPhotos, pickupQrCode } = body;

    // If updating status, use status-specific procedure
    if (status !== undefined) {
      const result = await db.execute(sql`
        CALL sp_update_delivery_task_status(${parseInt(id)}, ${status})
      `);
      const updatedTask = result[0];
      return NextResponse.json(updatedTask[0], { status: 200 });
    }

    // If assigning driver
    if (driverId !== undefined) {
      const result = await db.execute(sql`
        CALL sp_assign_driver(${parseInt(id)}, ${driverId ? parseInt(driverId) : null})
      `);
      const updatedTask = result[0];
      return NextResponse.json(updatedTask[0], { status: 200 });
    }

    // For other updates
    const result = await db.execute(sql`
      CALL sp_update_delivery_task(
        ${parseInt(id)}, ${null}, ${null}, ${null}, ${null}, ${null},
        ${null}, ${null}, ${pickupVerificationPhotos ? JSON.stringify(pickupVerificationPhotos) : null},
        ${pickupQrCode || null}
      )
    `);

    const updatedTask = result[0];
    return NextResponse.json(updatedTask[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if delivery task exists
    const existingResult = await db.execute(sql`CALL sp_get_delivery_task_by_id(${parseInt(id)})`);
    const existingTask = existingResult[0];

    if (!existingTask || existingTask.length === 0) {
      return NextResponse.json(
        { error: 'Delivery task not found', code: 'TASK_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete delivery task
    await db.execute(sql`CALL sp_delete_delivery_task(${parseInt(id)})`);

    return NextResponse.json(
      {
        message: 'Delivery task deleted successfully',
        deletedTask: existingTask[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}