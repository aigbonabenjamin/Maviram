"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Database, AlertCircle, User } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

type User = {
  id: string;
  role: string;
  phone_number: string;
  pin: string;
  email: string | null;
  full_name: string;
  middle_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  location: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  bank_name: string | null;
  education: string | null;
  nin: string | null;
  bvn: string | null;
  marital_status: string | null;
  has_vehicle: string | null;
  line_mark: string | null;
  created_at: string;
  updated_at: string;
};

export default function DatabaseViewerPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Database Viewer</h1>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-300 rounded-lg">
                <User className="w-4 h-4 text-purple-700" />
                <span className="text-sm font-medium text-purple-900">
                  {currentUser.full_name}
                </span>
                <span className="px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
            )}
            <Button onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Database Error</div>
              <div className="text-sm">{error}</div>
              {error.includes('Failed query') && (
                <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                  <p className="font-semibold text-sm mb-2">⚠️ MySQL tables not found</p>
                  <p className="text-sm mb-2">You need to run the MYSQL_SETUP.sql script:</p>
                  <ol className="text-sm list-decimal ml-5 space-y-1">
                    <li>Open MySQL Workbench</li>
                    <li>Connect with username: <code className="bg-red-100 px-1">Ida</code> and password: <code className="bg-red-100 px-1">12345</code></li>
                    <li>Go to File → Open SQL Script</li>
                    <li>Select <code className="bg-red-100 px-1">MYSQL_SETUP.sql</code> from project root</li>
                    <li>Click the lightning bolt (⚡) to execute</li>
                  </ol>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Users Table (All Columns)</h2>
          
          {loading && !error && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No users found in database</p>
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="text-left p-2 font-semibold">ID</th>
                    <th className="text-left p-2 font-semibold">Role</th>
                    <th className="text-left p-2 font-semibold">Phone</th>
                    <th className="text-left p-2 font-semibold">PIN</th>
                    <th className="text-left p-2 font-semibold">Full Name</th>
                    <th className="text-left p-2 font-semibold">Middle Name</th>
                    <th className="text-left p-2 font-semibold">Email</th>
                    <th className="text-left p-2 font-semibold">Gender</th>
                    <th className="text-left p-2 font-semibold">DOB</th>
                    <th className="text-left p-2 font-semibold">Address</th>
                    <th className="text-left p-2 font-semibold">Location</th>
                    <th className="text-left p-2 font-semibold">Bank Acct #</th>
                    <th className="text-left p-2 font-semibold">Bank Acct Name</th>
                    <th className="text-left p-2 font-semibold">Bank Name</th>
                    <th className="text-left p-2 font-semibold">Education</th>
                    <th className="text-left p-2 font-semibold">NIN</th>
                    <th className="text-left p-2 font-semibold">BVN</th>
                    <th className="text-left p-2 font-semibold">Marital Status</th>
                    <th className="text-left p-2 font-semibold">Has Vehicle</th>
                    <th className="text-left p-2 font-semibold">Line Mark</th>
                    <th className="text-left p-2 font-semibold">Created At</th>
                    <th className="text-left p-2 font-semibold">Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono">{user.id}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'seller' ? 'bg-green-100 text-green-700' :
                          user.role === 'buyer' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'driver' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-2">{user.phone_number}</td>
                      <td className="p-2 font-mono">****</td>
                      <td className="p-2">{user.full_name}</td>
                      <td className="p-2">{user.middle_name || '-'}</td>
                      <td className="p-2">{user.email || '-'}</td>
                      <td className="p-2">{user.gender || '-'}</td>
                      <td className="p-2">{user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : '-'}</td>
                      <td className="p-2">{user.address || '-'}</td>
                      <td className="p-2">{user.location || '-'}</td>
                      <td className="p-2">{user.bank_account_number || '-'}</td>
                      <td className="p-2">{user.bank_account_name || '-'}</td>
                      <td className="p-2">{user.bank_name || '-'}</td>
                      <td className="p-2">{user.education || '-'}</td>
                      <td className="p-2">{user.nin || '-'}</td>
                      <td className="p-2">{user.bvn || '-'}</td>
                      <td className="p-2">{user.marital_status || '-'}</td>
                      <td className="p-2">{user.has_vehicle || '-'}</td>
                      <td className="p-2">{user.line_mark || '-'}</td>
                      <td className="p-2">{new Date(user.created_at).toLocaleString()}</td>
                      <td className="p-2">{new Date(user.updated_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-600">
                Total users: <span className="font-semibold">{users.length}</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}