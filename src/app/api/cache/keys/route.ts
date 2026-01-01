import { NextRequest, NextResponse } from 'next/server';
import { getCacheKeys } from '@/lib/cache-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern') || '*';
    
    const keys = await getCacheKeys(pattern);
    
    return NextResponse.json({
      success: true,
      data: {
        keys,
        count: keys.length,
      },
    });
  } catch (error) {
    console.error('Error getting cache keys:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cache keys' },
      { status: 500 }
    );
  }
}