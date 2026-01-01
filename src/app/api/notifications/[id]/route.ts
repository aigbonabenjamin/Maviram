import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const notificationId = parseInt(id);

    const result = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOTIFICATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    const notification = result[0];

    let parsedMetadata = null;
    if (notification.metadata) {
      try {
        parsedMetadata = JSON.parse(notification.metadata);
      } catch (error) {
        console.error('Failed to parse metadata JSON:', error);
        parsedMetadata = notification.metadata;
      }
    }

    return NextResponse.json({
      ...notification,
      metadata: parsedMetadata,
    });
  } catch (error) {
    console.error('GET notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const notificationId = parseInt(id);

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const existingRecord = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOTIFICATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if ('isRead' in body) {
      if (typeof body.isRead !== 'boolean' && typeof body.isRead !== 'number') {
        return NextResponse.json(
          { error: 'isRead must be a boolean or number', code: 'INVALID_IS_READ' },
          { status: 400 }
        );
      }
      updateData.isRead = body.isRead ? 1 : 0;
    }

    if ('title' in body) {
      if (!body.title || typeof body.title !== 'string') {
        return NextResponse.json(
          { error: 'Title must be a non-empty string', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updateData.title = body.title.trim();
    }

    if ('message' in body) {
      if (!body.message || typeof body.message !== 'string') {
        return NextResponse.json(
          { error: 'Message must be a non-empty string', code: 'INVALID_MESSAGE' },
          { status: 400 }
        );
      }
      updateData.message = body.message.trim();
    }

    if ('notificationType' in body) {
      const validTypes = ['sms', 'email', 'push'];
      if (!validTypes.includes(body.notificationType)) {
        return NextResponse.json(
          {
            error: 'notificationType must be one of: sms, email, push',
            code: 'INVALID_NOTIFICATION_TYPE',
          },
          { status: 400 }
        );
      }
      updateData.notificationType = body.notificationType;
    }

    if ('metadata' in body) {
      if (body.metadata !== null) {
        try {
          updateData.metadata = typeof body.metadata === 'string' 
            ? body.metadata 
            : JSON.stringify(body.metadata);
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid metadata format', code: 'INVALID_METADATA' },
            { status: 400 }
          );
        }
      } else {
        updateData.metadata = null;
      }
    }

    if ('sentAt' in body) {
      if (body.sentAt !== null) {
        updateData.sentAt = body.sentAt;
      } else {
        updateData.sentAt = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(notifications)
      .set(updateData)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update notification', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    const updatedNotification = updated[0];

    let parsedMetadata = null;
    if (updatedNotification.metadata) {
      try {
        parsedMetadata = JSON.parse(updatedNotification.metadata);
      } catch (error) {
        parsedMetadata = updatedNotification.metadata;
      }
    }

    return NextResponse.json({
      ...updatedNotification,
      metadata: parsedMetadata,
    });
  } catch (error) {
    console.error('PUT notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}