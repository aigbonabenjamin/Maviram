"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LogOut, Users, Package, Truck, ShoppingCart, Activity, Trash2 } from 'lucide-react';
import { GarbageCollector } from '@/components/admin/GarbageCollector';
import { CacheManager } from '@/components/admin/CacheManager';
import { ConcurrentUsers } from '@/components/admin/ConcurrentUsers';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logFilters, setLogFilters] = useState({
    userRole: '',
    activityType: '',
    search: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [ordersRes, usersRes, transactionsRes, productsRes, logsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/users'),
        fetch('/api/transactions'),
        fetch('/api/products'),
        fetch('/api/activity-logs?limit=50')
      ]);

      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();
      const transactionsData = await transactionsRes.json();
      const productsData = await productsRes.json();
      const logsData = await logsRes.json();

      setOrders(ordersData);
      setUsers(usersData);
      setDrivers(usersData.filter((u: any) => u.role === 'driver'));
      setTransactions(transactionsData);
      setProducts(productsData);
      setActivityLogs(logsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (logFilters.userRole) params.append('userRole', logFilters.userRole);
      if (logFilters.activityType) params.append('activityType', logFilters.activityType);
      if (logFilters.search) params.append('search', logFilters.search);
      params.append('limit', '50');

      const response = await fetch(`/api/activity-logs?${params.toString()}`);
      const data = await response.json();
      setActivityLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      payment_received: 'bg-blue-500',
      seller_confirmed: 'bg-indigo-500',
      driver_assigned: 'bg-purple-500',
      picked_up: 'bg-orange-500',
      in_transit: 'bg-orange-600',
      delivered: 'bg-green-500',
      buyer_approved: 'bg-green-600',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      login: 'bg-blue-500',
      logout: 'bg-gray-500',
      register: 'bg-green-500',
      create: 'bg-green-600',
      update: 'bg-yellow-500',
      delete: 'bg-red-500',
      view: 'bg-indigo-500',
      error: 'bg-red-600',
    };
    return colors[type] || 'bg-gray-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-green-600' },
    { label: 'Active Drivers', value: drivers.length, icon: Truck, color: 'text-orange-600' },
    { label: 'Products Listed', value: products.length, icon: Package, color: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-purple-600">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.fullName}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            <TabsTrigger value="concurrent">Concurrent Users</TabsTrigger>
            <TabsTrigger value="garbage">Garbage Collector</TabsTrigger>
            <TabsTrigger value="cache">Cache Manager</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <Card key={stat.label} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className={`w-12 h-12 ${stat.color}`} />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Phone</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-left py-2">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-2">{user.fullName}</td>
                        <td className="py-2">{user.phoneNumber}</td>
                        <td className="py-2">
                          <Badge>{user.role}</Badge>
                        </td>
                        <td className="py-2 text-sm text-gray-600">{user.location || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Management</h2>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                  orders.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Order #{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">Buyer ID: {order.buyerId}</p>
                          <p className="text-sm text-gray-600">Amount: ₦{order.totalAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 mt-2">{order.deliveryAddress}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(order.status)} text-white mb-2`}>
                            {order.status.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                          <p className="text-xs text-gray-500">{order.paymentStatus}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Activity Logs</h2>
                <Button onClick={fetchData} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium mb-1 block">User Role</label>
                  <select
                    value={logFilters.userRole}
                    onChange={(e) => setLogFilters({ ...logFilters, userRole: e.target.value })}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Activity Type</label>
                  <select
                    value={logFilters.activityType}
                    onChange={(e) => setLogFilters({ ...logFilters, activityType: e.target.value })}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="register">Register</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="view">View</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Search</label>
                  <input
                    type="text"
                    value={logFilters.search}
                    onChange={(e) => setLogFilters({ ...logFilters, search: e.target.value })}
                    placeholder="Search descriptions..."
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </div>
              </div>

              <Button onClick={fetchFilteredLogs} className="mb-4 w-full md:w-auto">
                Apply Filters
              </Button>

              {/* Activity Log List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {activityLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No activity logs found</p>
                ) : (
                  activityLogs.map((log: any) => (
                    <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getActivityTypeColor(log.activityType)} text-white`}>
                            {log.activityType}
                          </Badge>
                          {log.userRole && (
                            <Badge variant="outline">{log.userRole}</Badge>
                          )}
                          {log.entityType && (
                            <Badge variant="secondary">{log.entityType}</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{log.description}</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        {log.userId && <p>User ID: {log.userId}</p>}
                        {log.entityId && <p>Entity ID: {log.entityId}</p>}
                        {log.ipAddress && <p>IP: {log.ipAddress}</p>}
                        {log.metadata && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-blue-600">View Metadata</summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Concurrent Users Tab */}
          <TabsContent value="concurrent">
            <ConcurrentUsers />
          </TabsContent>

          {/* Garbage Collector Tab */}
          <TabsContent value="garbage">
            <GarbageCollector />
          </TabsContent>

          {/* Cache Manager Tab */}
          <TabsContent value="cache">
            <CacheManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}