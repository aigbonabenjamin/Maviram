"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LogOut, ShoppingCart, Package, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface CartItem {
  product: any;
  quantity: number;
}

export default function BuyerMarketplace() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return;
    
    if (!user || user.role !== 'buyer') {
      router.push('/');
      return;
    }

    fetchProducts();
    fetchMyOrders();
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('maviram_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [user, router, authLoading]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?status=available');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/orders?buyerId=${user.id}`);
      const data = await response.json();
      setMyOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { product, quantity: 1 }];
    }
    
    setCart(newCart);
    localStorage.setItem('maviram_cart', JSON.stringify(newCart));
  };

  const removeFromCart = (productId: number) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    setCart(newCart);
    localStorage.setItem('maviram_cart', JSON.stringify(newCart));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const newCart = cart.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    setCart(newCart);
    localStorage.setItem('maviram_cart', JSON.stringify(newCart));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.pricePerUnit * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user?.id,
          totalAmount: getTotalAmount(),
          deliveryAddress: user?.address || 'Not specified',
          status: 'pending',
          paymentStatus: 'pending'
        })
      });

      const order = await orderResponse.json();

      // Create order items
      for (const item of cart) {
        await fetch('/api/order-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            productId: item.product.id,
            sellerId: item.product.sellerId,
            productName: item.product.productName,
            quantity: item.quantity,
            pricePerUnit: item.product.pricePerUnit
          })
        });
      }

      // Clear cart
      setCart([]);
      localStorage.removeItem('maviram_cart');

      alert('Order placed successfully! Order #' + order.orderNumber);
      fetchMyOrders();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const filteredProducts = products.filter((product: any) =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Marketplace</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.fullName}</p>
            </div>
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {cart.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-blue-600">
                        {cart.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Shopping Cart</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Cart is empty</p>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <div key={item.product.id} className="border-b pb-4">
                            <p className="font-semibold">{item.product.productName}</p>
                            <p className="text-sm text-gray-600">₦{item.product.pricePerUnit}/unit</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                Remove
                              </Button>
                            </div>
                            <p className="text-sm font-semibold mt-2">
                              Subtotal: ₦{(item.product.pricePerUnit * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                        <div className="pt-4 border-t">
                          <p className="text-xl font-bold mb-4">
                            Total: ₦{getTotalAmount().toLocaleString()}
                          </p>
                          <Button onClick={handleCheckout} className="w-full">
                            Proceed to Checkout
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* My Orders Section */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">My Orders</h2>
          {myOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order: any) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">Amount: ₦{order.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Products Grid */}
        <h2 className="text-xl font-bold mb-4">Available Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            filteredProducts.map((product: any) => (
              <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <div className="h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.productName}</h3>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                  <Badge>#{product.listNumber}</Badge>
                </div>
                <p className="text-xl font-bold text-green-600 mb-4">
                  ₦{product.pricePerUnit.toLocaleString()}/unit
                </p>
                <Button onClick={() => addToCart(product)} className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}