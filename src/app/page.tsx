// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, UserCog, Search, Loader2, LogOut, BookOpen, School, Users } from "lucide-react";
import { Style } from "@/components/ui/style";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";

interface Subject {
  name: string;
  ce: number;
  te: number;
}

interface MarkEntry {
  name: string;
  class: string;
  admission_number: string;
  subjects: Subject[];
}

export default function HomePage() {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [markEntry, setMarkEntry] = useState<MarkEntry | null>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSearch = async () => {
    if (!admissionNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your admission number",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/result/${admissionNumber}`);
      if (!response.ok) {
        throw new Error('Result not found');
      }
      const data = await response.json();
      setMarkEntry(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch results. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullResult = () => {
    router.push(`/results/${admissionNumber}`);
  };

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-indigo-50 to-emerald-50 relative">
      <Style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes floatReverse {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); }
          50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
          100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-reverse { animation: floatReverse 4s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 15s linear infinite; }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-fade-in-delay-1 { animation: fadeIn 0.6s ease-out 0.1s forwards; opacity: 0; }
        .animate-fade-in-delay-2 { animation: fadeIn 0.6s ease-out 0.2s forwards; opacity: 0; }
        .animate-fade-in-delay-3 { animation: fadeIn 0.6s ease-out 0.3s forwards; opacity: 0; }
      `}</Style>

      <div className="h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-indigo-50 to-emerald-50 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top Left Elements */}
          <div className="absolute top-10 left-10 opacity-20">
            <div className="w-20 h-20 rounded-lg bg-emerald-500 animate-float-reverse blur-sm" />
          </div>
          <div className="absolute top-32 left-24 opacity-20">
            <div className="w-16 h-16 rounded-full bg-indigo-500 animate-float blur-sm" />
          </div>
          
          {/* Top Right Elements */}
          <div className="absolute top-20 right-20 opacity-20">
            <div className="w-24 h-24 rounded-lg bg-blue-500 rotate-45 animate-float blur-sm" />
          </div>
          
          {/* Center Elements */}
          <div className="absolute top-1/3 left-1/4 opacity-10">
            <GraduationCap className="w-32 h-32 text-indigo-600 animate-float-reverse" />
          </div>
          <div className="absolute top-1/2 right-1/4 opacity-10">
            <BookOpen className="w-40 h-40 text-emerald-600 animate-float" />
          </div>
          
          {/* Bottom Elements */}
          <div className="absolute bottom-20 left-1/3 opacity-20">
            <div className="w-16 h-16 rounded-full bg-sky-500 animate-float blur-sm" />
          </div>
          <div className="absolute bottom-32 right-1/3 opacity-20">
            <div className="w-20 h-20 rounded-lg bg-purple-500 rotate-12 animate-float-reverse blur-sm" />
          </div>

          {/* Circular Elements */}
          <div className="absolute top-1/4 right-1/3 opacity-10">
            <div className="w-40 h-40 rounded-full border-4 border-dashed border-indigo-300 animate-spin-slow" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 opacity-10">
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-emerald-300 animate-spin-slow" />
          </div>
        </div>

        {/* Main Content */}
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 py-4 relative z-10">
          {/* Hero Section */}
          <header className="text-center mb-4 animate-fade-in">
            <div className="inline-block p-2 bg-white/30 backdrop-blur-lg rounded-full mb-3 animate-float">
              <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full p-3">
                <School className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Islamic Da'wa Academy
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-4">
              Even Semester Examination Results 2025
            </p>
            
            {/* Stats Section */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4 px-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 sm:px-8 py-3 shadow-lg animate-fade-in-delay-1 w-full sm:w-64">
                <Users className="w-6 h-6 text-emerald-500 mb-1 mx-auto" />
                <h3 className="text-xl font-bold text-slate-800">2,500+</h3>
                <p className="text-sm text-slate-600">Students</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 sm:px-8 py-3 shadow-lg animate-fade-in-delay-2 w-full sm:w-64">
                <BookOpen className="w-6 h-6 text-indigo-500 mb-1 mx-auto" />
                <h3 className="text-xl font-bold text-slate-800">15+</h3>
                <p className="text-sm text-slate-600">Programs</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 sm:px-8 py-3 shadow-lg animate-fade-in-delay-3 w-full sm:w-64">
                <GraduationCap className="w-6 h-6 text-blue-500 mb-1 mx-auto" />
                <h3 className="text-xl font-bold text-slate-800">98%</h3>
                <p className="text-sm text-slate-600">Success Rate</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 h-[calc(100vh-280px)] overflow-y-auto lg:overflow-y-hidden">
            {/* Main Result Card */}
            <Card className="col-span-1 lg:col-span-3 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in-delay-1 animate-glow overflow-hidden h-full">
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-lg sm:text-xl text-slate-800 flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-500" />
                  Student Result Portal
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Enter your admission number to check results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 h-[calc(100%-4rem)] overflow-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="Enter your admission number"
                      className="pl-10 border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 transition-all duration-300 w-full"
                      value={admissionNumber}
                      onChange={(e) => setAdmissionNumber(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Search Results'
                    )}
                  </Button>
                </div>

                {markEntry && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-gradient-to-r from-slate-50 to-indigo-50 p-4 rounded-lg">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Student Name</p>
                        <p className="font-semibold text-slate-900 text-base">{markEntry.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Class</p>
                        <p className="font-semibold text-slate-900 text-base">{markEntry.class}</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-100 max-h-[calc(100vh-520px)]">
                      <div className="min-w-[600px]">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-slate-50 to-indigo-50">
                              <TableHead className="font-semibold text-sm py-1.5">Subject</TableHead>
                              <TableHead className="text-center font-semibold text-sm py-1.5">CE (30)</TableHead>
                              <TableHead className="text-center font-semibold text-sm py-1.5">TE (70)</TableHead>
                              <TableHead className="text-center font-semibold text-sm py-1.5">Total</TableHead>
                              <TableHead className="text-center font-semibold text-sm py-1.5">Result</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {markEntry.subjects.map((subject, index) => {
                              const total = subject.ce + subject.te;
                              const result = subject.ce >= 15 && subject.te >= 28 ? 'Pass' : 'Fail';
                              return (
                                <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                                  <TableCell className="font-medium text-sm py-1.5">{subject.name}</TableCell>
                                  <TableCell className="text-center text-sm py-1.5">
                                    <span className={subject.ce >= 15 ? 'text-emerald-600' : 'text-red-600'}>
                                      {subject.ce}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center text-sm py-1.5">
                                    <span className={subject.te >= 28 ? 'text-emerald-600' : 'text-red-600'}>
                                      {subject.te}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center font-semibold text-sm py-1.5">{total}</TableCell>
                                  <TableCell className="text-center py-1.5">
                                    <span className={`px-2 py-0.5 rounded-full text-sm font-semibold ${
                                      result === 'Pass' 
                                        ? 'bg-emerald-100 text-emerald-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {result}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleViewFullResult}
                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        View Detailed Result
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar Cards */}
            <div className="space-y-4 h-full">
              {!user ? (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-auto lg:h-[calc(50%-0.5rem)]">
                  <CardHeader className="py-4 border-b border-slate-100">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-indigo-500" />
                      Administration
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      Access portal for staff
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
                    <Button
                      onClick={() => router.push("/login")}
                      className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Login to Portal
                    </Button>
                    <Button
                      onClick={() => router.push("/signup")}
                      variant="outline"
                      className="w-full border-slate-200 hover:bg-slate-50 transition-all duration-300"
                    >
                      Create Account
                    </Button>
                  </CardContent>
                </Card>
              ) : user.isApproved ? (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-auto lg:h-[calc(50%-0.5rem)]">
                  <CardHeader className="py-4 border-b border-slate-100">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-indigo-500" />
                      Quick Access
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      Welcome, {user.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
                    {user.role === 'admin' && (
                      <Button
                        onClick={() => router.push("/admin/dashboard")}
                        className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Button>
                    )}
                    {user.role === 'teacher' && (
                      <Button
                        onClick={() => router.push("/teacher/dashboard")}
                        className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Teacher Dashboard
                      </Button>
                    )}
                    <Button
                      onClick={async () => {
                        await logout();
                        router.push('/');
                      }}
                      variant="outline"
                      className="w-full border-slate-200 hover:bg-slate-50 transition-all duration-300"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-auto lg:h-[calc(50%-0.5rem)]">
                  <CardHeader className="py-4 border-b border-slate-100">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-amber-500" />
                      Account Status
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      Awaiting approval
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
                    <Button
                      onClick={() => router.push("/pending")}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Check Status
                    </Button>
                    <Button
                      onClick={async () => {
                        await logout();
                        router.push('/');
                      }}
                      variant="outline"
                      className="w-full border-slate-200 hover:bg-slate-50 transition-all duration-300"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-auto lg:h-[calc(50%-0.5rem)]">
                <CardHeader className="py-4 border-b border-slate-100">
                  <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                    <School className="w-5 h-5 text-indigo-500" />
                    About Us
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Excellence in Education
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Islamic Da'wa Academy combines academic excellence with strong Islamic values, 
                    ensuring transparent and accurate result reporting for all students.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
