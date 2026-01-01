import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Fetch user by ID
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { 
          error: "User not found",
          code: "USER_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(user[0], { status: 200 });
  } catch (error) {
    console.error('GET user error:', error);
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
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Parse request body
    const body = await request.json();

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { 
          error: "User not found",
          code: "USER_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date()
    };

    // Map allowed fields for update
    const allowedFields = [
      'role',
      'phoneNumber',
      'pin',
      'email',
      'fullName',
      'middleName',
      'gender',
      'dateOfBirth',
      'address',
      'location',
      'bankAccountNumber',
      'bankAccountName',
      'bankName',
      'education',
      'nin',
      'bvm',
      'maritalStatus',
      'hasVehicle',
      'lineMark'
    ];

    // Only include fields that are present in the request body
    for (const field of allowedFields) {
      if (field in body) {
        // Convert camelCase to snake_case for database columns
        const dbField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updateData[field] = body[field];
      }
    }

    // Validate role if provided
    if (updateData.role) {
      const validRoles = ['admin', 'buyer', 'seller', 'driver'];
      if (!validRoles.includes(updateData.role)) {
        return NextResponse.json(
          { 
            error: "Invalid role. Must be one of: admin, buyer, seller, driver",
            code: "INVALID_ROLE" 
          },
          { status: 400 }
        );
      }
    }

    // Validate PIN if provided (must be 4 digits)
    if (updateData.pin) {
      if (updateData.pin.length !== 4 || !/^\d{4}$/.test(updateData.pin)) {
        return NextResponse.json(
          { 
            error: "PIN must be exactly 4 digits",
            code: "INVALID_PIN" 
          },
          { status: 400 }
        );
      }
    }

    // Validate email format if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json(
          { 
            error: "Invalid email format",
            code: "INVALID_EMAIL" 
          },
          { status: 400 }
        );
      }
      updateData.email = updateData.email.toLowerCase().trim();
    }

    // Trim string fields
    if (updateData.fullName) updateData.fullName = updateData.fullName.trim();
    if (updateData.phoneNumber) updateData.phoneNumber = updateData.phoneNumber.trim();

    // Update user
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    // Fetch and return updated user
    const updatedUser = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return NextResponse.json(updatedUser[0], { status: 200 });
  } catch (error) {
    console.error('PUT user error:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
      return NextResponse.json(
        { 
          error: "Phone number already exists",
          code: "DUPLICATE_PHONE_NUMBER" 
        },
        { status: 400 }
      );
    }

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
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { 
          error: "User not found",
          code: "USER_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Delete user
    await db.delete(users)
      .where(eq(users.id, userId));

    return NextResponse.json(
      {
        message: "User deleted successfully",
        user: existingUser[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE user error:', error);
    
    // Handle foreign key constraint violations
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { 
          error: "Cannot delete user with existing related records (products, orders, etc.)",
          code: "FOREIGN_KEY_CONSTRAINT" 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error 
      },
      { status: 500 }
    );
  }
}