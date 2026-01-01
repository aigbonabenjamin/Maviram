"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSessionTracker } from '@/hooks/useSessionTracker';

interface User {
  id: number;
  role: 'seller' | 'buyer' | 'driver' | 'admin';
  phoneNumber: string;
  fullName: string;
  email?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (phoneNumber: string, pin: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track active session with heartbeat
  useSessionTracker(user?.id?.toString());

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('maviram_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (phoneNumber: string, pin: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      // Use the proper login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, pin })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('maviram_user', JSON.stringify(data.user));
        
        // Register active session via API
        try {
          await fetch('/api/sessions/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id.toString(),
              role: data.user.role,
              fullName: data.user.fullName,
              userAgent: navigator.userAgent
            })
          });
        } catch (error) {
          console.error('Failed to register session:', error);
        }
        
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Failed to connect to server. Please check your internet connection.' };
    }
  };

  const logout = () => {
    // Remove active session via API
    if (user) {
      fetch('/api/sessions/unregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id.toString() })
      }).catch(err => console.error('Failed to unregister session:', err));
    }
    
    setUser(null);
    localStorage.removeItem('maviram_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}