import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

const VALID_ROLES = ['seller', 'buyer', 'driver', 'admin'];
const PIN_REGEX = /^\d{4}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract and validate required fields
    const {
      role,
      phoneNumber,
      pin,
      fullName,
      email,
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
      bvm,
      maritalStatus,
      hasVehicle,
      lineMark
    } = body;

    // Validate required fields
    if (!role || !phoneNumber || !pin || !fullName) {
      return NextResponse.json({
        error: 'Missing required fields: role, phoneNumber, pin, and fullName are required',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({
        error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
        code: 'INVALID_ROLE'
      }, { status: 400 });
    }

    // Validate PIN format (exactly 4 digits)
    if (!PIN_REGEX.test(pin)) {
      return NextResponse.json({
        error: 'Invalid PIN format. PIN must be exactly 4 digits',
        code: 'INVALID_PIN_FORMAT'
      }, { status: 400 });
    }

    // Trim and sanitize string inputs
    const sanitizedPhoneNumber = phoneNumber.trim();
    const sanitizedPin = pin.trim();
    const sanitizedFullName = fullName.trim();
    const sanitizedEmail = email ? email.trim().toLowerCase() : null;
    const sanitizedMiddleName = middleName ? middleName.trim() : null;
    const sanitizedGender = gender ? gender.trim() : null;
    const sanitizedDateOfBirth = dateOfBirth ? dateOfBirth.trim() : null;
    const sanitizedAddress = address ? address.trim() : null;
    const sanitizedLocation = location ? location.trim() : null;
    const sanitizedBankAccountNumber = bankAccountNumber ? bankAccountNumber.trim() : null;
    const sanitizedBankAccountName = bankAccountName ? bankAccountName.trim() : null;
    const sanitizedBankName = bankName ? bankName.trim() : null;
    const sanitizedEducation = education ? education.trim() : null;
    const sanitizedNin = nin ? nin.trim() : null;
    const sanitizedBvm = bvm ? bvm.trim() : null;
    const sanitizedMaritalStatus = maritalStatus ? maritalStatus.trim() : null;
    const sanitizedLineMark = lineMark ? lineMark.trim() : null;

    // Check if phone number already exists
    const existingUserResult = await db.execute(
      sql`CALL sp_get_user_by_phone(${sanitizedPhoneNumber})`
    );

    // Check if user exists in the result
    const existingUsers = Array.isArray(existingUserResult) && existingUserResult.length > 0
      ? existingUserResult[0]
      : [];

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({
        error: 'Phone number already registered',
        code: 'PHONE_EXISTS'
      }, { status: 400 });
    }

    // Prepare parameters for stored procedure (all 19 parameters in exact order)
    const params = [
      role,                           // p_role
      sanitizedPhoneNumber,           // p_phoneNumber
      sanitizedPin,                   // p_pin
      sanitizedEmail,                 // p_email
      sanitizedFullName,              // p_fullName
      sanitizedMiddleName,            // p_middleName
      sanitizedGender,                // p_gender
      sanitizedDateOfBirth,           // p_dateOfBirth
      sanitizedAddress,               // p_address
      sanitizedLocation,              // p_location
      sanitizedBankAccountNumber,     // p_bankAccountNumber
      sanitizedBankAccountName,       // p_bankAccountName
      sanitizedBankName,              // p_bankName
      sanitizedEducation,             // p_education
      sanitizedNin,                   // p_nin
      sanitizedBvm,                   // p_bvm
      sanitizedMaritalStatus,         // p_maritalStatus
      hasVehicle !== undefined ? hasVehicle : null, // p_hasVehicle
      sanitizedLineMark               // p_lineMark
    ];

    // Call stored procedure to create user
    const createUserResult = await db.execute(
      sql`CALL sp_create_user(
        ${params[0]}, ${params[1]}, ${params[2]}, ${params[3]}, ${params[4]},
        ${params[5]}, ${params[6]}, ${params[7]}, ${params[8]}, ${params[9]},
        ${params[10]}, ${params[11]}, ${params[12]}, ${params[13]}, ${params[14]},
        ${params[15]}, ${params[16]}, ${params[17]}, ${params[18]}
      )`
    );

    // Extract created user from result
    const createdUserData = Array.isArray(createUserResult) && createUserResult.length > 0
      ? createUserResult[0]
      : [];
    
    const createdUser = Array.isArray(createdUserData) && createdUserData.length > 0
      ? createdUserData[0]
      : null;

    if (!createdUser) {
      return NextResponse.json({
        error: 'Failed to create user',
        code: 'USER_CREATION_FAILED'
      }, { status: 500 });
    }

    // Remove pin from response for security
    const { pin: _, ...userWithoutPin } = createdUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPin,
      message: 'Registration successful'
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/auth/register error:', error);

    // Handle duplicate phone number constraint error
    if (error.message && error.message.includes('Duplicate entry')) {
      return NextResponse.json({
        error: 'Phone number already registered',
        code: 'DUPLICATE_PHONE'
      }, { status: 409 });
    }

    // Handle other database errors
    if (error.message && error.message.includes('phone_number')) {
      return NextResponse.json({
        error: 'Phone number already registered',
        code: 'PHONE_EXISTS'
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error: ' + (error.message || error),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}