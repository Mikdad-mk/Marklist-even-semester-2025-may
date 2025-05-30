'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LogOut,
  Users,
  Calendar,
  Settings,
  Home,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/');
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin panel",
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
  };

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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <span className="text-xl font-bold text-indigo-600">Admin Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            href="/admin/dashboard" 
            className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
              pathname === '/admin/dashboard'
                ? 'text-gray-700 bg-indigo-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Home className={`w-5 h-5 mr-4 ${
              pathname === '/admin/dashboard' ? 'text-indigo-600' : ''
            }`} />
            <span className={pathname === '/admin/dashboard' ? 'font-medium text-indigo-600' : ''}>
              Dashboard
            </span>
          </Link>
          <Link 
            href="/admin/teachers" 
            className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
              pathname === '/admin/teachers'
                ? 'text-gray-700 bg-indigo-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className={`w-5 h-5 mr-4 ${
              pathname === '/admin/teachers' ? 'text-indigo-600' : ''
            }`} />
            <span className={pathname === '/admin/teachers' ? 'font-medium text-indigo-600' : ''}>
              Teachers
            </span>
          </Link>
          <Link 
            href="/admin/schedule" 
            className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
              pathname === '/admin/schedule'
                ? 'text-gray-700 bg-indigo-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className={`w-5 h-5 mr-4 ${
              pathname === '/admin/schedule' ? 'text-indigo-600' : ''
            }`} />
            <span className={pathname === '/admin/schedule' ? 'font-medium text-indigo-600' : ''}>
              Schedule
            </span>
          </Link>
          <Link 
            href="/admin/settings" 
            className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
              pathname === '/admin/settings'
                ? 'text-gray-700 bg-indigo-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className={`w-5 h-5 mr-4 ${
              pathname === '/admin/settings' ? 'text-indigo-600' : ''
            }`} />
            <span className={pathname === '/admin/settings' ? 'font-medium text-indigo-600' : ''}>
              Settings
            </span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center w-full gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
} 