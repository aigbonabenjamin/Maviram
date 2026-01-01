import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single user by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const result = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);

      if (result.length === 0) {
        return NextResponse.json({ 
          error: 'User not found',
          code: "USER_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(result[0], { status: 200 });
    }

    // Filter by role
    if (role) {
      const validRoles = ['seller', 'buyer', 'driver', 'admin'];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ 
          error: "Invalid role. Must be one of: seller, buyer, driver, admin",
          code: "INVALID_ROLE" 
        }, { status: 400 });
      }

      const results = await db.select().from(users).where(eq(users.role, role)).limit(limit).offset(offset);
      return NextResponse.json(results, { status: 200 });
    }

    // Search functionality
    if (search) {
      const searchPattern = `%${search}%`;
      const results = await db.select().from(users).where(
        or(
          like(users.fullName, searchPattern),
          like(users.phoneNumber, searchPattern),
          like(users.email, searchPattern)
        )
      ).limit(limit).offset(offset);
      
      return NextResponse.json(results, { status: 200 });
    }

    // Default: list all users with pagination
    const results = await db.select().from(users).limit(limit).offset(offset);
    return NextResponse.json(results, { status: 200 });
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
      role, 
      phoneNumber, 
      pin, 
      email, 
      fullName, 
      middleName,
      gender,
      dateOfBirth,
      address,
      location,
      bankAccountNumber,
      bankAccountName,
      bankName,
      education,
      nin,
      bvn,
      maritalStatus,
      hasVehicle,
      lineMark
    } = body;

    // Validate required fields
    if (!role) {
      return NextResponse.json({ 
        error: "Role is required",
        code: "MISSING_ROLE" 
      }, { status: 400 });
    }

    if (!phoneNumber) {
      return NextResponse.json({ 
        error: "Phone number is required",
        code: "MISSING_PHONE_NUMBER" 
      }, { status: 400 });
    }

    if (!pin) {
      return NextResponse.json({ 
        error: "PIN is required",
        code: "MISSING_PIN" 
      }, { status: 400 });
    }

    if (!fullName) {
      return NextResponse.json({ 
        error: "Full name is required",
        code: "MISSING_FULL_NAME" 
      }, { status: 400 });
    }

    // Validate role
    const validRoles = ['seller', 'buyer', 'driver', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        error: "Invalid role. Must be one of: seller, buyer, driver, admin",
        code: "INVALID_ROLE" 
      }, { status: 400 });
    }

    // Validate PIN format (4 digits)
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ 
        error: "PIN must be exactly 4 digits",
        code: "INVALID_PIN_FORMAT" 
      }, { status: 400 });
    }

    // Check for duplicate phone number
    const existingUser = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ 
        error: "Phone number already exists",
        code: "DUPLICATE_PHONE_NUMBER" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Insert new user
    const newUser = await db.insert(users).values({
      role,
      phoneNumber,
      pin,
      email: email || null,
      fullName,
      middleName: middleName || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      address: address || null,
      location: location || null,
      bankAccountNumber: bankAccountNumber || null,
      bankAccountName: bankAccountName || null,
      bankName: bankName || null,
      education: education || null,
      nin: nin || null,
      bvn: bvn || null,
      maritalStatus: maritalStatus || null,
      hasVehicle: hasVehicle !== undefined ? (hasVehicle ? 1 : 0) : null,
      lineMark: lineMark || null,
      createdAt: now,
      updatedAt: now
    }).returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    
    // Handle duplicate phone number
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "Phone number already exists",
        code: "DUPLICATE_PHONE_NUMBER" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
    }

    const body = await request.json();
    const { 
      role, phoneNumber, pin, email, fullName, middleName, gender,
      dateOfBirth, address, location, bankAccountNumber, bankAccountName,
      bankName, education, nin, bvm, maritalStatus, hasVehicle, lineMark
    } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (pin !== undefined) updateData.pin = pin;
    if (email !== undefined) updateData.email = email;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (middleName !== undefined) updateData.middleName = middleName;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (address !== undefined) updateData.address = address;
    if (location !== undefined) updateData.location = location;
    if (bankAccountNumber !== undefined) updateData.bankAccountNumber = bankAccountNumber;
    if (bankAccountName !== undefined) updateData.bankAccountName = bankAccountName;
    if (bankName !== undefined) updateData.bankName = bankName;
    if (education !== undefined) updateData.education = education;
    if (nin !== undefined) updateData.nin = nin;
    if (bvm !== undefined) updateData.bvm = bvm;
    if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus;
    if (hasVehicle !== undefined) updateData.hasVehicle = hasVehicle ? 1 : 0;
    if (lineMark !== undefined) updateData.lineMark = lineMark;

    // Update user
    await db.update(users).set(updateData).where(eq(users.id, parseInt(id)));

    // Fetch updated user
    const updatedUser = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);

    return NextResponse.json(updatedUser[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete user
    await db.delete(users).where(eq(users.id, parseInt(id)));

    return NextResponse.json({
      message: 'User deleted successfully',
      user: existingUser[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}