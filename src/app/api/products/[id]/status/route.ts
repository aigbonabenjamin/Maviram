import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

const VALID_STATUSES = ['available', 'ordered', 'out_for_delivery', 'delivered'] as const;
type ProductStatus = typeof VALID_STATUSES[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and validate product ID from params
    const productId = params.id;
    
    if (!productId || isNaN(parseInt(productId))) {
      return NextResponse.json(
        { 
          error: 'Valid product ID is required',
          code: 'INVALID_PRODUCT_ID'
        },
        { status: 400 }
      );
    }

    const id = parseInt(productId);

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status field is required
    if (!status) {
      return NextResponse.json(
        { 
          error: 'Status field is required',
          code: 'MISSING_STATUS'
        },
        { status: 400 }
      );
    }

    // Validate status is one of the valid statuses
    if (!VALID_STATUSES.includes(status as ProductStatus)) {
      return NextResponse.json(
        { 
          error: `Invalid status value. Valid statuses are: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS',
          validStatuses: VALID_STATUSES
        },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProductResult = await db.execute(
      sql`CALL sp_get_product_by_id(${id})`
    );

    const existingProduct = existingProductResult[0] as any[];
    
    if (!existingProduct || existingProduct.length === 0) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Update product status
    const updateResult = await db.execute(
      sql`CALL sp_update_product_status(${id}, ${status})`
    );

    const updatedProduct = updateResult[0] as any[];

    if (!updatedProduct || updatedProduct.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update product status',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    // Return success response with updated product
    return NextResponse.json(
      {
        success: true,
        product: updatedProduct[0],
        message: 'Product status updated successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('PATCH /api/products/[id]/status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error
      },
      { status: 500 }
    );
  }
}