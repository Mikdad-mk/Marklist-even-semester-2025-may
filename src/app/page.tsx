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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, UserCog, Search, Loader2, LogOut } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <Style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fade-in-delay-1 {
          animation: fadeIn 0.6s ease-out 0.1s forwards;
          opacity: 0;
        }
        .animate-fade-in-delay-2 {
          animation: fadeIn 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }
        .animate-fade-in-delay-3 {
          animation: fadeIn 0.6s ease-out 0.3s forwards;
          opacity: 0;
        }
      `}</Style>

      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Islamic Da'wa Academy
          </h1>
          <p className="text-xl md:text-2xl text-slate-600">
            Even Semester Examination Results 2025 May
          </p>
        </header>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-delay-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-slate-800">Student Result Portal</CardTitle>
              <CardDescription className="text-slate-600">
                Check your examination results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Enter your admission number"
                  className="pl-10 border-slate-300"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                />
              </div>
                <Button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>

              {markEntry && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-slate-500">Name</p>
                      <p className="font-medium text-slate-900">{markEntry.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Class</p>
                      <p className="font-medium text-slate-900">{markEntry.class}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Subject</TableHead>
                          <TableHead className="text-center">CE (30)</TableHead>
                          <TableHead className="text-center">TE (70)</TableHead>
                          <TableHead className="text-center">Total (100)</TableHead>
                          <TableHead className="text-center">Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {markEntry.subjects.map((subject, index) => {
                          const total = subject.ce + subject.te;
                          const result = subject.ce >= 15 && subject.te >= 28 ? 'Pass' : 'Fail';
                          return (
                            <TableRow key={index}>
                              <TableCell>{subject.name}</TableCell>
                              <TableCell className="text-center">{subject.ce}</TableCell>
                              <TableCell className="text-center">{subject.te}</TableCell>
                              <TableCell className="text-center">{total}</TableCell>
                              <TableCell className="text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  result === 'Pass' 
                                    ? 'bg-green-100 text-green-800' 
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

                  <div className="flex justify-end">
                    <Button
                      onClick={handleViewFullResult}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      View Full Result
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6 animate-fade-in-delay-2">
            {!user ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-slate-800">Administration</CardTitle>
                  <CardDescription className="text-slate-600">
                    For authorized personnel only
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => router.push("/signup")}
                    variant="outline"
                    className="w-full border-slate-200"
                  >
                    Sign Up
                  </Button>
                </CardContent>
              </Card>
            ) : user.isApproved ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-slate-800">Quick Links</CardTitle>
                  <CardDescription className="text-slate-600">
                    Access your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.role === 'admin' && (
                    <Button
                      onClick={() => router.push("/admin/dashboard")}
                      className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700"
                    >
                      <UserCog className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  )}
                  {user.role === 'teacher' && (
                    <Button
                      onClick={() => router.push("/teacher/dashboard")}
                      className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700"
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
                    className="w-full border-slate-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-slate-800">Account Pending</CardTitle>
                  <CardDescription className="text-slate-600">
                    Your account is pending approval
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => router.push("/pending")}
                    className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
                  >
                    Check Status
                  </Button>
                  <Button
                    onClick={async () => {
                      await logout();
                      router.push('/');
                    }}
                    variant="outline"
                    className="w-full border-slate-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-delay-3">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-slate-800">About</CardTitle>
                <CardDescription className="text-slate-600">
                  Islamic Da'wa Academy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">
                  A premier institution providing quality education with Islamic values.
                  Our examination system ensures transparency and accuracy in result reporting.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
