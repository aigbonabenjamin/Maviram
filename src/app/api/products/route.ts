import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single product by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const result = await db.select().from(products).where(eq(products.id, parseInt(id))).limit(1);
      
      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
          { status: 404 }
        );
      }

      const product = result[0];
      return NextResponse.json({
        ...product,
        photos: product.photos ? JSON.parse(product.photos) : [],
        videos: product.videos ? JSON.parse(product.videos) : []
      }, { status: 200 });
    }

    // List products by seller
    if (sellerId) {
      if (isNaN(parseInt(sellerId))) {
        return NextResponse.json(
          { error: 'Valid seller ID is required', code: 'INVALID_SELLER_ID' },
          { status: 400 }
        );
      }

      const result = await db.select().from(products)
        .where(eq(products.sellerId, parseInt(sellerId)))
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset);
      
      return NextResponse.json(result.map(p => ({
        ...p,
        photos: p.photos ? JSON.parse(p.photos) : [],
        videos: p.videos ? JSON.parse(p.videos) : []
      })), { status: 200 });
    }

    // Filter by status
    if (status) {
      const validStatuses = ['available', 'pending', 'out_of_stock'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }

      const result = await db.select().from(products)
        .where(eq(products.status, status))
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset);
      
      return NextResponse.json(result.map(p => ({
        ...p,
        photos: p.photos ? JSON.parse(p.photos) : [],
        videos: p.videos ? JSON.parse(p.videos) : []
      })), { status: 200 });
    }

    // Search by productName
    if (search) {
      const result = await db.select().from(products)
        .where(like(products.productName, `%${search}%`))
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset);
      
      return NextResponse.json(result.map(p => ({
        ...p,
        photos: p.photos ? JSON.parse(p.photos) : [],
        videos: p.videos ? JSON.parse(p.videos) : []
      })), { status: 200 });
    }

    // Default: list all products
    const result = await db.select().from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);
    
    return NextResponse.json(result.map(p => ({
      ...p,
      photos: p.photos ? JSON.parse(p.photos) : [],
      videos: p.videos ? JSON.parse(p.videos) : []
    })), { status: 200 });
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
    const { sellerId, productName, productType, quantity, pricePerUnit, status, photos, videos } = body;

    // Validate required fields
    if (!sellerId) {
      return NextResponse.json(
        { error: 'sellerId is required', code: 'MISSING_SELLER_ID' },
        { status: 400 }
      );
    }

    if (!productName || productName.trim() === '') {
      return NextResponse.json(
        { error: 'productName is required and cannot be empty', code: 'MISSING_PRODUCT_NAME' },
        { status: 400 }
      );
    }

    if (!productType) {
      return NextResponse.json(
        { error: 'productType is required', code: 'MISSING_PRODUCT_TYPE' },
        { status: 400 }
      );
    }

    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: 'quantity is required', code: 'MISSING_QUANTITY' },
        { status: 400 }
      );
    }

    if (pricePerUnit === undefined || pricePerUnit === null) {
      return NextResponse.json(
        { error: 'pricePerUnit is required', code: 'MISSING_PRICE_PER_UNIT' },
        { status: 400 }
      );
    }

    const totalPrice = (quantity * parseFloat(pricePerUnit)).toFixed(2);
    const now = new Date().toISOString();

    // Create product
    const newProduct = await db.insert(products).values({
      sellerId: parseInt(sellerId),
      productName: productName.trim(),
      productType: productType.trim(),
      quantity: parseInt(quantity),
      pricePerUnit: pricePerUnit.toString(),
      totalPrice: totalPrice,
      status: status || 'available',
      photos: photos ? JSON.stringify(photos) : '[]',
      videos: videos ? JSON.stringify(videos) : '[]',
      verifiedBy: null,
      verifiedAt: null,
      listNumber: null,
      createdAt: now,
      updatedAt: now
    }).returning();

    return NextResponse.json({
      ...newProduct[0],
      photos: newProduct[0].photos ? JSON.parse(newProduct[0].photos) : [],
      videos: newProduct[0].videos ? JSON.parse(newProduct[0].videos) : []
    }, { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingResult = await db.execute(sql`CALL sp_get_product_by_id(${parseInt(id)})`);
    const existingProduct = existingResult[0];

    if (!existingProduct || existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { productName, quantity, pricePerUnit, status, photos, videos, verifiedByDriverId } = body;

    // Prepare JSON fields
    const photosJson = photos !== undefined ? JSON.stringify(photos) : null;
    const videosJson = videos !== undefined ? JSON.stringify(videos) : null;

    // Call stored procedure to update product
    const result = await db.execute(sql`
      CALL sp_update_product(
        ${parseInt(id)}, ${productName || null}, ${quantity || null}, ${pricePerUnit || null},
        ${status || null}, ${photosJson}, ${videosJson}, ${verifiedByDriverId || null}
      )
    `);

    const updatedProduct = result[0];
    
    // Invalidate product caches
    await deleteCachedData(generateCacheKey(CACHE_KEYS.PRODUCT, id));
    await deleteCachedData(`${CACHE_KEYS.PRODUCTS}:*`);

    return NextResponse.json(updatedProduct[0], { status: 200 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingResult = await db.execute(sql`CALL sp_get_product_by_id(${parseInt(id)})`);
    const existingProduct = existingResult[0];

    if (!existingProduct || existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete product
    await db.execute(sql`CALL sp_delete_product(${parseInt(id)})`);

    // Invalidate product caches
    await deleteCachedData(generateCacheKey(CACHE_KEYS.PRODUCT, id));
    await deleteCachedData(`${CACHE_KEYS.PRODUCTS}:*`);

    return NextResponse.json(
      {
        message: 'Product deleted successfully',
        product: existingProduct[0],
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