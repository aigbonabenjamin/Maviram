import { NextRequest, NextResponse } from 'next/server';
import { clearAllCache, invalidateCachePattern } from '@/lib/cache-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pattern } = body;
    
    let cleared = 0;
    
    if (pattern && pattern !== '*') {
      // Clear specific pattern
      cleared = await invalidateCachePattern(pattern);
    } else {
      // Clear all cache
      await clearAllCache();
      cleared = -1; // Indicator for full clear
    }
    
    return NextResponse.json({
      success: true,
      message: cleared === -1 
        ? 'All cache cleared successfully' 
        : `Cleared ${cleared} cache keys`,
      cleared,
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}