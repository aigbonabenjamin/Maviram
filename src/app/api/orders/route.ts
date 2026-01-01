import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

const VALID_STATUSES = [
  'placed', 'seller_confirmed', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'
] as const;

const VALID_ESCROW_STATUSES = [
  'pending', 'funded', 'released', 'refunded'
] as const;

function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const buyerId = searchParams.get('buyerId');
    const orderNumber = searchParams.get('orderNumber');
    const orderStatus = searchParams.get('orderStatus');
    const escrowStatus = searchParams.get('escrowStatus');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single order by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const result = await db.select().from(orders).where(eq(orders.id, parseInt(id))).limit(1);
      
      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(result[0], { status: 200 });
    }

    // Get by order number
    if (orderNumber) {
      const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
      
      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(result[0], { status: 200 });
    }

    // Filter by buyer
    if (buyerId) {
      if (isNaN(parseInt(buyerId))) {
        return NextResponse.json(
          { error: 'Valid buyer ID is required', code: 'INVALID_BUYER_ID' },
          { status: 400 }
        );
      }

      const result = await db.select().from(orders)
        .where(eq(orders.buyerId, parseInt(buyerId)))
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);
      
      return NextResponse.json(result, { status: 200 });
    }

    // Filter by order status
    if (orderStatus) {
      if (!VALID_STATUSES.includes(orderStatus as any)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }

      const result = await db.select().from(orders)
        .where(eq(orders.orderStatus, orderStatus))
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);
      
      return NextResponse.json(result, { status: 200 });
    }

    // Filter by escrow status
    if (escrowStatus) {
      if (!VALID_ESCROW_STATUSES.includes(escrowStatus as any)) {
        return NextResponse.json(
          { error: `Invalid escrow status. Must be one of: ${VALID_ESCROW_STATUSES.join(', ')}`, code: 'INVALID_ESCROW_STATUS' },
          { status: 400 }
        );
      }

      const result = await db.select().from(orders)
        .where(eq(orders.escrowStatus, escrowStatus))
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);
      
      return NextResponse.json(result, { status: 200 });
    }

    // Default: list all orders
    const result = await db.select().from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);
    
    return NextResponse.json(result, { status: 200 });
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
    const { buyerId, totalAmount, deliveryAddress, orderStatus, escrowStatus } = body;

    // Validate required fields
    if (!buyerId) {
      return NextResponse.json(
        { error: 'Buyer ID is required', code: 'MISSING_BUYER_ID' },
        { status: 400 }
      );
    }

    if (!totalAmount) {
      return NextResponse.json(
        { error: 'Total amount is required', code: 'MISSING_TOTAL_AMOUNT' },
        { status: 400 }
      );
    }

    if (!deliveryAddress || deliveryAddress.trim() === '') {
      return NextResponse.json(
        { error: 'Delivery address is required', code: 'MISSING_DELIVERY_ADDRESS' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();
    const now = new Date().toISOString();

    // Create order
    const newOrder = await db.insert(orders).values({
      orderNumber,
      buyerId: parseInt(buyerId),
      totalAmount: parseFloat(totalAmount).toFixed(2),
      deliveryAddress: deliveryAddress.trim(),
      escrowStatus: escrowStatus || 'pending',
      orderStatus: orderStatus || 'placed',
      buyerApproved: 0,
      buyerApprovedAt: null,
      createdAt: now,
      updatedAt: now
    }).returning();

    return NextResponse.json(newOrder[0], { status: 201 });
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

    // Check if order exists
    const existingResult = await db.select().from(orders).where(eq(orders.id, parseInt(id))).limit(1);
    const existingOrder = existingResult[0];

    if (!existingOrder || existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, paymentStatus, deliveryAddress, deliveryOption, buyerNotes, totalAmount } = body;

    // Call stored procedure to update order
    const result = await db.execute(sql`
      CALL sp_update_order(
        ${parseInt(id)}, ${totalAmount || null}, ${deliveryAddress || null},
        ${status || null}, ${paymentStatus || null}, ${deliveryOption || null},
        ${buyerNotes || null}
      )
    `);

    const updatedOrder = result[0];
    
    // Invalidate order caches
    await deleteCachedData(generateCacheKey(CACHE_KEYS.ORDER, id));
    await deleteCachedData(`${CACHE_KEYS.ORDERS}:*`);

    return NextResponse.json(updatedOrder[0], { status: 200 });
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

    // Check if order exists
    const existingResult = await db.execute(sql`CALL sp_get_order_by_id(${parseInt(id)})`);
    const existingOrder = existingResult[0];

    if (!existingOrder || existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete order
    await db.execute(sql`CALL sp_delete_order(${parseInt(id)})`);

    // Invalidate order caches
    await deleteCachedData(generateCacheKey(CACHE_KEYS.ORDER, id));
    await deleteCachedData(`${CACHE_KEYS.ORDERS}:*`);

    return NextResponse.json(
      {
        message: 'Order deleted successfully',
        deletedOrder: existingOrder[0]
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