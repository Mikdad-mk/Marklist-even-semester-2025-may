'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Users, 
  Calendar,
  TrendingUp,
  Trophy,
  ChartBar,
  Loader2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

// Dynamically import ApexCharts with no SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  successRate: number;
  topPerformers: Array<{
    _id: string;
    name: string;
    admissionNumber: string;
    class: string;
    averageScore: number;
  }>;
  classPerformance: Array<{
    class: string;
    averageScore: number;
    passPercentage: number;
    studentCount: number;
    totalMarks: number;
  }>;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
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

    fetchDashboardStats();
  }, [user, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
                <h3 className="text-2xl font-bold mt-2">{stats?.totalStudents || 0}</h3>
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
                <p className="text-sm font-medium text-emerald-100">Total Classes</p>
                <h3 className="text-2xl font-bold mt-2">{stats?.totalClasses || 0}</h3>
              </div>
              <div className="p-3 bg-white/10 rounded-full">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Success Rate</p>
                <h3 className="text-2xl font-bold mt-2">{stats?.successRate || 0}%</h3>
              </div>
              <div className="p-3 bg-white/10 rounded-full">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance Chart */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-indigo-500" />
            <CardTitle>Class Performance Overview</CardTitle>
          </div>
          <CardDescription>Average scores and pass rates by class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {stats?.classPerformance && (
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
                      show: true,
                      tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                      }
                    },
                    animations: {
                      enabled: true,
                      speed: 800,
                      animateGradually: {
                        enabled: true,
                        delay: 150
                      },
                      dynamicAnimation: {
                        enabled: true,
                        speed: 350
                      }
                    }
                  },
                  colors: ['#6366f1', '#22c55e'],
                  plotOptions: {
                    bar: {
                      borderRadius: 8,
                      columnWidth: '50%',
                      dataLabels: {
                        position: 'top'
                      }
                    }
                  },
                  dataLabels: {
                    enabled: true,
                    formatter: function (val: number) {
                      return val.toFixed(1)
                    },
                    offsetY: -20,
                    style: {
                      fontSize: '12px',
                      colors: ["#304758"]
                    }
                  },
                  stroke: {
                    width: [0, 4],
                    curve: 'smooth'
                  },
                  grid: {
                    borderColor: '#f1f1f1',
                    padding: {
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0
                    }
                  },
                  markers: {
                    size: 6,
                    colors: ['#22c55e'],
                    strokeColors: '#fff',
                    strokeWidth: 2,
                    hover: {
                      size: 8
                    }
                  },
                  xaxis: {
                    categories: stats.classPerformance.map(item => item.class),
                    title: {
                      text: 'Classes',
                      style: {
                        fontSize: '12px',
                        fontWeight: 600
                      }
                    }
                  },
                  yaxis: [
                    {
                      title: {
                        text: "Average Score",
                        style: {
                          fontSize: '12px',
                          fontWeight: 600
                        }
                      },
                      min: 0,
                      max: 100
                    },
                    {
                      opposite: true,
                      title: {
                        text: "Pass Rate (%)",
                        style: {
                          fontSize: '12px',
                          fontWeight: 600
                        }
                      },
                      min: 0,
                      max: 100
                    }
                  ],
                  tooltip: {
                    shared: true,
                    intersect: false,
                    theme: 'light',
                    y: [{
                      formatter: function(y: number) {
                        return y.toFixed(1) + "%";
                      }
                    }, {
                      formatter: function(y: number) {
                        return y.toFixed(1) + "%";
                      }
                    }]
                  },
                  legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    floating: true,
                    offsetY: -25,
                    offsetX: -5
                  }
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <CardTitle>Top Performing Students</CardTitle>
          </div>
          <CardDescription>Students with highest average scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.topPerformers.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-slate-50 text-slate-600'
                        } text-sm font-semibold`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.admissionNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">{student.averageScore}%</td>
                  </tr>
                ))}
                {(!stats?.topPerformers || stats.topPerformers.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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