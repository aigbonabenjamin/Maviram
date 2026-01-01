import { useAuth } from '@/lib/contexts/AuthContext';
import { useCallback } from 'react';

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
  activityType: ActivityType;
  description: string;
  entityType?: EntityType;
  entityId?: number;
  metadata?: Record<string, any>;
}

export function useActivityLogger() {
  const { user } = useAuth();

  const logActivity = useCallback(
    async ({
      activityType,
      description,
      entityType,
      entityId,
      metadata,
    }: LogActivityParams) => {
      try {
        const response = await fetch('/api/activity-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id || null,
            userRole: user?.role || null,
            activityType,
            entityType: entityType || null,
            entityId: entityId || null,
            description,
            ipAddress: null, // Will be captured server-side if needed
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            metadata: metadata || null,
          }),
        });

        if (!response.ok) {
          console.error('Failed to log activity:', await response.text());
        }
      } catch (error) {
        // Silent fail - logging should not break the app
        console.error('Activity logging error:', error);
      }
    },
    [user]
  );

  return { logActivity };
}