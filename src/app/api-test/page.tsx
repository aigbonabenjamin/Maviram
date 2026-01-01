"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApiEndpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  sampleBody?: string;
}

const apiEndpoints: ApiEndpoint[] = [
  // Auth APIs
  { name: "Login", method: "POST", path: "/api/auth/login", description: "User login", sampleBody: '{"phone": "1234567890", "pin": "1234"}' },
  { name: "Register", method: "POST", path: "/api/auth/register", description: "User registration", sampleBody: '{"phone": "1234567890", "pin": "1234", "name": "John Doe", "role": "buyer"}' },
  
  // User APIs
  { name: "Get Users", method: "GET", path: "/api/users", description: "Get all users" },
  { name: "Get User by ID", method: "GET", path: "/api/users?id=1", description: "Get user by ID" },
  { name: "Update User", method: "PUT", path: "/api/users", description: "Update user", sampleBody: '{"id": 1, "name": "Updated Name"}' },
  { name: "Delete User", method: "DELETE", path: "/api/users?id=1", description: "Delete user" },
  
  // Product APIs
  { name: "Get Products", method: "GET", path: "/api/products", description: "Get all products" },
  { name: "Get Product by ID", method: "GET", path: "/api/products/1", description: "Get product by ID" },
  { name: "Create Product", method: "POST", path: "/api/products", description: "Create product", sampleBody: '{"sellerId": 1, "name": "Maize", "quantity": 5, "pricePerUnit": 100, "unit": "bags"}' },
  { name: "Update Product", method: "PUT", path: "/api/products/1", description: "Update product", sampleBody: '{"name": "Updated Maize", "quantity": 10}' },
  { name: "Delete Product", method: "DELETE", path: "/api/products/1", description: "Delete product" },
  { name: "Update Product Status", method: "PUT", path: "/api/products/1/status", description: "Update product status", sampleBody: '{"status": "available"}' },
  
  // Order APIs
  { name: "Get Orders", method: "GET", path: "/api/orders", description: "Get all orders" },
  { name: "Get Order by ID", method: "GET", path: "/api/orders/1", description: "Get order by ID" },
  { name: "Create Order", method: "POST", path: "/api/orders", description: "Create order", sampleBody: '{"buyerId": 1, "totalAmount": 500, "deliveryAddress": "123 Main St"}' },
  { name: "Update Order Status", method: "PUT", path: "/api/orders/1/status", description: "Update order status", sampleBody: '{"status": "confirmed"}' },
  
  // Order Items APIs
  { name: "Get Order Items", method: "GET", path: "/api/order-items?orderId=1", description: "Get order items" },
  { name: "Create Order Item", method: "POST", path: "/api/order-items", description: "Create order item", sampleBody: '{"orderId": 1, "productId": 1, "quantity": 2, "pricePerUnit": 100}' },
  
  // Delivery Task APIs
  { name: "Get Delivery Tasks", method: "GET", path: "/api/delivery-tasks", description: "Get all delivery tasks" },
  { name: "Create Delivery Task", method: "POST", path: "/api/delivery-tasks", description: "Create delivery task", sampleBody: '{"orderId": 1, "driverId": 1, "pickupAddress": "Farm A", "deliveryAddress": "123 Main St"}' },
  { name: "Update Delivery Task", method: "PUT", path: "/api/delivery-tasks", description: "Update delivery task", sampleBody: '{"id": 1, "status": "picked_up"}' },
  
  // Transaction APIs
  { name: "Get Transactions", method: "GET", path: "/api/transactions", description: "Get all transactions" },
  { name: "Create Transaction", method: "POST", path: "/api/transactions", description: "Create transaction", sampleBody: '{"orderId": 1, "amount": 500, "type": "payment", "status": "completed"}' },
  
  // Proof of Delivery APIs
  { name: "Get Proofs", method: "GET", path: "/api/proof-of-delivery", description: "Get all proofs of delivery" },
  { name: "Create Proof", method: "POST", path: "/api/proof-of-delivery", description: "Create proof of delivery", sampleBody: '{"deliveryTaskId": 1, "orderId": 1, "buyerSignature": "data:image/png;base64,iVBOR...", "buyerConfirmation": 1, "legalAgreementAccepted": 1, "legalAgreementVersion": "1.0"}' },
  
  // Session APIs
  { name: "Register Session", method: "POST", path: "/api/sessions/register", description: "Register active session", sampleBody: '{"userId": 1, "role": "buyer"}' },
  { name: "Session Heartbeat", method: "POST", path: "/api/sessions/heartbeat", description: "Send heartbeat", sampleBody: '{"sessionId": "abc123"}' },
  { name: "Unregister Session", method: "POST", path: "/api/sessions/unregister", description: "Unregister session", sampleBody: '{"sessionId": "abc123"}' },
  { name: "Get Active Sessions", method: "GET", path: "/api/sessions/active", description: "Get active sessions" },
  { name: "Get Session Stats", method: "GET", path: "/api/sessions/stats", description: "Get session statistics" },
  
  // Cache APIs
  { name: "Get Cache Stats", method: "GET", path: "/api/cache/stats", description: "Get cache statistics" },
  { name: "Get Cache Keys", method: "GET", path: "/api/cache/keys", description: "Get all cache keys" },
  { name: "Clear Cache", method: "POST", path: "/api/cache/clear", description: "Clear cache", sampleBody: '{"pattern": "*"}' },
  
  // Garbage Collector APIs
  { name: "Scan Abandoned", method: "POST", path: "/api/garbage-collector/scan", description: "Scan for abandoned processes", sampleBody: '{"dryRun": true}' },
  { name: "Get Abandoned", method: "GET", path: "/api/garbage-collector/abandoned", description: "Get abandoned processes" },
  { name: "Cleanup", method: "POST", path: "/api/garbage-collector/cleanup", description: "Cleanup old data", sampleBody: '{"dryRun": true, "olderThanDays": 30}' },
  
  // Activity Log APIs
  { name: "Get Activity Logs", method: "GET", path: "/api/activity-logs", description: "Get activity logs" },
  
  // Notification APIs
  { name: "Get Notifications", method: "GET", path: "/api/notifications", description: "Get notifications" },
  { name: "Send Notification", method: "POST", path: "/api/notifications", description: "Send notification", sampleBody: '{"userId": 1, "type": "order_update", "message": "Your order is ready"}' },
];

