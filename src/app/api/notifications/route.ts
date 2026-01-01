import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

const VALID_NOTIFICATION_TYPES = ['sms', 'email', 'app'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');
    const notificationType = searchParams.get('notificationType');
    const isRead = searchParams.get('isRead');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single notification by ID
    if (id) {
      const notificationId = parseInt(id);
      if (isNaN(notificationId)) {
        return NextResponse.json({ 
          error: "Valid notification ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const result = await db.execute(sql`CALL sp_get_notification_by_id(${notificationId})`);
      const notification = result[0];

      if (!notification || notification.length === 0) {
        return NextResponse.json({ 
          error: 'Notification not found',
          code: "NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(notification[0], { status: 200 });
    }

    // Get notifications by user
    if (userId) {
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return NextResponse.json({ 
          error: "Valid user ID is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }

      // Get unread notifications if specified
      if (isRead === 'false') {
        const result = await db.execute(
          sql`CALL sp_get_unread_notifications(${userIdInt}, ${limit}, ${offset})`
        );
        return NextResponse.json(result[0] || [], { status: 200 });
      }

      // Get all notifications for user
      const result = await db.execute(
        sql`CALL sp_get_notifications_by_user(${userIdInt}, ${limit}, ${offset})`
      );
      return NextResponse.json(result[0] || [], { status: 200 });
    }

    // Default: list all with filters
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params: any[] = [];

    if (orderId) {
      query += ' AND order_id = ?';
      params.push(parseInt(orderId));
    }

    if (notificationType) {
      if (!VALID_NOTIFICATION_TYPES.includes(notificationType)) {
        return NextResponse.json({ 
          error: `Notification type must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`,
          code: "INVALID_NOTIFICATION_TYPE" 
        }, { status: 400 });
      }
      query += ' AND notification_type = ?';
      params.push(notificationType);
    }

    if (isRead !== null && isRead !== undefined) {
      query += ' AND is_read = ?';
      params.push(isRead === 'true' ? 1 : 0);
    }

    query += ' ORDER BY sent_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await db.execute(sql.raw(query, params));
    return NextResponse.json(result[0] || [], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, orderId, notificationType, message } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: "userId is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ 
        error: "message is required",
        code: "MISSING_MESSAGE" 
      }, { status: 400 });
    }

    if (!notificationType) {
      return NextResponse.json({ 
        error: "notificationType is required",
        code: "MISSING_NOTIFICATION_TYPE" 
      }, { status: 400 });
    }

    // Validate notificationType
    if (!VALID_NOTIFICATION_TYPES.includes(notificationType)) {
      return NextResponse.json({ 
        error: `Notification type must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`,
        code: "INVALID_NOTIFICATION_TYPE" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Call stored procedure to create notification
    const result = await db.execute(sql`
      CALL sp_create_notification(
        ${parseInt(userId)}, ${orderId ? parseInt(orderId) : null},
        ${notificationType.trim()}, ${message.trim()}, ${now}
      )
    `);

    const newNotification = result[0];
    return NextResponse.json(newNotification[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid notification ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const notificationId = parseInt(id);

    // Check if notification exists
    const existingResult = await db.execute(sql`CALL sp_get_notification_by_id(${notificationId})`);
    const existingNotification = existingResult[0];

    if (!existingNotification || existingNotification.length === 0) {
      return NextResponse.json({ 
        error: 'Notification not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    // Mark notification as read
    const result = await db.execute(sql`CALL sp_mark_notification_read(${notificationId})`);
    const updated = result[0];

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid notification ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const notificationId = parseInt(id);

    // Check if notification exists
    const existingResult = await db.execute(sql`CALL sp_get_notification_by_id(${notificationId})`);
    const existingNotification = existingResult[0];

    if (!existingNotification || existingNotification.length === 0) {
      return NextResponse.json({ 
        error: 'Notification not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete notification
    await db.execute(sql`CALL sp_delete_notification(${notificationId})`);

    return NextResponse.json({ 
      message: 'Notification deleted successfully',
      notification: existingNotification[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const pathname = request.nextUrl.pathname;

    // Check if this is mark-all-read endpoint
    if (pathname.includes('mark-all-read')) {
      if (!userId || isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "Valid user ID is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }

      const userIdInt = parseInt(userId);

      // Mark all as read
      const result = await db.execute(sql`CALL sp_mark_all_read(${userIdInt})`);

      return NextResponse.json({ 
        message: 'All notifications marked as read',
        count: result[0] ? result[0][0].updated_count : 0
      }, { status: 200 });
    }

    return NextResponse.json({ 
      error: "Invalid PATCH endpoint",
      code: "INVALID_ENDPOINT" 
    }, { status: 400 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}