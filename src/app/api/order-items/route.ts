import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const orderId = searchParams.get('orderId');
    const sellerId = searchParams.get('sellerId');
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single order item by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const result = await db.execute(sql`CALL sp_get_order_item_by_id(${parseInt(id)})`);
      const orderItem = result[0];

      if (!orderItem || orderItem.length === 0) {
        return NextResponse.json({ 
          error: 'Order item not found',
          code: 'ORDER_ITEM_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(orderItem[0], { status: 200 });
    }

    // Get items by order
    if (orderId) {
      if (isNaN(parseInt(orderId))) {
        return NextResponse.json({ 
          error: 'Valid order ID is required',
          code: 'INVALID_ORDER_ID' 
        }, { status: 400 });
      }

      const result = await db.execute(
        sql`CALL sp_get_order_items_by_order(${parseInt(orderId)})`
      );
      return NextResponse.json(result[0] || [], { status: 200 });
    }

    // Get items by seller
    if (sellerId) {
      if (isNaN(parseInt(sellerId))) {
        return NextResponse.json({ 
          error: 'Valid seller ID is required',
          code: 'INVALID_SELLER_ID' 
        }, { status: 400 });
      }

      const result = await db.execute(
        sql`CALL sp_get_order_items_by_seller(${parseInt(sellerId)}, ${limit}, ${offset})`
      );
      return NextResponse.json(result[0] || [], { status: 200 });
    }

    // Default: list all with filters
    let query = 'SELECT * FROM order_items WHERE 1=1';
    const params: any[] = [];

    if (productId) {
      query += ' AND product_id = ?';
      params.push(parseInt(productId));
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await db.execute(sql.raw(query, params));
    return NextResponse.json(result[0] || [], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, productId, sellerId, productName, quantity, pricePerUnit, status } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json({ 
        error: 'Order ID is required',
        code: 'MISSING_ORDER_ID' 
      }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ 
        error: 'Product ID is required',
        code: 'MISSING_PRODUCT_ID' 
      }, { status: 400 });
    }

    if (!sellerId) {
      return NextResponse.json({ 
        error: 'Seller ID is required',
        code: 'MISSING_SELLER_ID' 
      }, { status: 400 });
    }

    if (!productName || typeof productName !== 'string' || productName.trim() === '') {
      return NextResponse.json({ 
        error: 'Product name is required',
        code: 'MISSING_PRODUCT_NAME' 
      }, { status: 400 });
    }

    if (!quantity || typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
      return NextResponse.json({ 
        error: 'Quantity must be a positive integer',
        code: 'INVALID_QUANTITY' 
      }, { status: 400 });
    }

    if (!pricePerUnit || typeof pricePerUnit !== 'number' || pricePerUnit <= 0) {
      return NextResponse.json({ 
        error: 'Price per unit must be a positive number',
        code: 'INVALID_PRICE_PER_UNIT' 
      }, { status: 400 });
    }

    // Calculate total price
    const totalPrice = quantity * pricePerUnit;

    // Generate unique ID
    const timestamp = Math.floor(Date.now() / 1000);
    const uniqueId = `ITEM-${orderId}-${productId}-${timestamp}`;

    // Call stored procedure to create order item
    const result = await db.execute(sql`
      CALL sp_create_order_item(
        ${parseInt(orderId)}, ${parseInt(productId)}, ${parseInt(sellerId)},
        ${productName.trim()}, ${quantity}, ${pricePerUnit}, ${totalPrice},
        ${status || 'pending'}, ${uniqueId}
      )
    `);

    const newOrderItem = result[0];
    return NextResponse.json(newOrderItem[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    // Check if order item exists
    const existingResult = await db.execute(sql`CALL sp_get_order_item_by_id(${parseInt(id)})`);
    const existingOrderItem = existingResult[0];

    if (!existingOrderItem || existingOrderItem.length === 0) {
      return NextResponse.json({ 
        error: 'Order item not found',
        code: 'ORDER_ITEM_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { quantity, pricePerUnit, status } = body;

    // Calculate total price if quantity or pricePerUnit changed
    let totalPrice = null;
    if (quantity !== undefined || pricePerUnit !== undefined) {
      const finalQuantity = quantity !== undefined ? quantity : existingOrderItem[0].quantity;
      const finalPricePerUnit = pricePerUnit !== undefined ? pricePerUnit : existingOrderItem[0].pricePerUnit;
      totalPrice = finalQuantity * finalPricePerUnit;
    }

    // Call stored procedure to update order item
    const result = await db.execute(sql`
      CALL sp_update_order_item(
        ${parseInt(id)}, ${quantity || null}, ${pricePerUnit || null},
        ${totalPrice}, ${status || null}
      )
    `);

    const updatedOrderItem = result[0];
    return NextResponse.json(updatedOrderItem[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    // Check if order item exists
    const existingResult = await db.execute(sql`CALL sp_get_order_item_by_id(${parseInt(id)})`);
    const existingOrderItem = existingResult[0];

    if (!existingOrderItem || existingOrderItem.length === 0) {
      return NextResponse.json({ 
        error: 'Order item not found',
        code: 'ORDER_ITEM_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete order item
    await db.execute(sql`CALL sp_delete_order_item(${parseInt(id)})`);

    return NextResponse.json({ 
      message: 'Order item deleted successfully',
      deletedOrderItem: existingOrderItem[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}