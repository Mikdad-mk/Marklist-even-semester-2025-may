"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: "admin" | "teacher";
};

const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Show a message when access is denied due to insufficient permissions
    if (!loading && user && requiredRole && user.role !== requiredRole) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: `You need ${requiredRole} permissions to access this page.`
      });
      router.push('/');
    }

    // If no user is logged in, redirect to the home page
    if (!loading && !user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to access this page"
      });
      router.push('/');
    }
  }, [loading, user, requiredRole, router]);
  
  // If auth is still loading, show a loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-slate-700">Loading...</h2>
          <p className="mt-2 text-slate-500">Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }
  
  // If no user is logged in or doesn't have required role, don't render children
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }
  
  // If all checks pass, render the protected content
  return <>{children}</>;
}

export default ProtectedRoute;
