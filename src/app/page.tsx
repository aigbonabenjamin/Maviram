"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Package, Truck, Settings, LogOut, LayoutDashboard, Code, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect authenticated users to their dashboard
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'buyer':
          router.push('/buyer/marketplace');
          break;
        case 'seller':
          router.push('/seller/products');
          break;
        case 'driver':
          router.push('/driver/tasks');
          break;
      }
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'buyer':
        return '/buyer/marketplace';
      case 'seller':
        return '/seller/products';
      case 'driver':
        return '/driver/tasks';
      default:
        return '/';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'buyer':
        return 'bg-blue-100 text-blue-700';
      case 'seller':
        return 'bg-green-100 text-green-700';
      case 'driver':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const roles = [
    {
      title: 'Buyer',
      description: 'Browse and purchase fresh farm products',
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      route: 'buyer'
    },
    {
      title: 'Seller',
      description: 'List and sell your farm products',
      icon: Package,
      color: 'from-green-500 to-green-600',
      route: 'seller'
    },
    {
      title: 'Driver',
      description: 'Deliver products and earn',
      icon: Truck,
      color: 'from-orange-500 to-orange-600',
      route: 'driver'
    },
    {
      title: 'Administrator',
      description: 'Manage platform operations',
      icon: Settings,
      color: 'from-purple-500 to-purple-600',
      route: 'admin'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-600">Maviram</h1>
              <p className="text-gray-600 text-sm">We make it happen</p>
            </div>
            
            {/* Authentication UI */}
            <div className="flex items-center gap-3">
              {/* Database Viewer Button */}
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/database')}
                className="flex items-center gap-2 border-purple-500 text-purple-700 hover:bg-purple-50"
              >
                <Database className="w-4 h-4" />
                Database Viewer
              </Button>

              {/* API Documentation Button */}
              <Button 
                variant="outline" 
                onClick={() => router.push('/api-docs')}
                className="flex items-center gap-2 border-green-500 text-green-700 hover:bg-green-50"
              >
                <Code className="w-4 h-4" />
                Mobile API Docs
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="text-left">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleBadgeColor(user.role)}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </p>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(getDashboardRoute())}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Go to Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/login')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => router.push('/register')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to Maviram
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connecting sellers with buyers through a trusted delivery network. 
          Fresh produce, secure payments, reliable delivery.
        </p>
      </section>

      {/* Role Selection */}
      <section className="container mx-auto px-4 pb-16">
        <h3 className="text-2xl font-bold text-center mb-8">Choose Your Role</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {roles.map((role) => (
            <Card 
              key={role.route}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(`/login?role=${role.route}`)}
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <role.icon className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{role.title}</h4>
              <p className="text-gray-600 mb-4">{role.description}</p>
              <Button 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/login?role=${role.route}`);
                }}
              >
                Get Started
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-12">Why Choose Maviram?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Fresh Products</h4>
              <p className="text-gray-600">Direct from sellers, verified quality</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Secure Escrow</h4>
              <p className="text-gray-600">Payment protection for buyers and sellers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-semibold mb-2">Reliable Delivery</h4>
              <p className="text-gray-600">Track your orders in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 IdaDav Tech Solution. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}