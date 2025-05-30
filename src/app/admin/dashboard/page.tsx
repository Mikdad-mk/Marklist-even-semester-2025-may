'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Calendar,
  BarChart3,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/');
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin dashboard",
        variant: "destructive"
      });
      return;
    }

    if (!user.isApproved) {
      router.push('/pending');
      return;
    }

    setLoading(false);
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-200"></div>
          <div className="h-4 w-24 rounded bg-indigo-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-600">Here's what's happening in your school</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-indigo-100">Total Students</p>
                <h3 className="text-2xl font-bold mt-2">1,234</h3>
                  </div>
                  <div className="p-3 bg-white/10 rounded-full">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-emerald-100">Classes Today</p>
                <h3 className="text-2xl font-bold mt-2">24</h3>
                  </div>
                  <div className="p-3 bg-white/10 rounded-full">
                <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-orange-100">Total Marks</p>
                <h3 className="text-2xl font-bold mt-2">5,678</h3>
                  </div>
                  <div className="p-3 bg-white/10 rounded-full">
                <BarChart3 className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
          <div className="space-y-4">
            {/* Add recent activity items here */}
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          </div>
            </CardContent>
          </Card>
    </div>
  );
} 