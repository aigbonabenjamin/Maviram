import { useState, useEffect } from 'react';

export interface CacheStats {
  keys: number;
  memory: string;
  connected: boolean;
}

export function useCache() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cache/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (pattern?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/cache/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: pattern || '*' }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchStats(); // Refresh stats after clearing
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCacheKeys = async (pattern?: string) => {
    try {
      const response = await fetch(
        `/api/cache/keys?pattern=${encodeURIComponent(pattern || '*')}`
      );
      const result = await response.json();
      
      if (result.success) {
        return result.data.keys;
      }
      return [];
    } catch (error) {
      console.error('Error getting cache keys:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    fetchStats,
    clearCache,
    getCacheKeys,
  };
}