"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, GraduationCap, Eye, EyeOff, Mail, Lock, User, Hash, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminRegistered, setAdminRegistered] = useState(false);
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    registerNumber: "",
    role: "teacher"
  });
  const { toast } = useToast();
  const router = useRouter();
  const { signup } = useAuth();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSignup();
    }
  };

  const handleSignup = async () => {
    if (!signupData.name || !signupData.email || !signupData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (signupData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    if (signupData.role === "teacher" && !signupData.registerNumber) {
      toast({
        title: "Error",
        description: "Teacher registration number is required",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const cleanEmail = signupData.email.trim().toLowerCase();
      const cleanRegisterNumber = signupData.registerNumber.trim();
      const payload = {
        name: signupData.name,
        email: cleanEmail,
        password: signupData.password,
        registerNumber: signupData.role === "teacher" ? cleanRegisterNumber : undefined,
        role: signupData.role,
      };
      console.log("Signup payload:", payload);
      await signup(payload);
      toast({
        title: "Success",
        description: "Account created successfully. Please login.",
      });
      setLoading(false);
      router.push("/login");
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
          <CardTitle className="text-2xl text-slate-800">Create Account</CardTitle>
          <CardDescription className="text-slate-600">
            Join Islamic Da'wa Academy portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-role" className="text-slate-700">Role</Label>
            <Select 
              value={signupData.role} 
              onValueChange={(value) => setSignupData({...signupData, role: value})}
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
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
          <div className="space-y-2">
            <Label htmlFor="signup-name" className="text-slate-700">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="signup-name"
                placeholder="Enter your full name"
                value={signupData.name}
                onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                onKeyDown={handleKeyDown}
                className="pl-10 border-slate-200"
              />
            </div>
          </div>
          {signupData.role === "teacher" && (
            <div className="space-y-2">
              <Label htmlFor="teacher-reg" className="text-slate-700">Teacher Registration Number</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="teacher-reg"
                  placeholder="Enter teacher registration number"
                  value={signupData.registerNumber}
                  onChange={(e) => setSignupData({...signupData, registerNumber: e.target.value})}
                  onKeyDown={handleKeyDown}
                  className="pl-10 border-slate-200"
                />
              </div>
              <p className="text-xs text-slate-500">
                This number must be added by admin first
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-slate-700">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={signupData.email}
                onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                onKeyDown={handleKeyDown}
                className="pl-10 border-slate-200"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-slate-700">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={signupData.password}
                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
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
            <p className="text-xs text-slate-500">
              Password must be at least 6 characters long
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-slate-700">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
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
          <Button 
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : "Create Account"}
          </Button>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to your account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
