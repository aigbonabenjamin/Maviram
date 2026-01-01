"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download } from 'lucide-react';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  storedProcedure?: string;
  params?: { name: string; type: string; description: string }[];
  example?: any;
  category: string;
}

const apiEndpoints: ApiEndpoint[] = [
  // Authentication
  {
    category: 'Authentication',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Login with phone number and PIN',
    storedProcedure: 'sp_get_user_by_phone',
    params: [
      { name: 'phoneNumber', type: 'string', description: 'User phone number' },
      { name: 'pin', type: 'string', description: '4-digit PIN' },
    ],
    example: {
      phoneNumber: '08012345678',
      pin: '1234',
    },
  },
  {
    category: 'Authentication',
    method: 'POST',
    path: '/api/auth/register',
    description: 'Register a new user',
    storedProcedure: 'sp_create_user',
    params: [
      { name: 'role', type: 'string', description: 'seller, buyer, driver, or admin (required)' },
      { name: 'phoneNumber', type: 'string', description: 'Phone number (required, unique)' },
      { name: 'pin', type: 'string', description: '4-digit PIN (required)' },
      { name: 'fullName', type: 'string', description: 'Full name (required)' },
      { name: 'email', type: 'string', description: 'Email address (optional)' },
      { name: 'middleName', type: 'string', description: 'Middle name (optional)' },
      { name: 'gender', type: 'string', description: 'Gender (optional)' },
      { name: 'dateOfBirth', type: 'string', description: 'Date of birth (optional)' },
      { name: 'address', type: 'string', description: 'Address (optional)' },
      { name: 'location', type: 'string', description: 'Location (optional)' },
      { name: 'bankAccountNumber', type: 'string', description: 'Bank account number (optional)' },
      { name: 'bankAccountName', type: 'string', description: 'Bank account name (optional)' },
      { name: 'bankName', type: 'string', description: 'Bank name (optional)' },
    ],
    example: {
      role: 'buyer',
      phoneNumber: '08099999999',
      pin: '9999',
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      gender: 'female',
      address: '123 Main St, Lagos',
    },
  },
  // Users
  {
    category: 'Users',
    method: 'GET',
    path: '/api/users',
    description: 'Get all users',
    storedProcedure: 'sp_get_all_users',
  },
  {
    category: 'Users',
    method: 'POST',
    path: '/api/users',
    description: 'Create a new user',
    storedProcedure: 'sp_create_user',
    params: [
      { name: 'phoneNumber', type: 'string', description: 'User phone number' },
      { name: 'pin', type: 'string', description: '4-digit PIN' },
      { name: 'fullName', type: 'string', description: 'Full name' },
      { name: 'role', type: 'string', description: 'seller, buyer, driver, or admin' },
      { name: 'email', type: 'string', description: 'Email address (optional)' },
    ],
    example: {
      phoneNumber: '08012345678',
      pin: '1234',
      fullName: 'John Doe',
      role: 'buyer',
      email: 'john@example.com',
    },
  },
  // Products
  {
    category: 'Products',
    method: 'GET',
    path: '/api/products',
    description: 'Get all products',
    storedProcedure: 'sp_get_all_products',
  },
  {
    category: 'Products',
    method: 'POST',
    path: '/api/products',
    description: 'Create a new product',
    storedProcedure: 'sp_create_product',
    params: [
      { name: 'sellerId', type: 'number', description: 'Seller user ID' },
      { name: 'name', type: 'string', description: 'Product name' },
      { name: 'quantity', type: 'number', description: 'Quantity available' },
      { name: 'price', type: 'number', description: 'Price per unit' },
      { name: 'description', type: 'string', description: 'Product description (optional)' },
    ],
    example: {
      sellerId: 1,
      name: 'Maize',
      quantity: 5,
      price: 1000,
      description: '5 bags of premium maize',
    },
  },
  {
    category: 'Products',
    method: 'PATCH',
    path: '/api/products/[id]/status',
    description: 'Update product status',
    storedProcedure: 'sp_update_product_status',
    params: [
      { name: 'status', type: 'string', description: 'available, ordered, out_for_delivery, or delivered' },
    ],
    example: {
      status: 'out_for_delivery',
    },
  },
  // Orders
  {
    category: 'Orders',
    method: 'GET',
    path: '/api/orders',
    description: 'Get all orders',
    storedProcedure: 'sp_get_all_orders',
  },
  {
    category: 'Orders',
    method: 'POST',
    path: '/api/orders',
    description: 'Create a new order',
    storedProcedure: 'sp_create_order',
    params: [
      { name: 'buyerId', type: 'number', description: 'Buyer user ID' },
      { name: 'sellerId', type: 'number', description: 'Seller user ID' },
      { name: 'totalAmount', type: 'number', description: 'Total order amount' },
      { name: 'deliveryAddress', type: 'string', description: 'Delivery address' },
    ],
    example: {
      buyerId: 2,
      sellerId: 1,
      totalAmount: 5000,
      deliveryAddress: '123 Main Street, Lagos',
    },
  },
  {
    category: 'Orders',
    method: 'PATCH',
    path: '/api/orders/[id]/status',
    description: 'Update order status',
    storedProcedure: 'sp_update_order_status',
    params: [
      { name: 'status', type: 'string', description: 'pending, payment_received, seller_confirmed, driver_assigned, picked_up, in_transit, delivered, buyer_approved, or rejected' },
    ],
    example: {
      status: 'delivered',
    },
  },
  // Delivery Tasks
  {
    category: 'Delivery Tasks',
    method: 'GET',
    path: '/api/delivery-tasks',
    description: 'Get all delivery tasks',
    storedProcedure: 'sp_get_all_delivery_tasks',
  },
  {
    category: 'Delivery Tasks',
    method: 'POST',
    path: '/api/delivery-tasks',
    description: 'Create a delivery task',
    storedProcedure: 'sp_create_delivery_task',
    params: [
      { name: 'orderId', type: 'number', description: 'Order ID' },
      { name: 'driverId', type: 'number', description: 'Driver user ID' },
      { name: 'pickupAddress', type: 'string', description: 'Pickup address' },
      { name: 'deliveryAddress', type: 'string', description: 'Delivery address' },
    ],
    example: {
      orderId: 1,
      driverId: 3,
      pickupAddress: '456 Farm Road',
      deliveryAddress: '123 Main Street, Lagos',
    },
  },
  // Proof of Delivery
  {
    category: 'Proof of Delivery',
    method: 'GET',
    path: '/api/proof-of-delivery',
    description: 'Get all proof of delivery records (supports pagination and filtering)',
    storedProcedure: 'sp_get_proof_of_delivery, sp_get_pod_by_delivery_task, sp_get_pod_by_order',
    params: [
      { name: 'id', type: 'number', description: 'Proof ID (query param, optional)' },
      { name: 'deliveryTaskId', type: 'number', description: 'Delivery task ID filter (query param, optional)' },
      { name: 'orderId', type: 'number', description: 'Order ID filter (query param, optional)' },
      { name: 'limit', type: 'number', description: 'Results per page (query param, optional, max 100)' },
      { name: 'offset', type: 'number', description: 'Pagination offset (query param, optional)' },
    ],
    example: null,
  },
  {
    category: 'Proof of Delivery',
    method: 'POST',
    path: '/api/proof-of-delivery',
    description: 'Create proof of delivery',
    storedProcedure: 'sp_create_proof_of_delivery',
    params: [
      { name: 'deliveryTaskId', type: 'number', description: 'Delivery task ID (required)' },
      { name: 'orderId', type: 'number', description: 'Order ID (required)' },
      { name: 'buyerSignature', type: 'string', description: 'Buyer signature base64 or URL (required)' },
      { name: 'deliveryPhotos', type: 'array', description: 'Array of photo URLs (required)' },
      { name: 'buyerConfirmation', type: 'number', description: '0 or 1 (required)' },
      { name: 'buyerFeedback', type: 'string', description: 'Feedback text (optional)' },
    ],
    example: {
      deliveryTaskId: 1,
      orderId: 1,
      buyerSignature: 'data:image/png;base64,iVBORw0KG...',
      deliveryPhotos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      buyerConfirmation: 1,
      buyerFeedback: 'Product received in good condition',
    },
  },
  {
    category: 'Proof of Delivery',
    method: 'PUT',
    path: '/api/proof-of-delivery?id=1',
    description: 'Update proof of delivery',
    storedProcedure: 'Direct update',
    params: [
      { name: 'id', type: 'number', description: 'Proof ID (query param, required)' },
      { name: 'buyerSignature', type: 'string', description: 'Updated signature (optional)' },
      { name: 'deliveryPhotos', type: 'array', description: 'Updated photos (optional)' },
      { name: 'buyerConfirmation', type: 'number', description: 'Updated confirmation (optional)' },
      { name: 'buyerFeedback', type: 'string', description: 'Updated feedback (optional)' },
    ],
    example: {
      buyerFeedback: 'Updated feedback text',
    },
  },
  {
    category: 'Proof of Delivery',
    method: 'DELETE',
    path: '/api/proof-of-delivery?id=1',
    description: 'Delete proof of delivery',
    storedProcedure: 'sp_delete_pod',
    params: [
      { name: 'id', type: 'number', description: 'Proof ID (query param, required)' },
    ],
    example: null,
  },
  // Notifications
  {
    category: 'Notifications',
    method: 'GET',
    path: '/api/notifications',
    description: 'Get all notifications',
    storedProcedure: 'sp_get_all_notifications',
  },
  // Transactions
  {
    category: 'Transactions',
    method: 'GET',
    path: '/api/transactions',
    description: 'Get all transactions',
    storedProcedure: 'sp_get_all_transactions',
  },
];

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [testBody, setTestBody] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(apiEndpoints.map(e => e.category)))];
  const filteredEndpoints = selectedCategory === 'All' 
    ? apiEndpoints 
    : apiEndpoints.filter(e => e.category === selectedCategory);

  const downloadDocumentation = () => {
    let markdown = `# Maviram API Documentation\n\n`;
    markdown += `## Base URL\n\n`;
    markdown += `- **Development:** \`http://localhost:3000\`\n`;
    markdown += `- **Production:** \`your-domain.com\`\n\n`;
    markdown += `## Authentication\n\nAll authenticated endpoints require a bearer token in the Authorization header:\n\`\`\`\nAuthorization: Bearer <your-token>\n\`\`\`\n\n`;
    markdown += `## Endpoints\n\n`;

    const categorizedEndpoints = categories.filter(c => c !== 'All').reduce((acc, category) => {
      acc[category] = apiEndpoints.filter(e => e.category === category);
      return acc;
    }, {} as Record<string, ApiEndpoint[]>);

    Object.entries(categorizedEndpoints).forEach(([category, endpoints]) => {
      markdown += `### ${category}\n\n`;
      
      endpoints.forEach(endpoint => {
        markdown += `#### ${endpoint.description}\n\n`;
        markdown += `- **Method:** \`${endpoint.method}\`\n`;
        markdown += `- **Path:** \`${endpoint.path}\`\n`;
        if (endpoint.storedProcedure) {
          markdown += `- **Stored Procedure:** \`${endpoint.storedProcedure}\`\n`;
        }
        markdown += `\n`;

        if (endpoint.params && endpoint.params.length > 0) {
          markdown += `**Parameters:**\n\n`;
          markdown += `| Name | Type | Description |\n`;
          markdown += `|------|------|-------------|\n`;
          endpoint.params.forEach(param => {
            markdown += `| \`${param.name}\` | ${param.type} | ${param.description} |\n`;
          });
          markdown += `\n`;
        }

        if (endpoint.example) {
          markdown += `**Example Request:**\n\n`;
          markdown += `\`\`\`json\n${JSON.stringify(endpoint.example, null, 2)}\n\`\`\`\n\n`;
        }

        markdown += `---\n\n`;
      });
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'maviram-api-documentation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTest = async () => {
    if (!selectedEndpoint) return;

    setIsLoading(true);
    setTestResponse('');

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (selectedEndpoint.method !== 'GET' && testBody) {
        options.body = testBody;
      }

      const response = await fetch(selectedEndpoint.path, options);
      const data = await response.json();

      setTestResponse(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setTestResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Maviram API Documentation
              </h1>
              <p className="text-gray-600 mb-4">
                Complete REST API for the Maviram Food Delivery platform - Use across any platform or template
              </p>
            </div>
            <Button 
              onClick={downloadDocumentation}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Download Docs
            </Button>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Base URL:</strong> <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:3000</code> (development) or your deployed domain
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints List */}
          <div className="lg:col-span-1">
            <Card className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                Endpoints ({filteredEndpoints.length})
              </h2>
              <div className="space-y-2">
                {filteredEndpoints.map((endpoint, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedEndpoint(endpoint);
                      setTestBody(
                        endpoint.example ? JSON.stringify(endpoint.example, null, 2) : ''
                      );
                      setTestResponse('');
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedEndpoint === endpoint
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          endpoint.method === 'GET'
                            ? 'bg-blue-500 text-white'
                            : endpoint.method === 'POST'
                            ? 'bg-green-500 text-white'
                            : endpoint.method === 'PUT'
                            ? 'bg-yellow-500 text-white'
                            : endpoint.method === 'PATCH'
                            ? 'bg-orange-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <span className="text-xs text-gray-500">{endpoint.category}</span>
                    </div>
                    <span className="text-xs font-mono block truncate mb-1">
                      {endpoint.path}
                    </span>
                    <p className="text-xs text-gray-600">
                      {endpoint.description}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Endpoint Details */}
          <div className="lg:col-span-2">
            {selectedEndpoint ? (
              <Card className="p-6">
                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="test">Test</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-2">{selectedEndpoint.category}</div>
                      <h3 className="text-2xl font-bold mb-2">
                        {selectedEndpoint.description}
                      </h3>
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className={`px-3 py-1 rounded font-semibold ${
                            selectedEndpoint.method === 'GET'
                              ? 'bg-blue-500 text-white'
                              : selectedEndpoint.method === 'POST'
                              ? 'bg-green-500 text-white'
                              : selectedEndpoint.method === 'PUT'
                              ? 'bg-yellow-500 text-white'
                              : selectedEndpoint.method === 'PATCH'
                              ? 'bg-orange-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {selectedEndpoint.method}
                        </span>
                        <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                          {selectedEndpoint.path}
                        </code>
                      </div>
                    </div>

                    {selectedEndpoint.storedProcedure && (
                      <div>
                        <h4 className="font-semibold mb-2">Stored Procedure(s):</h4>
                        <code className="block bg-gray-100 p-3 rounded font-mono text-sm">
                          {selectedEndpoint.storedProcedure}
                        </code>
                      </div>
                    )}

                    {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Parameters:</h4>
                        <div className="space-y-2">
                          {selectedEndpoint.params.map((param, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="font-mono text-sm font-semibold">
                                  {param.name}
                                </code>
                                <span className="text-xs text-gray-500">
                                  ({param.type})
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {param.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEndpoint.example && (
                      <div>
                        <h4 className="font-semibold mb-2">Example Request Body:</h4>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
                          {JSON.stringify(selectedEndpoint.example, null, 2)}
                        </pre>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="test" className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Test Endpoint</h3>

                      {selectedEndpoint.method !== 'GET' && (
                        <div className="mb-4">
                          <Label htmlFor="requestBody" className="mb-2">
                            Request Body (JSON)
                          </Label>
                          <textarea
                            id="requestBody"
                            value={testBody}
                            onChange={(e) => setTestBody(e.target.value)}
                            className="w-full h-48 p-3 font-mono text-sm bg-gray-50 border rounded"
                            placeholder="Enter JSON request body..."
                          />
                        </div>
                      )}

                      <Button
                        onClick={handleTest}
                        disabled={isLoading}
                        className="w-full mb-4"
                      >
                        {isLoading ? 'Testing...' : 'Send Request'}
                      </Button>

                      {testResponse && (
                        <div>
                          <Label className="mb-2">Response:</Label>
                          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto max-h-96">
                            {testResponse}
                          </pre>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Select an endpoint from the list to view details and test it
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}