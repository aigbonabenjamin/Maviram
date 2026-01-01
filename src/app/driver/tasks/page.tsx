"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, MapPin, Phone, Package, CheckCircle } from 'lucide-react';

export default function DriverTasks() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return;
    
    if (!user || user.role !== 'driver') {
      router.push('/');
      return;
    }

    fetchTasks();
  }, [user, router, authLoading]);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/delivery-tasks?driverId=${user.id}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/delivery-tasks?id=${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      assigned: 'bg-blue-500',
      en_route_to_pickup: 'bg-indigo-500',
      at_pickup: 'bg-purple-500',
      picked_up: 'bg-orange-500',
      en_route_to_delivery: 'bg-orange-600',
      delivered: 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: Record<string, string> = {
      assigned: 'en_route_to_pickup',
      en_route_to_pickup: 'at_pickup',
      at_pickup: 'picked_up',
      picked_up: 'en_route_to_delivery',
      en_route_to_delivery: 'delivered'
    };
    return statusFlow[currentStatus] || null;
  };

  const getNextStatusLabel = (currentStatus: string): string => {
    const labels: Record<string, string> = {
      assigned: 'Start Pickup',
      en_route_to_pickup: 'Arrived at Pickup',
      at_pickup: 'Mark as Picked Up',
      picked_up: 'Start Delivery',
      en_route_to_delivery: 'Mark as Delivered'
    };
    return labels[currentStatus] || 'Update Status';
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-orange-600">Delivery Tasks</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.fullName}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tasks.length === 0 ? (
            <Card className="col-span-full p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No delivery tasks assigned yet</p>
            </Card>
          ) : (
            tasks.map((task: any) => {
              const productDetails = typeof task.productDetails === 'string' 
                ? JSON.parse(task.productDetails) 
                : task.productDetails;

              return (
                <Card key={task.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">Order #{task.orderId}</h3>
                    <Badge className={`${getStatusColor(task.status)} text-white`}>
                      {task.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </div>

                  {/* Pickup Information */}
                  <div className="mb-4 pb-4 border-b">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                      Pickup Location
                    </h4>
                    <p className="text-sm text-gray-700">{task.pickupAddress}</p>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Phone className="w-3 h-3 mr-1" />
                      {task.pickupContact}
                    </p>
                  </div>

                  {/* Delivery Information */}
                  <div className="mb-4 pb-4 border-b">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-green-600" />
                      Delivery Location
                    </h4>
                    <p className="text-sm text-gray-700">{task.deliveryAddress}</p>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Phone className="w-3 h-3 mr-1" />
                      {task.deliveryContact}
                    </p>
                  </div>

                  {/* Product Details */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Product Details
                    </h4>
                    {productDetails.items && (
                      <p className="text-sm text-gray-700">
                        Items: {productDetails.items.join(', ')}
                      </p>
                    )}
                    {productDetails.totalWeight && (
                      <p className="text-sm text-gray-600">
                        Weight: {productDetails.totalWeight}
                      </p>
                    )}
                  </div>

                  {/* Timestamps */}
                  {task.pickupTimestamp && (
                    <p className="text-xs text-gray-500 mb-1">
                      Picked up: {new Date(task.pickupTimestamp).toLocaleString()}
                    </p>
                  )}
                  {task.deliveryTimestamp && (
                    <p className="text-xs text-gray-500 mb-4">
                      Delivered: {new Date(task.deliveryTimestamp).toLocaleString()}
                    </p>
                  )}

                  {/* Action Button */}
                  {task.status !== 'delivered' && getNextStatus(task.status) && (
                    <Button
                      onClick={() => updateTaskStatus(task.id, getNextStatus(task.status)!)}
                      className="w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {getNextStatusLabel(task.status)}
                    </Button>
                  )}

                  {task.status === 'delivered' && (
                    <Badge className="w-full py-2 bg-green-500 text-white text-center">
                      Task Completed
                    </Badge>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}