export default function ApiTestPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [customPath, setCustomPath] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEndpointChange = (endpointName: string) => {
    const endpoint = apiEndpoints.find(e => e.name === endpointName);
    if (endpoint) {
      setSelectedEndpoint(endpoint);
      setCustomPath(endpoint.path);
      setRequestBody(endpoint.sampleBody || '');
      setResponse(null);
      setError(null);
    }
  };

  const handleTest = async () => {
    if (!customPath) {
      setError('Please enter an API path');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const method = selectedEndpoint?.method || 'GET';
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if ((method === 'POST' || method === 'PUT') && requestBody) {
        try {
          JSON.parse(requestBody); // Validate JSON
          options.body = requestBody;
        } catch (e) {
          setError('Invalid JSON in request body');
          setIsLoading(false);
          return;
        }
      }

      const res = await fetch(customPath, options);
      const data = await res.json();
      
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data: data,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Testing Interface</h1>
          <p className="text-gray-600">Test your Maviram API endpoints directly from the browser</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Request */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Request</h2>
            
            <div className="space-y-4">
              {/* Endpoint Selection */}
              <div>
                <Label htmlFor="endpoint">Select Endpoint</Label>
                <Select onValueChange={handleEndpointChange}>
                  <SelectTrigger id="endpoint">
                    <SelectValue placeholder="Choose an API endpoint" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {apiEndpoints.map((endpoint) => (
                      <SelectItem key={endpoint.name} value={endpoint.name}>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                            endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                            endpoint.method === 'PUT' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {endpoint.method}
                          </span>
                          <span>{endpoint.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEndpoint && (
                  <p className="text-sm text-gray-600 mt-1">{selectedEndpoint.description}</p>
                )}
              </div>

              {/* Method & Path */}
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <Label htmlFor="method">Method</Label>
                  <Input
                    id="method"
                    value={selectedEndpoint?.method || 'GET'}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="path">API Path</Label>
                  <Input
                    id="path"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="/api/..."
                  />
                </div>
              </div>

              {/* Request Body */}
              {selectedEndpoint?.method !== 'GET' && selectedEndpoint?.method !== 'DELETE' && (
                <div>
                  <Label htmlFor="body">Request Body (JSON)</Label>
                  <Textarea
                    id="body"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              {/* Test Button */}
              <Button 
                onClick={handleTest} 
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Testing...' : 'Test API'}
              </Button>
            </div>
          </Card>

          {/* Right Panel - Response */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Response</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <span className={`px-3 py-1 rounded ${
                    response.status >= 200 && response.status < 300 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {response.status} {response.statusText}
                  </span>
                </div>

                <div>
                  <Label>Response Data:</Label>
                  <div className="bg-gray-900 text-green-400 p-4 rounded mt-2 overflow-auto max-h-[500px]">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {!response && !error && (
              <div className="text-center text-gray-400 py-12">
                <p>No response yet. Select an endpoint and click "Test API".</p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Reference */}
        <Card className="mt-6 p-6">
          <h3 className="text-xl font-semibold mb-3">Quick Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">HTTP Methods:</h4>
              <ul className="space-y-1 text-gray-600">
                <li><span className="font-mono bg-green-100 px-2 py-0.5 rounded">GET</span> - Retrieve data</li>
                <li><span className="font-mono bg-blue-100 px-2 py-0.5 rounded">POST</span> - Create new data</li>
                <li><span className="font-mono bg-orange-100 px-2 py-0.5 rounded">PUT</span> - Update existing data</li>
                <li><span className="font-mono bg-red-100 px-2 py-0.5 rounded">DELETE</span> - Delete data</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Tips:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Make sure your request body is valid JSON</li>
                <li>• Check the sample body for each endpoint</li>
                <li>• Some APIs require authentication</li>
                <li>• Response will show status code and data</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}