import { NextRequest, NextResponse } from 'next/server';
import { getSessionStats, getActiveSessions } from '@/lib/session-tracker';

export async function GET(request: NextRequest) {
  try {
    const stats = await getSessionStats();
    const sessions = await getActiveSessions();

    // Group by role
    const byRole = sessions.reduce((acc: any, session: any) => {
      const role = session.userRole || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({ 
      success: true,
      stats: {
        ...stats,
        byRole
      }
    });
  } catch (error: any) {
    console.error('Error fetching session stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session stats', details: error.message },
      { status: 500 }
    );
  }
}