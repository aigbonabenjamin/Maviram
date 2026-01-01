import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orderItems } from '@/db/schema';
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
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const orderItem = await db.select()
      .from(orderItems)
      .where(eq(orderItems.id, parseInt(id)))
      .limit(1);

    if (orderItem.length === 0) {
      return NextResponse.json(
        { 
          error: 'Order item not found',
          code: 'ORDER_ITEM_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(orderItem[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
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
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const existingOrderItem = await db.select()
      .from(orderItems)
      .where(eq(orderItems.id, parseInt(id)))
      .limit(1);

    if (existingOrderItem.length === 0) {
      return NextResponse.json(
        { 
          error: 'Order item not found',
          code: 'ORDER_ITEM_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { quantity, pricePerUnit } = body;

    const updates: {
      quantity?: number;
      pricePerUnit?: string;
      totalPrice?: string;
    } = {};

    if (quantity !== undefined) {
      if (typeof quantity !== 'number' || quantity <= 0) {
        return NextResponse.json(
          { 
            error: 'Quantity must be a positive number',
            code: 'INVALID_QUANTITY' 
          },
          { status: 400 }
        );
      }
      updates.quantity = quantity;
    }

    if (pricePerUnit !== undefined) {
      const price = parseFloat(pricePerUnit);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { 
            error: 'Price per unit must be a positive number',
            code: 'INVALID_PRICE' 
          },
          { status: 400 }
        );
      }
      updates.pricePerUnit = price.toFixed(2);
    }

    const finalQuantity = updates.quantity ?? existingOrderItem[0].quantity;
    const finalPricePerUnit = updates.pricePerUnit 
      ? parseFloat(updates.pricePerUnit) 
      : parseFloat(existingOrderItem[0].pricePerUnit as string);

    updates.totalPrice = (finalQuantity * finalPricePerUnit).toFixed(2);

    const updated = await db.update(orderItems)
      .set(updates)
      .where(eq(orderItems.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update order item',
          code: 'UPDATE_FAILED' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
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
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const existingOrderItem = await db.select()
      .from(orderItems)
      .where(eq(orderItems.id, parseInt(id)))
      .limit(1);

    if (existingOrderItem.length === 0) {
      return NextResponse.json(
        { 
          error: 'Order item not found',
          code: 'ORDER_ITEM_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const deleted = await db.delete(orderItems)
      .where(eq(orderItems.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Order item deleted successfully',
        orderItem: deleted[0]
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