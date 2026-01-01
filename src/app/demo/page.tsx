"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Package, Truck, Settings, ArrowRight, Eye } from 'lucide-react';

export default function DemoPage() {
  const router = useRouter();

  const demoInterfaces = [
    {
      title: 'Buyer Marketplace',
      description: 'Browse products, add to cart, place orders, and track deliveries',
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      route: '/buyer/marketplace',
      features: ['Product browsing', 'Shopping cart', 'Order tracking', 'Real-time status updates']
    },
    {
      title: 'Seller Dashboard',
      description: 'List products, manage inventory, view orders, and track sales',
      icon: Package,
      color: 'from-green-500 to-green-600',
      route: '/seller/products',
      features: ['Product listing (Add/Edit/Delete)', 'Inventory management', 'Order notifications', 'Sales tracking']
    },
    {
      title: 'Driver/Delivery Interface',
      description: 'View delivery tasks, pickup verification, and complete deliveries',
      icon: Truck,
      color: 'from-orange-500 to-orange-600',
      route: '/driver/tasks',
      features: ['Task assignment', 'Pickup verification', 'Delivery confirmation', 'Electronic proof of delivery']
    },
    {
      title: 'Admin Dashboard',
      description: 'Manage users, monitor orders, track transactions, and oversee operations',
      icon: Settings,
      color: 'from-purple-500 to-purple-600',
      route: '/admin/dashboard',
      features: ['Order tracking', 'User management', 'Transaction monitoring', 'System analytics']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-600">Maviram Demo</h1>
              <p className="text-gray-600 text-sm">Preview all interfaces and features</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Eye className="w-8 h-8 text-green-600" />
          <h2 className="text-4xl font-bold text-gray-900">
            Explore the Platform
          </h2>
        </div>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Click on any interface below to see how the app works for different user roles.
          Experience the complete delivery flow from order to delivery.
        </p>
      </section>

      {/* Demo Interfaces */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {demoInterfaces.map((demo) => (
            <Card 
              key={demo.route}
              className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${demo.color} flex items-center justify-center flex-shrink-0`}>
                  <demo.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2">{demo.title}</h3>
                  <p className="text-gray-600">{demo.description}</p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-sm text-gray-700 uppercase">Key Features</h4>
                <ul className="space-y-2">
                  {demo.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* View Button */}
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                onClick={() => router.push(demo.route)}
              >
                <span>View {demo.title}</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Flow Diagram */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-12">Complete Delivery Flow</h3>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-2">Buyer Orders</h4>
                <p className="text-sm text-gray-600">Browse and purchase products</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-2">Seller Confirms</h4>
                <p className="text-sm text-gray-600">Prepare order for pickup</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-2">Driver Delivers</h4>
                <p className="text-sm text-gray-600">Pickup and delivery with verification</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-semibold mb-2">Admin Monitors</h4>
                <p className="text-sm text-gray-600">Track and manage operations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join Maviram today and start connecting buyers, sellers, and drivers.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => router.push('/register')}
            >
              Create Account
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-white text-green-600 hover:bg-gray-100"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Maviram Food Delivery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}