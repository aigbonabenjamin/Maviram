import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
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
          error: 'Valid transaction ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const transaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, parseInt(id)))
      .limit(1);

    if (transaction.length === 0) {
      return NextResponse.json(
        {
          error: 'Transaction not found',
          code: 'TRANSACTION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction[0], { status: 200 });
  } catch (error) {
    console.error('GET transaction error:', error);
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
          error: 'Valid transaction ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { transactionStatus, escrowAccountRef, payoutRef } = body;

    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, parseInt(id)))
      .limit(1);

    if (existingTransaction.length === 0) {
      return NextResponse.json(
        {
          error: 'Transaction not found',
          code: 'TRANSACTION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    if (
      transactionStatus &&
      !['pending', 'completed', 'failed'].includes(transactionStatus)
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid transaction status. Must be: pending, completed, or failed',
          code: 'INVALID_TRANSACTION_STATUS',
        },
        { status: 400 }
      );
    }

    const updates: {
      transactionStatus?: string;
      escrowAccountRef?: string;
      payoutRef?: string;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (transactionStatus !== undefined) {
      updates.transactionStatus = transactionStatus;
    }
    if (escrowAccountRef !== undefined) {
      updates.escrowAccountRef = escrowAccountRef;
    }
    if (payoutRef !== undefined) {
      updates.payoutRef = payoutRef;
    }

    const updatedTransaction = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, parseInt(id)))
      .returning();

    if (updatedTransaction.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update transaction',
          code: 'UPDATE_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedTransaction[0], { status: 200 });
  } catch (error) {
    console.error('PUT transaction error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
      },
      { status: 500 }
    );
  }
}