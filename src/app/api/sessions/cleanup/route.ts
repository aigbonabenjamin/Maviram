import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredSessions } from '@/lib/session-tracker';

export async function POST(request: NextRequest) {
  try {
    const cleanedCount = await cleanupExpiredSessions();

    return NextResponse.json({
      success: true,
      cleanedCount,
      message: `Cleaned up ${cleanedCount} expired sessions`,
    });
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
}