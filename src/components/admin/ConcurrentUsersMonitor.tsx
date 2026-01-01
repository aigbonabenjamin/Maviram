"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, RefreshCw, TrendingUp, Clock } from 'lucide-react';

interface ActiveSession {
  userId: string;
  role: string;
  fullName: string;
  lastSeen: number;
  ipAddress?: string;
  userAgent?: string;
}

interface SessionStats {
  total: number;
  sessions: ActiveSession[];
  byRole: {
    admin: number;
    buyer: number;
    seller: number;
    driver: number;
  };
}

export function ConcurrentUsersMonitor() {
  const [stats, setStats] = useState<SessionStats>({
    total: 0,
    sessions: [],
    byRole: { admin: 0, buyer: 0, seller: 0, driver: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions/active');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupSessions = async () => {
    try {
      await fetch('/api/sessions/cleanup', { method: 'POST' });
      fetchSessions();
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchSessions, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-500',
      buyer: 'bg-blue-500',
      seller: 'bg-green-500',
      driver: 'bg-orange-500',
    };
    return colors[role] || 'bg-gray-500';
  };

  const getTimeSinceLastSeen = (lastSeen: number) => {
    const seconds = Math.floor((Date.now() - lastSeen) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Concurrent Users Monitor</h2>
              <p className="text-sm text-gray-600">Real-time active user tracking</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
            </Button>
            <Button onClick={fetchSessions} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Now
            </Button>
            <Button onClick={cleanupSessions} variant="outline" size="sm">
              Cleanup Stale
            </Button>
          </div>
        </div>

        {/* Total Count */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Active</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </Card>

          {/* Role Breakdown */}
          {Object.entries(stats.byRole).map(([role, count]) => (
            <Card key={role} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 capitalize">{role}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <div className={`w-10 h-10 ${getRoleColor(role)} rounded-full flex items-center justify-center`}>
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Active Sessions List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
        {stats.sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No active users at the moment</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {stats.sessions.map((session) => (
              <div
                key={session.userId}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold">{session.fullName}</p>
                      <Badge className={`${getRoleColor(session.role)} text-white`}>
                        {session.role}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>User ID: {session.userId}</p>
                      {session.ipAddress && (
                        <p className="flex items-center gap-1">
                          <span>IP:</span>
                          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                            {session.ipAddress}
                          </code>
                        </p>
                      )}
                      {session.userAgent && (
                        <p className="text-xs truncate">
                          {session.userAgent}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeSinceLastSeen(session.lastSeen)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Scaling Recommendations */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">Scaling Recommendations</h3>
        <div className="space-y-2 text-sm">
          {stats.total < 10 && (
            <p className="text-blue-800">✅ System load is minimal. No scaling needed.</p>
          )}
          {stats.total >= 10 && stats.total < 50 && (
            <p className="text-yellow-800">⚠️ System load is moderate. Monitor closely.</p>
          )}
          {stats.total >= 50 && stats.total < 100 && (
            <p className="text-orange-800">🔶 System load is high. Consider scaling up soon.</p>
          )}
          {stats.total >= 100 && (
            <p className="text-red-800">🚨 CRITICAL: System reaching capacity. Scale up immediately!</p>
          )}
          <p className="text-gray-600 mt-2">
            Sessions auto-expire after 5 minutes of inactivity. Active users send heartbeats every minute.
          </p>
        </div>
      </Card>
    </div>
  );
}