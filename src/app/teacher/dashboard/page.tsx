'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  TrendingUp,
  Trophy,
  ChartBar,
  Loader2,
  BookOpen,
  AlertCircle,
  Clock
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Dynamically import ApexCharts with no SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DashboardStats {
  totalMarks: number;
  successRate: number;
  canEnterMarks: boolean;
  recentMarks: Array<{
    studentName: string;
    studentClass: string;
    subject: string;
    ce: number;
    te: number;
    total: number;
    result: string;
    createdAt: string;
  }>;
  topPerformers: Array<{
    subject: string;
    students: Array<{
      _id: string;
      name: string;
      admissionNumber: string;
      class: string;
      averageScore: number;
    }>;
  }>;
  classPerformance: Array<{
    class: string;
    subject: string;
    averageScore: number;
    passPercentage: number;
    studentCount: number;
    totalMarks: number;
  }>;
}

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'teacher') {
      router.push('/');
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page",
        variant: "destructive"
      });
      return;
    }

    if (!user.isApproved) {
      router.push('/pending');
      return;
    }

    // Don't redirect if inactive, just show the error state
    if (user.status === 'inactive') {
      setError("Your account has been disabled. Please contact an administrator.");
      setLoading(false);
      return;
    }

    fetchDashboardStats();
  }, [user, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/teacher/dashboard');
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          // Set error state instead of redirecting
          setError(data.error || "Your account has been disabled. Please contact an administrator.");
          return;
        }
        throw new Error(data.error || 'Failed to fetch dashboard stats');
      }
      
      setError(null);
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error instanceof Error ? error.message : "Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-200"></div>
          <div className="h-4 w-24 rounded bg-indigo-200"></div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'teacher' || !user.isApproved) {
    return null;
  }

  // Show error state with logout option if account is disabled
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Account Restricted</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => {
            logout();
            router.push('/login');
          }}
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>

      {/* Show mark entry status */}
      {stats && !stats.canEnterMarks && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Mark Entry Disabled</AlertTitle>
          <AlertDescription>
            Your mark entry permission has been disabled by an administrator. You can still view your previously entered marks.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your marks and student performance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-100">Total Marks Entered</p>
                <h3 className="text-2xl font-bold mt-2">{stats?.totalMarks || 0}</h3>
              </div>
              <div className="p-3 bg-white/10 rounded-full">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-100">Success Rate</p>
                <h3 className="text-2xl font-bold mt-2">{stats?.successRate || 0}%</h3>
              </div>
              <div className="p-3 bg-white/10 rounded-full">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Marks */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <CardTitle>Recent Marks Entered</CardTitle>
          </div>
          <CardDescription>Your latest mark entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>CE</TableHead>
                  <TableHead>TE</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentMarks.map((mark, index) => (
                  <TableRow key={index}>
                    <TableCell>{mark.studentName}</TableCell>
                    <TableCell>{mark.studentClass}</TableCell>
                    <TableCell>{mark.subject}</TableCell>
                    <TableCell>{mark.ce}</TableCell>
                    <TableCell>{mark.te}</TableCell>
                    <TableCell>{mark.total}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        mark.result === 'Pass' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {mark.result}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Class Performance Chart */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-indigo-500" />
            <CardTitle>Class Performance Overview</CardTitle>
          </div>
          <CardDescription>Average scores and pass rates by class and subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {stats?.classPerformance && stats.classPerformance.length > 0 && (
              <Chart
                type="area"
                height={400}
                series={[
                  {
                    name: 'Average Score',
                    type: 'column',
                    data: stats.classPerformance.map(item => item.averageScore)
                  },
                  {
                    name: 'Pass Rate',
                    type: 'line',
                    data: stats.classPerformance.map(item => item.passPercentage)
                  }
                ]}
                options={{
                  chart: {
                    stacked: false,
                    toolbar: {
                      show: false
                    }
                  },
                  xaxis: {
                    categories: stats.classPerformance.map(item => `${item.class} - ${item.subject}`),
                    labels: {
                      rotate: -45,
                      style: {
                        fontSize: '12px'
                      }
                    }
                  },
                  yaxis: [
                    {
                      title: {
                        text: 'Average Score'
                      },
                      min: 0,
                      max: 100
                    },
                    {
                      opposite: true,
                      title: {
                        text: 'Pass Rate (%)'
                      },
                      min: 0,
                      max: 100
                    }
                  ],
                  colors: ['#6366f1', '#10b981'],
                  stroke: {
                    width: [0, 3]
                  },
                  plotOptions: {
                    bar: {
                      borderRadius: 3
                    }
                  },
                  markers: {
                    size: 4
                  }
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-500" />
            <CardTitle>Top Performers</CardTitle>
          </div>
          <CardDescription>Best performing students by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats?.topPerformers.map((subject) => (
              <Card key={subject.subject}>
                <CardHeader>
                  <CardTitle className="text-lg">{subject.subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subject.students.map((student, index) => (
                      <div key={student._id} className="flex items-center gap-4">
                        <div className="flex-none w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.class} - {student.admissionNumber}
                          </p>
                        </div>
                        <div className="flex-none">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {student.averageScore}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 