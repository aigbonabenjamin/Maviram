import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, pin } = body;

    // Validate required fields
    if (!phoneNumber || !pin) {
      return NextResponse.json(
        { 
          error: 'Phone number and PIN are required',
          code: 'MISSING_CREDENTIALS'
        },
        { status: 400 }
      );
    }

    // Validate PIN format (exactly 4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Sanitize inputs
    const sanitizedPhoneNumber = phoneNumber.trim();
    const sanitizedPin = pin.trim();

    // Query user by phone number using Drizzle
    const result = await db.select().from(users).where(eq(users.phoneNumber, sanitizedPhoneNumber)).limit(1);

    // Check if user exists
    if (!result || result.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    const user = result[0];

    // Verify PIN
    if (user.pin !== sanitizedPin) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Return success response with user data (excluding PIN)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          role: user.role,
          phoneNumber: user.phoneNumber,
          email: user.email,
          fullName: user.fullName,
          middleName: user.middleName,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          location: user.location,
          bankAccountNumber: user.bankAccountNumber,
          bankAccountName: user.bankAccountName,
          bankName: user.bankName,
          education: user.education,
          nin: user.nin,
          bvm: user.bvm,
          maritalStatus: user.maritalStatus,
          hasVehicle: user.hasVehicle,
          lineMark: user.lineMark,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        message: 'Login successful'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST to login.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST to login.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST to login.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  );
}