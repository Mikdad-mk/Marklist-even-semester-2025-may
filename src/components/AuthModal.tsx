"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, GraduationCap, Eye, EyeOff, Mail, Lock, User, Hash, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  trigger: React.ReactNode;
}

const AuthModal = ({ trigger }: AuthModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("login");
  const [adminRegistered, setAdminRegistered] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    role: "admin"
  });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    teacherRegNumber: "",
    role: "teacher"
  });
  const { toast } = useToast();
  const { login, signup, user } = useAuth();
  const router = useRouter();

  // Effect to check authentication and redirect if needed
  useEffect(() => {
    if (user) {
      // Close the modal if user is authenticated
      setOpen(false);
      
      // Navigate based on user role
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'teacher') {
        router.push('/teacher/dashboard');
      }
    }
  }, [user, router]);

  // Reset login/signup forms when modal closes
  useEffect(() => {
    if (!open) {
      setLoginData({
        email: "",
        password: "",
        role: "admin"
      });
      setSignupData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        teacherRegNumber: "",
        role: "teacher"
      });
      setPasswordResetSent(false);
    }
  }, [open]);

  // Handle form submission on Enter key press
  const handleKeyDown = (e: React.KeyboardEvent, formType: 'login' | 'signup') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (formType === 'login') {
        handleLogin();
      } else {
        handleSignup();
      }
    }
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await login(loginData.email, loginData.password);
      // Navigation will happen in useEffect when user is available
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
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

    setLoading(true);

    try {
      await signup({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        registerNumber: signupData.teacherRegNumber,
      });
      
      // Reset the signup form
      setSignupData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        teacherRegNumber: "",
        role: "teacher"
      });
      
      // Switch to login tab
      setActiveTab("login");
      
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during registration",
        variant: "destructive",
      });
    } finally {
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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginData.email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send reset email');
      }
      
      setPasswordResetSent(true);
      toast({
        title: "Password Reset",
        description: "Password reset link has been sent to your email",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 bg-white border-0 shadow-2xl">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <DialogDescription className="sr-only">Log in or create an account</DialogDescription>
        <Tabs 
          defaultValue="login" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 m-4 mb-0">
            <TabsTrigger value="login" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="p-4 pt-2">
            <Card className="border-0 shadow-none">
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
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-slate-700">Role</Label>
                      <Select value={loginData.role} onValueChange={(value) => setLoginData({...loginData, role: value})}>
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
                      <Label htmlFor="email" className="text-slate-700">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          onKeyDown={(e) => handleKeyDown(e, 'login')}
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
                          onKeyDown={(e) => handleKeyDown(e, 'login')}
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

                    <Button 
                      variant="ghost" 
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      Forgot Password?
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="p-4 pt-2">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl text-slate-800">Create Account</CardTitle>
                <CardDescription className="text-slate-600">
                  Sign up for a new account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-700">Role</Label>
                  <Select 
                    value={signupData.role} 
                    onValueChange={(value) => setSignupData({...signupData, role: value})}
                    disabled={adminRegistered}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                      onKeyDown={(e) => handleKeyDown(e, 'signup')}
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
                        value={signupData.teacherRegNumber}
                        onChange={(e) => setSignupData({...signupData, teacherRegNumber: e.target.value})}
                        onKeyDown={(e) => handleKeyDown(e, 'signup')}
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
                      onKeyDown={(e) => handleKeyDown(e, 'signup')}
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
                      onKeyDown={(e) => handleKeyDown(e, 'signup')}
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
                      onKeyDown={(e) => handleKeyDown(e, 'signup')}
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
                  disabled={loading || adminRegistered}
                  className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : "Create Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
