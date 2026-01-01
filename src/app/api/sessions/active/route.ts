import { NextRequest, NextResponse } from 'next/server';
import { getActiveSessions } from '@/lib/session-tracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;

    const sessions = await getActiveSessions(role);

    return NextResponse.json({ 
      success: true,
      sessions 
    });
  } catch (error: any) {
    console.error('Error fetching active sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active sessions', details: error.message },
      { status: 500 }
    );
  }
}