import { useEffect, useRef } from 'react';

const HEARTBEAT_INTERVAL = 60000; // 1 minute

/**
 * Hook to track active user session with periodic heartbeat
 */
export function useSessionTracker(userId: string | null | undefined) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId) {
      // Clear interval if user logs out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Send initial heartbeat
    sendHeartbeat(userId);

    // Set up periodic heartbeat
    intervalRef.current = setInterval(() => {
      sendHeartbeat(userId);
    }, HEARTBEAT_INTERVAL);

    // Cleanup on unmount or user change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId]);

  const sendHeartbeat = async (id: string) => {
    try {
      await fetch('/api/sessions/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  };
}