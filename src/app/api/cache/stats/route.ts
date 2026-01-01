import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats } from '@/lib/cache-utils';

export async function GET(request: NextRequest) {
  try {
    const stats = await getCacheStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cache statistics' },
      { status: 500 }
    );
  }
}