"use client";

import { useState } from 'react';
import { useCache } from '@/hooks/useCache';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Trash2, 
  Database, 
  HardDrive,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function CacheManager() {
  const { stats, loading, fetchStats, clearCache, getCacheKeys } = useCache();
  const [pattern, setPattern] = useState('');
  const [keys, setKeys] = useState<string[]>([]);
  const [showKeys, setShowKeys] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all cache? This cannot be undone.')) {
      return;
    }

    setClearing(true);
    const success = await clearCache('*');
    setClearing(false);

    if (success) {
      alert('All cache cleared successfully!');
    } else {
      alert('Failed to clear cache');
    }
  };

  const handleClearPattern = async () => {
    if (!pattern) {
      alert('Please enter a cache key pattern');
      return;
    }

    if (!confirm(`Are you sure you want to clear cache matching pattern: ${pattern}?`)) {
      return;
    }

    setClearing(true);
    const success = await clearCache(pattern);
    setClearing(false);

    if (success) {
      alert(`Cache cleared for pattern: ${pattern}`);
      setPattern('');
    } else {
      alert('Failed to clear cache');
    }
  };

  const handleViewKeys = async () => {
    const fetchedKeys = await getCacheKeys(pattern || '*');
    setKeys(fetchedKeys);
    setShowKeys(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Redis Cache Manager</h2>
        <p className="text-muted-foreground mt-1">
          Monitor and manage application cache for improved performance
        </p>
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cached Keys</p>
              <p className="text-2xl font-bold">
                {loading ? '...' : stats?.keys || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Memory Usage</p>
              <p className="text-2xl font-bold">
                {loading ? '...' : stats?.memory || 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${stats?.connected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} rounded-full flex items-center justify-center`}>
              {stats?.connected ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Redis Status</p>
              <Badge variant={stats?.connected ? 'default' : 'destructive'}>
                {loading ? 'Checking...' : stats?.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cache Actions</h3>
        
        <div className="space-y-4">
          {/* Refresh Stats */}
          <div className="flex gap-2">
            <Button 
              onClick={fetchStats} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>
          </div>

          {/* Clear All Cache */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Clear All Cache</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Remove all cached data from Redis. Use with caution.
            </p>
            <Button 
              onClick={handleClearAll}
              disabled={clearing || loading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {clearing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Clear All Cache
            </Button>
          </div>

          {/* Clear by Pattern */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Clear Cache by Pattern</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Clear cache keys matching a specific pattern (e.g., "products:*", "user:123")
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter pattern (e.g., products:*)"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleClearPattern}
                disabled={!pattern || clearing}
                variant="outline"
              >
                {clearing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Clear Pattern'
                )}
              </Button>
            </div>
          </div>

          {/* View Cache Keys */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">View Cache Keys</h4>
            <p className="text-sm text-muted-foreground mb-3">
              View all cache keys or filter by pattern
            </p>
            <Button 
              onClick={handleViewKeys}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              View Keys
            </Button>

            {showKeys && (
              <div className="mt-4 p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">
                    Cache Keys ({keys.length})
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowKeys(false)}
                  >
                    Close
                  </Button>
                </div>
                {keys.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No cache keys found</p>
                ) : (
                  <ul className="space-y-1">
                    {keys.map((key, index) => (
                      <li 
                        key={index}
                        className="text-sm font-mono bg-background p-2 rounded"
                      >
                        {key}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Common Cache Patterns */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Common Cache Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Products', pattern: 'products:*' },
            { label: 'Orders', pattern: 'orders:*' },
            { label: 'Users', pattern: 'users:*' },
            { label: 'Sessions', pattern: 'session:*' },
            { label: 'Activity Logs', pattern: 'activity_logs:*' },
            { label: 'Delivery Tasks', pattern: 'delivery_tasks:*' },
          ].map((item) => (
            <Button
              key={item.pattern}
              variant="outline"
              onClick={() => setPattern(item.pattern)}
              className="justify-start"
            >
              <Database className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}