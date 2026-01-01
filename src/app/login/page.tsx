"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const { logActivity } = useActivityLogger();
  const role = searchParams.get('role');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Redirect based on role
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
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(phoneNumber, pin);

    if (result.success) {
      // Log successful login
      await logActivity({
        activityType: 'login',
        description: `User logged in successfully as ${result.user?.role}`,
        entityType: 'account',
        entityId: result.user?.id,
        metadata: {
          role: result.user?.role,
          phoneNumber: phoneNumber,
          loginMethod: 'phone_pin',
        },
      });
    } else {
      // Log failed login attempt
      await logActivity({
        activityType: 'error',
        description: `Failed login attempt for phone: ${phoneNumber}`,
        entityType: 'account',
        metadata: {
          error: result.error,
          phoneNumber: phoneNumber,
          attemptedRole: role,
        },
      });
      setError(result.error || 'Login failed');
      setIsLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'buyer': return 'Buyer';
      case 'seller': return 'Seller';
      case 'driver': return 'Driver';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getRoleTitle()} Login
          </h1>
          <p className="text-gray-600">Enter your phone number and PIN to continue</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="08012345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="pin">4-Digit PIN</Label>
            <Input
              id="pin"
              type="password"
              placeholder="****"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => router.push(`/register?role=${role}`)}
              className="text-blue-600 hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}