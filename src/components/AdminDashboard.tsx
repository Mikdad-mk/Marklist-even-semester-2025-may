import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Download,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LogoutButton from "./LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Define the Teacher type to match our data structure
type Teacher = {
  id: string;
  name: string;
  regNumber: string;
  email: string;
  status: string;
  requestAccess: boolean;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([
    { id: 1, admissionNumber: "STU001", name: "Mohammad Ibrahim", class: "Plus Two", status: "active" },
    { id: 2, admissionNumber: "STU002", name: "Aisha Khatun", class: "D3", status: "active" },
  ]);
  const [newTeacher, setNewTeacher] = useState({ name: "", regNumber: "" });
  const [resultVisibility, setResultVisibility] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.replace("/");
      return;
    }
    fetchTeachers();
  }, [user, router]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers');
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.regNumber) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTeacher),
      });

      if (!response.ok) {
        throw new Error('Failed to add teacher');
      }

      const addedTeacher = await response.json();
      setTeachers([...teachers, addedTeacher]);
      setNewTeacher({ name: "", regNumber: "" });
      
      toast({
        title: "Success",
        description: "Teacher added successfully",
      });
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast({
        title: "Error",
        description: "Failed to add teacher",
        variant: "destructive"
      });
    }
  };

  const handleApproveTeacher = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to approve teacher');
      }

      // Update the local state
      setTeachers(teachers.map(teacher => 
        teacher.id === teacherId 
          ? { ...teacher, status: 'active', requestAccess: false }
          : teacher
      ));

      toast({
        title: "Success",
        description: "Teacher approved successfully",
      });
    } catch (error) {
      console.error('Error approving teacher:', error);
      toast({
        title: "Error",
        description: "Failed to approve teacher",
        variant: "destructive"
      });
    }
  };

  const handleRejectTeacher = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reject teacher');
      }

      // Update the local state
      setTeachers(teachers.map(teacher => 
        teacher.id === teacherId 
          ? { ...teacher, status: 'rejected', requestAccess: false }
          : teacher
      ));

      toast({
        title: "Success",
        description: "Teacher rejected successfully",
      });
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      toast({
        title: "Error",
        description: "Failed to reject teacher",
        variant: "destructive"
      });
    }
  };

  const toggleResultVisibility = async () => {
    try {
      const response = await fetch('/api/admin/settings/result-visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visible: !resultVisibility }),
      });

      if (!response.ok) {
        throw new Error('Failed to update result visibility');
      }

      setResultVisibility(!resultVisibility);
      toast({
        title: resultVisibility ? "Results Hidden" : "Results Visible",
        description: resultVisibility 
          ? "Students can no longer view their results" 
          : "Students can now view their results"
      });
    } catch (error) {
      console.error("Error toggling result visibility:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update result visibility"
      });
    }
  };

  const dashboardStats = [
    {
      title: "Total Students",
      value: "1,247",
      change: "+12%",
      icon: GraduationCap,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Active Teachers",
      value: "24",
      change: "+3",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Published Results",
      value: "6",
      change: "All Classes",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "System Health",
      value: "99.9%",
      change: "Uptime",
      icon: BarChart3,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ];

  // Classes for marks management
  const classes = [
    { value: "6th", label: "6th Standard" },
    { value: "8th", label: "8th Standard" },
    { value: "plus-one", label: "Plus One" },
    { value: "plus-two", label: "Plus Two" },
    { value: "d1", label: "D1" },
    { value: "d2", label: "D2" },
    { value: "d3", label: "D3" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user?.name || 'Academic Office'}</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={toggleResultVisibility}
              variant={resultVisibility ? "destructive" : "default"}
              className="shadow-lg"
            >
              {resultVisibility ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {resultVisibility ? "Hide Results" : "Show Results"}
            </Button>
            <LogoutButton />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-sm text-emerald-600 font-medium">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="teachers" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <TabsTrigger value="teachers" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Teacher Management
            </TabsTrigger>
            <TabsTrigger value="marks" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Marks Management
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teachers" className="space-y-6">
            {/* Add Teacher */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  Add New Teacher
                </CardTitle>
                <CardDescription>Add teacher details to the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher-name">Teacher Name</Label>
                    <Input
                      id="teacher-name"
                      placeholder="Enter teacher name"
                      value={newTeacher.name}
                      onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-reg">Registration Number</Label>
                    <Input
                      id="teacher-reg"
                      placeholder="Enter registration number"
                      value={newTeacher.regNumber}
                      onChange={(e) => setNewTeacher({...newTeacher, regNumber: e.target.value})}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddTeacher} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Add Teacher
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teachers List */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Teachers & Access Requests</CardTitle>
                <CardDescription>Manage teacher accounts and access permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Reg Number</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">{teacher.name}</TableCell>
                        <TableCell>{teacher.regNumber}</TableCell>
                        <TableCell>{teacher.email || "Not registered"}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={teacher.status === "active" ? "default" : teacher.status === "pending" ? "secondary" : "destructive"}
                            className={teacher.status === "active" ? "bg-emerald-100 text-emerald-800" : ""}
                          >
                            {teacher.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {teacher.requestAccess && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproveTeacher(teacher.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleRejectTeacher(teacher.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marks" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Marks Management</CardTitle>
                <CardDescription>Add and manage student marks for all classes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.value} value={cls.value}>{cls.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Search by admission number" />
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Marks
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export to Google Sheets
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-600" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure system-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800">Result Visibility</h4>
                      <p className="text-sm text-slate-600">Control whether students can view their results</p>
                    </div>
                    <Button 
                      onClick={toggleResultVisibility}
                      variant={resultVisibility ? "destructive" : "default"}
                    >
                      {resultVisibility ? "Hide Results" : "Show Results"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800">Google Sheets Integration</h4>
                      <p className="text-sm text-slate-600">Sync data with Google Sheets automatically</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800">System Backup</h4>
                      <p className="text-sm text-slate-600">Create and manage system backups</p>
                    </div>
                    <Button variant="outline">Backup Now</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
