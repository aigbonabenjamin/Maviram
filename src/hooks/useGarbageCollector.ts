'use client';

import { useState } from 'react';

interface ScanResult {
  found: number;
  newDetections: number;
  alreadyTracked: number;
}

interface ScanResults {
  order: ScanResult;
  delivery_task: ScanResult;
  transaction: ScanResult;
  activity_log: ScanResult;
}

interface ScanResponse {
  success: boolean;
  scanResults: ScanResults;
  totalFound: number;
  totalNewDetections: number;
  dryRun: boolean;
  scannedAt: string;
}

interface AbandonedProcess {
  id: number;
  processType: string;
  entityId: number;
  status: string;
  detectedAt: string;
  lastNotifiedAt: string | null;
  resolvedAt: string | null;
  resolutionAction: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface AbandonedProcessesResponse {
  success: boolean;
  data: AbandonedProcess[];
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  };
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface CleanupResponse {
  success: boolean;
  cleanupResults: {
    abandonedProcessesDeleted: number;
    byType: Record<string, number>;
    activityLogsArchived: number;
    olderThanDays: number;
    dryRun: boolean;
  };
  message: string;
  cleanedAt: string;
}

export function useGarbageCollector() {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const scanForAbandoned = async (
    processTypes?: string[],
    dryRun: boolean = false
  ): Promise<ScanResponse | null> => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/garbage-collector/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processTypes,
          dryRun,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to scan for abandoned processes');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error scanning:', error);
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const getAbandonedProcesses = async (
    filters?: {
      processType?: string;
      status?: string;
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<AbandonedProcessesResponse | null> => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.processType) params.append('processType', filters.processType);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(
        `/api/garbage-collector/abandoned?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch abandoned processes');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching abandoned processes:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAbandonedProcess = async (
    id: number,
    status: 'notified' | 'resolved' | 'escalated',
    resolutionAction?: string
  ): Promise<AbandonedProcess | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/garbage-collector/abandoned/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          resolutionAction,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update abandoned process');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating abandoned process:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const cleanup = async (
    processTypes?: string[],
    olderThanDays?: number,
    dryRun: boolean = false
  ): Promise<CleanupResponse | null> => {
    setIsCleaning(true);
    try {
      const response = await fetch('/api/garbage-collector/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processTypes,
          olderThanDays,
          dryRun,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cleanup abandoned processes');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error cleaning up:', error);
      return null;
    } finally {
      setIsCleaning(false);
    }
  };

  return {
    isScanning,
    isLoading,
    isCleaning,
    scanForAbandoned,
    getAbandonedProcesses,
    updateAbandonedProcess,
    cleanup,
  };
}