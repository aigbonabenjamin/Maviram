import { NextRequest, NextResponse } from 'next/server';
import { updateSessionHeartbeat } from '@/lib/session-tracker';

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

    await updateSessionHeartbeat(userId);

    return NextResponse.json({ 
      success: true 
    });
  } catch (error: any) {
    console.error('Error updating heartbeat:', error);
    return NextResponse.json(
      { error: 'Failed to update heartbeat', details: error.message },
      { status: 500 }
    );
  }
}