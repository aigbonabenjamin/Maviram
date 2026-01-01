"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LogOut, Plus, Edit, Trash2, Package } from 'lucide-react';

export default function SellerProducts() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    pricePerUnit: ''
  });

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return;
    
    if (!user || user.role !== 'seller') {
      router.push('/');
      return;
    }

    fetchProducts();
  }, [user, router, authLoading]);

  const fetchProducts = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/products?sellerId=${user.id}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingProduct ? `/api/products?id=${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: user?.id,
          productName: formData.productName,
          quantity: parseInt(formData.quantity),
          pricePerUnit: parseFloat(formData.pricePerUnit)
        })
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setEditingProduct(null);
        setFormData({ productName: '', quantity: '', pricePerUnit: '' });
        fetchProducts();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      quantity: product.quantity.toString(),
      pricePerUnit: product.pricePerUnit.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500',
      ordered: 'bg-yellow-500',
      out_for_delivery: 'bg-orange-500',
      delivered: 'bg-blue-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  // Show loading while auth is loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
              <h1 className="text-2xl font-bold text-green-600">My Products</h1>
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
        {/* Add Product Button */}
        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProduct(null);
              setFormData({ productName: '', quantity: '', pricePerUnit: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerUnit">Price per Unit (₦)</Label>
                  <Input
                    id="pricePerUnit"
                    type="number"
                    step="0.01"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <Card className="col-span-full p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products listed yet</p>
              <p className="text-sm text-gray-400">Click "Add New Product" to get started</p>
            </Card>
          ) : (
            products.map((product: any) => (
              <Card key={product.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={`${getStatusColor(product.status)} text-white`}>
                    {product.status}
                  </Badge>
                  <Badge variant="outline">#{product.listNumber}</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">{product.productName}</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                  <p className="text-lg font-semibold text-green-600">
                    ₦{product.pricePerUnit.toLocaleString()}/unit
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(product)} className="flex-1" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(product.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}