import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
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
          error: 'Valid product ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        {
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const productData = product[0];

    const parsedProduct = {
      ...productData,
      photos: productData.photos ? JSON.parse(productData.photos) : [],
      videos: productData.videos ? JSON.parse(productData.videos) : []
    };

    return NextResponse.json(parsedProduct, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error
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
          error: 'Valid product ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        {
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      productName,
      productType,
      quantity,
      pricePerUnit,
      status,
      photos,
      videos,
      verifiedBy,
      verifiedAt,
      listNumber
    } = body;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (productName !== undefined) {
      if (typeof productName !== 'string' || productName.trim() === '') {
        return NextResponse.json(
          {
            error: 'Product name must be a non-empty string',
            code: 'INVALID_PRODUCT_NAME'
          },
          { status: 400 }
        );
      }
      updateData.productName = productName.trim();
    }

    if (productType !== undefined) {
      if (typeof productType !== 'string' || productType.trim() === '') {
        return NextResponse.json(
          {
            error: 'Product type must be a non-empty string',
            code: 'INVALID_PRODUCT_TYPE'
          },
          { status: 400 }
        );
      }
      updateData.productType = productType.trim();
    }

    if (quantity !== undefined) {
      const parsedQuantity = parseInt(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        return NextResponse.json(
          {
            error: 'Quantity must be a valid non-negative integer',
            code: 'INVALID_QUANTITY'
          },
          { status: 400 }
        );
      }
      updateData.quantity = parsedQuantity;
    }

    if (pricePerUnit !== undefined) {
      const parsedPrice = parseFloat(pricePerUnit);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json(
          {
            error: 'Price per unit must be a valid non-negative number',
            code: 'INVALID_PRICE'
          },
          { status: 400 }
        );
      }
      updateData.pricePerUnit = parsedPrice.toFixed(2);
    }

    const finalQuantity = updateData.quantity ?? existingProduct[0].quantity;
    const finalPricePerUnit = updateData.pricePerUnit ?? existingProduct[0].pricePerUnit;

    if (quantity !== undefined || pricePerUnit !== undefined) {
      const calculatedTotal = parseFloat(finalQuantity.toString()) * parseFloat(finalPricePerUnit.toString());
      updateData.totalPrice = calculatedTotal.toFixed(2);
    }

    if (status !== undefined) {
      const validStatuses = ['available', 'pending', 'in_transit', 'delivered', 'rejected'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: `Status must be one of: ${validStatuses.join(', ')}`,
            code: 'INVALID_STATUS'
          },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (listNumber !== undefined) {
      const parsedListNumber = parseInt(listNumber);
      if (!isNaN(parsedListNumber)) {
        updateData.listNumber = parsedListNumber;
      } else if (listNumber === null) {
        updateData.listNumber = null;
      }
    }

    if (photos !== undefined) {
      if (Array.isArray(photos)) {
        updateData.photos = JSON.stringify(photos);
      } else if (photos === null) {
        updateData.photos = null;
      } else {
        return NextResponse.json(
          {
            error: 'Photos must be an array or null',
            code: 'INVALID_PHOTOS'
          },
          { status: 400 }
        );
      }
    }

    if (videos !== undefined) {
      if (Array.isArray(videos)) {
        updateData.videos = JSON.stringify(videos);
      } else if (videos === null) {
        updateData.videos = null;
      } else {
        return NextResponse.json(
          {
            error: 'Videos must be an array or null',
            code: 'INVALID_VIDEOS'
          },
          { status: 400 }
        );
      }
    }

    if (verifiedBy !== undefined) {
      const parsedVerifiedBy = parseInt(verifiedBy);
      if (!isNaN(parsedVerifiedBy)) {
        updateData.verifiedBy = parsedVerifiedBy;
      } else if (verifiedBy === null) {
        updateData.verifiedBy = null;
      }
    }

    if (verifiedAt !== undefined) {
      if (verifiedAt === null) {
        updateData.verifiedAt = null;
      } else {
        const parsedDate = new Date(verifiedAt);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json(
            {
              error: 'Verified at must be a valid date',
              code: 'INVALID_VERIFIED_AT'
            },
            { status: 400 }
          );
        }
        updateData.verifiedAt = parsedDate;
      }
    }

    const updated = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update product',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    const updatedProduct = {
      ...updated[0],
      photos: updated[0].photos ? JSON.parse(updated[0].photos) : [],
      videos: updated[0].videos ? JSON.parse(updated[0].videos) : []
    };

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error
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
          error: 'Valid product ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        {
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to delete product',
          code: 'DELETE_FAILED'
        },
        { status: 500 }
      );
    }

    const deletedProduct = {
      ...deleted[0],
      photos: deleted[0].photos ? JSON.parse(deleted[0].photos) : [],
      videos: deleted[0].videos ? JSON.parse(deleted[0].videos) : []
    };

    return NextResponse.json(
      {
        message: 'Product deleted successfully',
        product: deletedProduct
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error
      },
      { status: 500 }
    );
  }
}