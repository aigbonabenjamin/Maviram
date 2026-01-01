import { useEffect, useRef } from 'react';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function useSessionHeartbeat(sessionId: string | null) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) {
      // Clear interval if no session
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Send initial heartbeat
    sendHeartbeat(sessionId);

    // Set up interval for periodic heartbeats
    intervalRef.current = setInterval(() => {
      sendHeartbeat(sessionId);
    }, HEARTBEAT_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionId]);

  const sendHeartbeat = async (sid: string) => {
    try {
      await fetch('/api/sessions/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid })
      });
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  };
}