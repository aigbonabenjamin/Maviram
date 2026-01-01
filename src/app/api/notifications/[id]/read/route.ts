import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const notificationId = parseInt(id);

    // Check if notification exists
    const existingNotification = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1);

    if (existingNotification.length === 0) {
      return NextResponse.json(
        {
          error: 'Notification not found',
          code: 'NOTIFICATION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Update isRead to 1 (true)
    const updated = await db
      .update(notifications)
      .set({
        isRead: 1,
      })
      .where(eq(notifications.id, notificationId))
      .returning();

    // Parse metadata JSON field if it exists
    const updatedNotification = updated[0];
    if (updatedNotification.metadata) {
      try {
        updatedNotification.metadata = JSON.parse(updatedNotification.metadata as string);
      } catch (parseError) {
        // Keep metadata as string if JSON parsing fails
        console.error('Failed to parse metadata JSON:', parseError);
      }
    }

    return NextResponse.json(updatedNotification, { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
      },
      { status: 500 }
    );
  }
}