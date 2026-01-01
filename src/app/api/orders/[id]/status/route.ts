import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

const VALID_STATUSES = [
  'pending',
  'payment_received',
  'seller_confirmed',
  'driver_assigned',
  'picked_up',
  'in_transit',
  'delivered',
  'buyer_approved',
  'rejected'
] as const;

type OrderStatus = typeof VALID_STATUSES[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and validate order ID
    const orderId = params.id;
    
    if (!orderId || isNaN(parseInt(orderId))) {
      return NextResponse.json({
        error: 'Valid order ID is required',
        code: 'INVALID_ORDER_ID'
      }, { status: 400 });
    }

    const orderIdInt = parseInt(orderId);

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status field is required
    if (!status) {
      return NextResponse.json({
        error: 'Status field is required',
        code: 'MISSING_STATUS'
      }, { status: 400 });
    }

    // Validate status is one of the valid statuses
    if (!VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json({
        error: `Invalid status value. Valid statuses are: ${VALID_STATUSES.join(', ')}`,
        code: 'INVALID_STATUS',
        validStatuses: VALID_STATUSES
      }, { status: 400 });
    }

    // Check if order exists
    const existingOrderResult = await db.execute(
      sql`CALL sp_get_order_by_id(${orderIdInt})`
    );

    const existingOrder = existingOrderResult[0] as any[];
    
    if (!existingOrder || existingOrder.length === 0) {
      return NextResponse.json({
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      }, { status: 404 });
    }

    const orderData = existingOrder[0];

    // Update order status
    const updateResult = await db.execute(
      sql`CALL sp_update_order_status(${orderIdInt}, ${status})`
    );

    const updatedOrder = updateResult[0] as any[];

    if (!updatedOrder || updatedOrder.length === 0) {
      return NextResponse.json({
        error: 'Failed to update order status',
        code: 'UPDATE_FAILED'
      }, { status: 500 });
    }

    const updatedOrderData = updatedOrder[0];

    // Optional: Create notification for buyer
    try {
      const buyerId = orderData.buyerId || orderData.buyer_id;
      const orderNumber = orderData.orderNumber || orderData.order_number || `ORD-${orderIdInt}`;
      const notificationMessage = `Your order ${orderNumber} status updated to: ${status}`;
      const sentAt = new Date().toISOString();

      await db.execute(
        sql`CALL sp_create_notification(
          ${buyerId}, 
          ${orderIdInt}, 
          'app', 
          ${notificationMessage}, 
          ${sentAt}
        )`
      );
    } catch (notificationError) {
      // Log notification error but don't fail the request
      console.error('Failed to create notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      order: updatedOrderData,
      message: 'Order status updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('PATCH /api/orders/[id]/status error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}