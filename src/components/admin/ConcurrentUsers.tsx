import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, RefreshCw, Activity } from 'lucide-react';

interface Session {
  sessionId: string;
  userId: string;
  userRole: string;
  lastHeartbeat: number;
  metadata?: any;
}

interface SessionStats {
  totalActive: number;
  byRole: Record<string, number>;
}

export function ConcurrentUsers() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats>({ totalActive: 0, byRole: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, [selectedRole]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSessions();
      fetchStats();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, selectedRole]);

  const fetchSessions = async () => {
    try {
      const url = selectedRole 
        ? `/api/sessions/active?role=${selectedRole}`
        : '/api/sessions/active';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/sessions/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchSessions();
    fetchStats();
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-500 text-white',
      buyer: 'bg-blue-500 text-white',
      seller: 'bg-green-500 text-white',
      driver: 'bg-orange-500 text-white'
    };
    return colors[role] || 'bg-gray-500 text-white';
  };

  const getTimeSinceHeartbeat = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Active</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalActive}</p>
            </div>
            <Activity className="w-10 h-10 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Admins</p>
              <p className="text-3xl font-bold text-purple-500">{stats.byRole?.admin || 0}</p>
            </div>
            <Users className="w-10 h-10 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Buyers</p>
              <p className="text-3xl font-bold text-blue-500">{stats.byRole?.buyer || 0}</p>
            </div>
            <UserCheck className="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sellers</p>
              <p className="text-3xl font-bold text-green-500">{stats.byRole?.seller || 0}</p>
            </div>
            <UserCheck className="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Drivers</p>
              <p className="text-3xl font-bold text-orange-500">{stats.byRole?.driver || 0}</p>
            </div>
            <UserCheck className="w-10 h-10 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2">Active User Sessions</h2>
            <p className="text-sm text-gray-600">
              Monitor users currently active in the system. Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Role Filter */}
        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block">Filter by Role</label>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setSelectedRole('')}
              variant={selectedRole === '' ? 'default' : 'outline'}
              size="sm"
            >
              All ({stats.totalActive})
            </Button>
            <Button
              onClick={() => setSelectedRole('admin')}
              variant={selectedRole === 'admin' ? 'default' : 'outline'}
              size="sm"
            >
              Admin ({stats.byRole?.admin || 0})
            </Button>
            <Button
              onClick={() => setSelectedRole('buyer')}
              variant={selectedRole === 'buyer' ? 'default' : 'outline'}
              size="sm"
            >
              Buyer ({stats.byRole?.buyer || 0})
            </Button>
            <Button
              onClick={() => setSelectedRole('seller')}
              variant={selectedRole === 'seller' ? 'default' : 'outline'}
              size="sm"
            >
              Seller ({stats.byRole?.seller || 0})
            </Button>
            <Button
              onClick={() => setSelectedRole('driver')}
              variant={selectedRole === 'driver' ? 'default' : 'outline'}
              size="sm"
            >
              Driver ({stats.byRole?.driver || 0})
            </Button>
          </div>
        </div>
      </Card>

      {/* Session List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Sessions</h3>
        
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No active sessions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Session ID</th>
                  <th className="text-left py-3 px-4">User ID</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Last Activity</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => {
                  const timeSince = getTimeSinceHeartbeat(session.lastHeartbeat);
                  const isActive = Date.now() - session.lastHeartbeat < 60000; // Active if heartbeat within 1 minute

                  return (
                    <tr key={session.sessionId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-xs">
                        {session.sessionId.substring(0, 16)}...
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{session.userId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getRoleColor(session.userRole)}>
                          {session.userRole}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {timeSince}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <span className="text-xs text-gray-600">
                            {isActive ? 'Active' : 'Idle'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Scaling Recommendations */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Scaling Recommendations
        </h3>
        <div className="space-y-2 text-sm">
          {stats.totalActive < 50 && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>System load is LOW - Current resources are sufficient</span>
            </div>
          )}
          {stats.totalActive >= 50 && stats.totalActive < 100 && (
            <div className="flex items-center gap-2 text-yellow-600">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>System load is MODERATE - Monitor performance closely</span>
            </div>
          )}
          {stats.totalActive >= 100 && stats.totalActive < 200 && (
            <div className="flex items-center gap-2 text-orange-600">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>System load is HIGH - Consider scaling up resources</span>
            </div>
          )}
          {stats.totalActive >= 200 && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>System load is CRITICAL - Scale up immediately!</span>
            </div>
          )}
          <p className="text-gray-600 mt-3">
            Current concurrent users: <strong>{stats.totalActive}</strong>
          </p>
        </div>
      </Card>
    </div>
  );
}