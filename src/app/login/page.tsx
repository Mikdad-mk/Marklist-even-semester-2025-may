"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Mail, Lock, UserCog, GraduationCap, Loader2, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Link from 'next/link';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    role: "admin",
    registerNumber: ""
  });
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password || (loginData.role === "teacher" && !loginData.registerNumber)) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      // Clean the input before sending
      const cleanEmail = loginData.email.trim().toLowerCase();
      const cleanRegisterNumber = loginData.registerNumber.trim();
      const payload = {
        email: cleanEmail,
        password: loginData.password,
        registerNumber: loginData.role === "teacher" ? cleanRegisterNumber : undefined,
      };
      console.log("Login payload:", payload);
      await login(cleanEmail, loginData.password);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginData.email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      // Implement forgot password logic here
      toast({
        title: "Password Reset",
        description: "Password reset link has been sent to your email",
      });
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-slate-800">Welcome Back</CardTitle>
          <CardDescription className="text-slate-600">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {passwordResetSent ? (
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-blue-800">Password reset link sent!</p>
              <p className="text-sm text-blue-700 mt-2">
                Please check your email and follow the instructions to reset your password.
              </p>
              <Button 
                onClick={() => setPasswordResetSent(false)}
                variant="outline"
                className="mt-3"
              >
                Back to login
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-700">Role</Label>
                <Select value={loginData.role} onValueChange={(value) => setLoginData({...loginData, role: value})}>
                  <SelectTrigger className="border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2 ">
                        <UserCog className="w-4 h-4" />
                        Main Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="teacher">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Teacher
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {loginData.role === "teacher" && (
                <div className="space-y-2">
                  <Label htmlFor="registerNumber" className="text-slate-700">Teacher Register Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="registerNumber"
                      placeholder="Enter your register number"
                      value={loginData.registerNumber}
                      onChange={(e) => setLoginData({...loginData, registerNumber: e.target.value})}
                      onKeyDown={handleKeyDown}
                      className="pl-10 border-slate-200"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    onKeyDown={handleKeyDown}
                    className="pl-10 border-slate-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-10 border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
             
                <div className="text-sm">
                  <Link
                    href="/signup"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Don't have an account? Sign up
                  </Link>
                </div>
              </div>
              <Button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : "Sign In"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
