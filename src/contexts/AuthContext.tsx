"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { toast } from "@/components/ui/use-toast";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'pending';
  isApproved: boolean;
  registerNumber?: string;
  status: 'active' | 'inactive';
  canEnterMarks: boolean;
  lastMarkEntryAccess?: {
    grantedAt: string;
    grantedBy: string;
    reason: string;
  };
};

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    registerNumber?: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Handle redirects based on user status and role
        if (userData.isApproved) {
          // If on main page or auth pages, don't redirect
          if (pathname && pathname !== '/' && (pathname === '/login' || pathname === '/signup' || pathname === '/pending')) {
            if (userData.role === 'admin') {
              router.push('/admin/dashboard');
            } else if (userData.role === 'teacher') {
              router.push('/teacher/dashboard');
            }
          }
        } else if (pathname && pathname !== '/pending') {
          router.push('/pending');
        }
      } else {
        setUser(null);
        // Only redirect to login if trying to access protected routes
        if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/teacher'))) {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      // Only redirect to login if trying to access protected routes
      if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/teacher'))) {
        router.push('/login');
      }
    }
  };

  // Add a function to refresh user data
  const refreshUserData = async () => {
    await checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // Set up periodic refresh of user data
  useEffect(() => {
    if (user) {
      const interval = setInterval(refreshUserData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const userData = await response.json();
      setUser(userData.user);
      
      if (!userData.user.isApproved) {
        router.push('/pending');
      } else if (userData.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (userData.user.role === 'teacher') {
        router.push('/teacher/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
    registerNumber?: string;
  }) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Signup failed');
      }

      const { user: newUser } = await response.json();
      setUser(newUser);
      router.push('/pending');
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
