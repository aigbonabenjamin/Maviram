import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid order ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Query database for order
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (order.length === 0) {
      return NextResponse.json(
        {
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Fetch order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, parseInt(id)));

    // Return order with items array
    return NextResponse.json(
      {
        ...order[0],
        items,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET order error:', error);
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
    const { id } = params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid order ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        {
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      totalAmount,
      deliveryAddress,
      escrowStatus,
      orderStatus,
      buyerApproved,
      buyerApprovedAt,
    } = body;

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date(),
    };

    if (totalAmount !== undefined) {
      updates.totalAmount = totalAmount.toString();
    }

    if (deliveryAddress !== undefined) {
      updates.deliveryAddress = deliveryAddress;
    }

    if (escrowStatus !== undefined) {
      // Validate escrowStatus enum
      const validEscrowStatuses = ['pending', 'funded', 'released', 'refunded'];
      if (!validEscrowStatuses.includes(escrowStatus)) {
        return NextResponse.json(
          {
            error: 'Invalid escrow status. Must be one of: pending, funded, released, refunded',
            code: 'INVALID_ESCROW_STATUS',
          },
          { status: 400 }
        );
      }
      updates.escrowStatus = escrowStatus;
    }

    if (orderStatus !== undefined) {
      // Validate orderStatus enum
      const validOrderStatuses = [
        'placed',
        'seller_confirmed',
        'picked_up',
        'in_transit',
        'delivered',
        'completed',
        'cancelled',
      ];
      if (!validOrderStatuses.includes(orderStatus)) {
        return NextResponse.json(
          {
            error: 'Invalid order status. Must be one of: placed, seller_confirmed, picked_up, in_transit, delivered, completed, cancelled',
            code: 'INVALID_ORDER_STATUS',
          },
          { status: 400 }
        );
      }
      updates.orderStatus = orderStatus;
    }

    if (buyerApproved !== undefined) {
      updates.buyerApproved = buyerApproved ? 1 : 0;

      // If buyerApproved is being set to true and buyerApprovedAt is not provided, set it to current timestamp
      if (buyerApproved && !buyerApprovedAt) {
        updates.buyerApprovedAt = new Date();
      }
    }

    if (buyerApprovedAt !== undefined) {
      updates.buyerApprovedAt = new Date(buyerApprovedAt);
    }

    // Update order with returning
    const updatedOrder = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedOrder[0], { status: 200 });
  } catch (error) {
    console.error('PUT order error:', error);
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
    const { id } = params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid order ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        {
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Delete associated order items first (manual cascade)
    await db.delete(orderItems).where(eq(orderItems.orderId, parseInt(id)));

    // Delete order with returning
    const deletedOrder = await db
      .delete(orders)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Order deleted successfully',
        order: deletedOrder[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE order error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
      },
      { status: 500 }
    );
  }
}