import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const orderId = searchParams.get('orderId');
    const buyerId = searchParams.get('buyerId');
    const sellerId = searchParams.get('sellerId');
    const transactionType = searchParams.get('transactionType');
    const status = searchParams.get('status');
    const escrowReference = searchParams.get('escrowReference');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single transaction by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const result = await db.execute(sql`CALL sp_get_transaction_by_id(${parseInt(id)})`);
      const transaction = result[0];

      if (!transaction || transaction.length === 0) {
        return NextResponse.json({ 
          error: 'Transaction not found',
          code: "TRANSACTION_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(transaction[0], { status: 200 });
    }

    // Get by escrow reference
    if (escrowReference) {
      const result = await db.execute(
        sql`CALL sp_get_transaction_by_escrow_ref(${escrowReference})`
      );
      const transaction = result[0];

      if (!transaction || transaction.length === 0) {
        return NextResponse.json({ 
          error: 'Transaction not found',
          code: "TRANSACTION_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(transaction[0], { status: 200 });
    }

    // Get by order
    if (orderId) {
      if (isNaN(parseInt(orderId))) {
        return NextResponse.json({ 
          error: "Valid orderId is required",
          code: "INVALID_ORDER_ID" 
        }, { status: 400 });
      }

      const result = await db.execute(
        sql`CALL sp_get_transaction_by_order(${parseInt(orderId)})`
      );
      return NextResponse.json(result[0] || [], { status: 200 });
    }

    // Filter by buyer
    if (buyerId) {
      if (isNaN(parseInt(buyerId))) {
        return NextResponse.json({ 
          error: "Valid buyerId is required",
          code: "INVALID_BUYER_ID" 
        }, { status: 400 });
      }

      const result = await db.execute(
        sql`CALL sp_list_transactions_by_buyer(${parseInt(buyerId)}, ${limit}, ${offset})`
      );
      return NextResponse.json(result[0] || [], { status: 200 });
    }

    // Filter by seller
    if (sellerId) {
      if (isNaN(parseInt(sellerId))) {
        return NextResponse.json({ 
          error: "Valid sellerId is required",
          code: "INVALID_SELLER_ID" 
        }, { status: 400 });
      }

      const result = await db.execute(
        sql`CALL sp_list_transactions_by_seller(${parseInt(sellerId)}, ${limit}, ${offset})`
      );
      return NextResponse.json(result[0] || [], { status: 200 });
    }

    // Filter by transaction type
    if (transactionType) {
      const validTypes = ['payment_to_escrow', 'release_to_seller', 'refund_to_buyer'];
      if (!validTypes.includes(transactionType)) {
        return NextResponse.json({ 
          error: "Invalid transactionType. Must be one of: payment_to_escrow, release_to_seller, refund_to_buyer",
          code: "INVALID_TRANSACTION_TYPE" 
        }, { status: 400 });
      }

      const result = await db.execute(
        sql`CALL sp_list_transactions_by_type(${transactionType}, ${limit}, ${offset})`
      );
      return NextResponse.json(result[0] || [], { status: 200 });
    }

    // Filter by status
    if (status) {
      const validStatuses = ['pending', 'completed', 'failed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: "Invalid status. Must be one of: pending, completed, failed",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }

      const result = await db.execute(
        sql`CALL sp_list_transactions_by_status(${status}, ${limit}, ${offset})`
      );
      return NextResponse.json(result[0] || [], { status: 200 });
    }

    // Default: list all transactions
    const result = await db.execute(
      sql`SELECT * FROM transactions ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    );
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
    const { 
      orderId, buyerId, sellerId, amount, platformFee, deliveryFee,
      transactionType, status, notes
    } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json({ 
        error: "orderId is required",
        code: "MISSING_ORDER_ID" 
      }, { status: 400 });
    }

    if (!buyerId) {
      return NextResponse.json({ 
        error: "buyerId is required",
        code: "MISSING_BUYER_ID" 
      }, { status: 400 });
    }

    if (!sellerId) {
      return NextResponse.json({ 
        error: "sellerId is required",
        code: "MISSING_SELLER_ID" 
      }, { status: 400 });
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json({ 
        error: "amount is required",
        code: "MISSING_AMOUNT" 
      }, { status: 400 });
    }

    if (platformFee === undefined || platformFee === null) {
      return NextResponse.json({ 
        error: "platformFee is required",
        code: "MISSING_PLATFORM_FEE" 
      }, { status: 400 });
    }

    if (deliveryFee === undefined || deliveryFee === null) {
      return NextResponse.json({ 
        error: "deliveryFee is required",
        code: "MISSING_DELIVERY_FEE" 
      }, { status: 400 });
    }

    if (!transactionType) {
      return NextResponse.json({ 
        error: "transactionType is required",
        code: "MISSING_TRANSACTION_TYPE" 
      }, { status: 400 });
    }

    // Calculate netToSeller
    const netToSeller = amount - platformFee - deliveryFee;

    // Generate unique escrowReference
    const timestamp = Date.now();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const escrowReference = `ESC-${orderId}-${timestamp}-${randomDigits}`;

    // Call stored procedure to create transaction
    const result = await db.execute(sql`
      CALL sp_create_transaction(
        ${parseInt(orderId)}, ${parseInt(buyerId)}, ${parseInt(sellerId)},
        ${parseFloat(amount)}, ${parseFloat(platformFee)}, ${parseFloat(deliveryFee)},
        ${netToSeller}, ${transactionType}, ${status || 'pending'},
        ${escrowReference}, ${notes || null}
      )
    `);

    const newTransaction = result[0];
    return NextResponse.json(newTransaction[0], { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    
    // Handle unique constraint violation for escrowReference
    if (error.message && error.message.includes('Duplicate entry')) {
      return NextResponse.json({ 
        error: "Duplicate escrow reference. Please try again.",
        code: "DUPLICATE_ESCROW_REFERENCE" 
      }, { status: 400 });
    }
    
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
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if transaction exists
    const existingResult = await db.execute(sql`CALL sp_get_transaction_by_id(${parseInt(id)})`);
    const existingTransaction = existingResult[0];

    if (!existingTransaction || existingTransaction.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction not found',
        code: "TRANSACTION_NOT_FOUND" 
      }, { status: 404 });
    }

    const body = await request.json();
    const { status, notes } = body;

    // Call stored procedure to update transaction
    const result = await db.execute(sql`
      CALL sp_update_transaction(${parseInt(id)}, ${status || null}, ${notes || null})
    `);

    const updatedTransaction = result[0];
    return NextResponse.json(updatedTransaction[0], { status: 200 });
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
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if transaction exists
    const existingResult = await db.execute(sql`CALL sp_get_transaction_by_id(${parseInt(id)})`);
    const existingTransaction = existingResult[0];

    if (!existingTransaction || existingTransaction.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction not found',
        code: "TRANSACTION_NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete transaction
    await db.execute(sql`CALL sp_delete_transaction(${parseInt(id)})`);

    return NextResponse.json({ 
      message: 'Transaction deleted successfully',
      transaction: existingTransaction[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}