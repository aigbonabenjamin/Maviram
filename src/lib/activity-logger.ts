import { db } from '@/db';
import { activityLogs } from '@/db/schema';

export type ActivityType = 
  | 'login'
  | 'logout'
  | 'register'
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'search'
  | 'download'
  | 'upload'
  | 'approve'
  | 'reject'
  | 'confirm'
  | 'assign'
  | 'complete'
  | 'cancel'
  | 'error';

export type EntityType =
  | 'product'
  | 'order'
  | 'user'
  | 'delivery_task'
  | 'proof_of_delivery'
  | 'transaction'
  | 'notification'
  | 'account'
  | 'payment';

interface LogActivityParams {
  userId?: number | null;
  userRole?: string | null;
  activityType: ActivityType;
  description: string;
  entityType?: EntityType;
  entityId?: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Server-side activity logger for API routes
 * Use this in API route handlers to log activities
 */
export async function logActivity({
  userId,
  userRole,
  activityType,
  description,
  entityType,
  entityId,
  ipAddress,
  userAgent,
  metadata,
}: LogActivityParams): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      userId: userId || null,
      userRole: userRole || null,
      activityType,
      entityType: entityType || null,
      entityId: entityId || null,
      description,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: new Date(),
    });
  } catch (error) {
    // Silent fail - logging should not break the app
    console.error('Failed to log activity:', error);
  }
}

/**
 * Extract IP address from request headers
 */
export function getIpAddress(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real;
  }
  
  return null;
}