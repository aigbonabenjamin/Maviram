'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGarbageCollector } from '@/hooks/useGarbageCollector';
import { AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, Trash2, Search } from 'lucide-react';

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

export function GarbageCollector() {
  const {
    isScanning,
    isLoading,
    isCleaning,
    scanForAbandoned,
    getAbandonedProcesses,
    updateAbandonedProcess,
    cleanup,
  } = useGarbageCollector();

  const [abandonedProcesses, setAbandonedProcesses] = useState<AbandonedProcess[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [filters, setFilters] = useState({
    processType: '',
    status: '',
  });
  const [scanResults, setScanResults] = useState<any>(null);
  const [selectedProcess, setSelectedProcess] = useState<AbandonedProcess | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  useEffect(() => {
    fetchAbandonedProcesses();
  }, []);

  const fetchAbandonedProcesses = async () => {
    const data = await getAbandonedProcesses({
      processType: filters.processType || undefined,
      status: filters.status || undefined,
      limit: 50,
      offset: 0,
    });

    if (data) {
      setAbandonedProcesses(data.data);
      setSummary(data.summary);
    }
  };

  const handleScan = async () => {
    const result = await scanForAbandoned(undefined, false);
    if (result) {
      setScanResults(result);
      await fetchAbandonedProcesses();
    }
  };

  const handleUpdateStatus = async (
    id: number,
    status: 'notified' | 'resolved' | 'escalated'
  ) => {
    const updated = await updateAbandonedProcess(
      id,
      status,
      status === 'resolved' ? resolutionText : undefined
    );

    if (updated) {
      await fetchAbandonedProcesses();
      setSelectedProcess(null);
      setResolutionText('');
    }
  };

  const handleCleanup = async () => {
    const result = await cleanup(undefined, 30, false);
    if (result) {
      alert(`Cleanup completed: ${result.cleanupResults.abandonedProcessesDeleted} processes deleted`);
      await fetchAbandonedProcesses();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      detected: 'bg-yellow-500',
      notified: 'bg-blue-500',
      resolved: 'bg-green-500',
      escalated: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getProcessTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      order: '📦',
      delivery_task: '🚚',
      transaction: '💰',
      activity_log: '📝',
    };
    return icons[type] || '📄';
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              Garbage Collector
            </h2>
            <p className="text-sm text-gray-600">Monitor and manage abandoned processes</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Scan Now
                </>
              )}
            </Button>
            <Button
              onClick={handleCleanup}
              disabled={isCleaning}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              {isCleaning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cleanup Resolved
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Scan Results */}
        {scanResults && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-orange-600" />
              Scan Results
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Found</p>
                <p className="text-2xl font-bold text-orange-600">{scanResults.totalFound}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">New Detections</p>
                <p className="text-2xl font-bold text-green-600">{scanResults.totalNewDetections}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-xl font-semibold">{scanResults.scanResults.order.found}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deliveries</p>
                <p className="text-xl font-semibold">{scanResults.scanResults.delivery_task.found}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4 border-2 border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-orange-600">{summary.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Detected</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.byStatus.detected || 0}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Notified</p>
              <p className="text-2xl font-bold text-blue-600">{summary.byStatus.notified || 0}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Escalated</p>
              <p className="text-2xl font-bold text-red-600">{summary.byStatus.escalated || 0}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{summary.byStatus.resolved || 0}</p>
            </Card>
          </div>
        )}
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Process Type</label>
            <select
              value={filters.processType}
              onChange={(e) => setFilters({ ...filters, processType: e.target.value })}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="">All Types</option>
              <option value="order">Orders</option>
              <option value="delivery_task">Delivery Tasks</option>
              <option value="transaction">Transactions</option>
              <option value="activity_log">Activity Logs</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="notified">Notified</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={fetchAbandonedProcesses} className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Abandoned Processes List */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Abandoned Processes ({abandonedProcesses.length})</h3>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {abandonedProcesses.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No abandoned processes found</p>
              <p className="text-sm text-gray-400">All systems running smoothly!</p>
            </div>
          ) : (
            abandonedProcesses.map((process) => (
              <div
                key={process.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getProcessTypeIcon(process.processType)}</span>
                    <div>
                      <p className="font-semibold capitalize">
                        {process.processType.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-600">Entity ID: {process.entityId}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(process.status)} text-white`}>
                    {process.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Detected</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(process.detectedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {process.lastNotifiedAt && (
                    <div>
                      <p className="text-gray-600">Last Notified</p>
                      <p className="font-medium">{new Date(process.lastNotifiedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {process.resolvedAt && (
                    <div>
                      <p className="text-gray-600">Resolved</p>
                      <p className="font-medium text-green-600">
                        {new Date(process.resolvedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {process.metadata && (
                  <details className="mb-3">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:underline">
                      View Details
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-xs space-y-1">
                      {Object.entries(process.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span className="text-gray-700">{JSON.stringify(value)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {process.resolutionAction && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-medium text-green-800 mb-1">Resolution Action:</p>
                    <p className="text-sm text-gray-700">{process.resolutionAction}</p>
                  </div>
                )}

                {process.status !== 'resolved' && (
                  <div className="flex gap-2 mt-3">
                    {process.status === 'detected' && (
                      <Button
                        onClick={() => handleUpdateStatus(process.id, 'notified')}
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-600"
                      >
                        Mark as Notified
                      </Button>
                    )}
                    {(process.status === 'detected' || process.status === 'notified') && (
                      <Button
                        onClick={() => handleUpdateStatus(process.id, 'escalated')}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600"
                      >
                        Escalate
                      </Button>
                    )}
                    <Button
                      onClick={() => setSelectedProcess(process)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Resolve
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Resolution Modal */}
      {selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Resolve Abandoned Process</h3>
            <p className="text-sm text-gray-600 mb-4">
              Type: {selectedProcess.processType.replace(/_/g, ' ')} (ID: {selectedProcess.entityId})
            </p>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Resolution Action *</label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Describe what action was taken to resolve this..."
                className="w-full border rounded-md p-2 text-sm min-h-[100px]"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setSelectedProcess(null);
                  setResolutionText('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateStatus(selectedProcess.id, 'resolved')}
                disabled={!resolutionText.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Resolve
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}