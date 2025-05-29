'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';

export default function PendingPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // If user is approved, redirect to appropriate dashboard
    if (user.isApproved) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'teacher') {
        router.push('/teacher/dashboard');
      }
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-slate-800">Account Pending Approval</CardTitle>
          <CardDescription className="text-slate-600">
            Your account is currently pending approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Your account is currently under review. Once approved, you will be able to access the system.
              {user.role === 'teacher' && " Please ensure your teacher registration number is valid."}
            </p>
          </div>
          <div className="text-sm text-slate-500">
            <p>Account Details:</p>
            <ul className="mt-2 space-y-1">
              <li><strong>Name:</strong> {user.name}</li>
              <li><strong>Email:</strong> {user.email}</li>
              <li><strong>Role:</strong> {user.role}</li>
              {user.registerNumber && (
                <li><strong>Register Number:</strong> {user.registerNumber}</li>
              )}
            </ul>
          </div>
          <div className="pt-4 border-t">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 