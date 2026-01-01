import { NextRequest, NextResponse } from 'next/server';
import { removeSession } from '@/lib/session-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await removeSession(userId);

    return NextResponse.json({ 
      success: true 
    });
  } catch (error: any) {
    console.error('Error unregistering session:', error);
    return NextResponse.json(
      { error: 'Failed to unregister session', details: error.message },
      { status: 500 }
    );
  }
}