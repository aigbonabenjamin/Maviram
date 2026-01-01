"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'buyer';

  const [formData, setFormData] = useState({
    fullName: '',
    middleName: '',
    phoneNumber: '',
    pin: '',
    confirmPin: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    location: '',
    bankAccountNumber: '',
    bankAccountName: '',
    bankName: '',
    lineMark: '',
    education: '',
    nin: '',
    bvm: '',
    maritalStatus: '',
    hasVehicle: false,
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.pin !== formData.confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (formData.pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          ...formData,
          confirmPin: undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Success - redirect to login
      router.push(`/login?role=${role}&registered=true`);
    } catch (err) {
      setError('An error occurred during registration');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <Card className="max-w-2xl mx-auto p-8">
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
            {getRoleTitle()} Registration
          </h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="08012345678"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email {role !== 'seller' && '*'}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required={role !== 'seller'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pin">4-Digit PIN *</Label>
              <Input
                id="pin"
                name="pin"
                type="password"
                maxLength={4}
                placeholder="****"
                value={formData.pin}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPin">Confirm PIN *</Label>
              <Input
                id="confirmPin"
                name="confirmPin"
                type="password"
                maxLength={4}
                placeholder="****"
                value={formData.confirmPin}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="City, State"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          {role === 'buyer' && (
            <div>
              <Label htmlFor="lineMark">Landmark</Label>
              <Input
                id="lineMark"
                name="lineMark"
                placeholder="e.g., Near Eko Hotel"
                value={formData.lineMark}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Bank Details for Sellers, Drivers, and Admins */}
          {(role === 'seller' || role === 'driver' || role === 'admin') && (
            <>
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4">Bank Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                    <Input
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccountName">Account Name</Label>
                    <Input
                      id="bankAccountName"
                      name="bankAccountName"
                      value={formData.bankAccountName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          {/* Additional fields for Drivers and Admins */}
          {(role === 'driver' || role === 'admin') && (
            <div>
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Admin-specific fields */}
          {role === 'admin' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nin">NIN</Label>
                  <Input
                    id="nin"
                    name="nin"
                    value={formData.nin}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="bvm">BVM</Label>
                  <Input
                    id="bvm"
                    name="bvm"
                    value={formData.bvm}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="hasVehicle"
                    name="hasVehicle"
                    checked={formData.hasVehicle}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="hasVehicle">Has Vehicle (Car/Motorcycle)</Label>
                </div>
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push(`/login?role=${role}`)}
              className="text-blue-600 hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}