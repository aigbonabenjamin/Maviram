import { NextRequest, NextResponse } from 'next/server';
import { registerSession } from '@/lib/session-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userRole, metadata } = body;

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'userId and userRole are required' },
        { status: 400 }
      );
    }

    const sessionId = await registerSession(userId, userRole, metadata);

    return NextResponse.json({ 
      success: true,
      sessionId 
    });
  } catch (error: any) {
    console.error('Error registering session:', error);
    return NextResponse.json(
      { error: 'Failed to register session', details: error.message },
      { status: 500 }
    );
  }
}