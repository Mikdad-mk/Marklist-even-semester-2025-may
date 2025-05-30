'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  UserCheck, 
  UserX, 
  Lock, 
  Unlock, 
  Users, 
  Mail, 
  Calendar,
  BarChart3,
  Settings,
  Home,
  PlusCircle,
  Bell,
  Clock,
  UserPlus,
  Check,
  Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface Teacher {
  id: string;
  name: string;
  email: string;
  registerNumber: string;
  isApproved: boolean;
  canEnterMarks: boolean;
  lastMarkEntryAccess?: {
    grantedAt: string;
    reason: string;
  };
}

interface TeacherRequest {
  id: string;
  name: string;
  email: string;
  registerNumber: string;
}

interface PreRegisteredTeacher {
  _id: string;
  name: string;
  registerNumber: string;
  isRegistered: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [preRegisteredTeachers, setPreRegisteredTeachers] = useState<PreRegisteredTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTeacher, setNewTeacher] = useState({ name: '', registerNumber: '' });
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [reason, setReason] = useState('');
  
  const { user, logout } = useAuth();
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

    fetchTeachers();
    fetchRequests();
    fetchPreRegisteredTeachers();
  }, [user, router]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers');
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      setError('Failed to load teachers');
      console.error('Error:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/teacher-requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      setError('Failed to load access requests');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreRegisteredTeachers = async () => {
    try {
      const response = await fetch('/api/admin/pre-register-teacher');
      if (!response.ok) throw new Error('Failed to fetch pre-registered teachers');
      const data = await response.json();
      setPreRegisteredTeachers(data);
    } catch (error) {
      setError('Failed to load pre-registered teachers');
      console.error('Error:', error);
    }
  };

  const handleApproveRequest = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/admin/approve-teacher/${teacherId}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to approve teacher');
      
      // Refresh the lists
      fetchTeachers();
      fetchRequests();
    } catch (error) {
      setError('Failed to approve teacher');
      console.error('Error:', error);
    }
  };

  const handleRejectRequest = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/admin/reject-teacher/${teacherId}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to reject teacher');
      
      // Refresh the lists
      fetchTeachers();
      fetchRequests();
    } catch (error) {
      setError('Failed to reject teacher');
      console.error('Error:', error);
    }
  };

  const handleToggleMarkEntry = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    if (!teacher.canEnterMarks) {
      // Only show dialog when granting access
      setShowDialog(true);
    } else {
      // Directly revoke access without reason
      await toggleAccess(teacher.id);
    }
  };

  const toggleAccess = async (teacherId: string, accessReason?: string) => {
    try {
      const response = await fetch(`/api/admin/toggle-mark-entry/${teacherId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: accessReason }),
      });
      
      if (!response.ok) throw new Error('Failed to toggle mark entry access');
      
      await fetchTeachers();
      toast({
        title: "Success",
        description: "Mark entry access updated successfully",
      });
      
      setShowDialog(false);
      setReason('');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update mark entry access",
        variant: "destructive",
      });
    }
  };

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

  const handlePreRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/pre-register-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTeacher),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to pre-register teacher');
      }

      // Reset form and refresh list
      setNewTeacher({ name: '', registerNumber: '' });
      fetchPreRegisteredTeachers();
      toast({
        title: "Success",
        description: "Teacher pre-registered successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to pre-register teacher",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/delete-teacher/${teacherId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete teacher');
      
      // Refresh the lists
      fetchTeachers();
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete teacher",
        variant: "destructive",
      });
    }
  };

  const handleDeletePreRegisteredTeacher = async (teacherId: string) => {
    if (!window.confirm('Are you sure you want to delete this pre-registered teacher? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/delete-preregistered-teacher/${teacherId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete pre-registered teacher');
      
      // Refresh the list
      fetchPreRegisteredTeachers();
      toast({
        title: "Success",
        description: "Pre-registered teacher deleted successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete pre-registered teacher",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
          <button className="flex items-center w-full px-4 py-2 text-gray-700 bg-indigo-50 rounded-lg">
            <Home className="w-5 h-5 mr-4 text-indigo-600" />
            <span className="font-medium text-indigo-600">Dashboard</span>
          </button>
          <button className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 mr-4" />
            <span>Teachers</span>
          </button>
          <button className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 mr-4" />
            <span>Schedule</span>
          </button>
          <button className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Settings className="w-5 h-5 mr-4" />
            <span>Settings</span>
          </button>
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
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Welcome Back, Admin</h1>
              <p className="text-sm text-gray-500">Here's what's happening in your portal today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Mail className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-100">Total Teachers</p>
                    <h3 className="text-2xl font-bold mt-2">{teachers.length}</h3>
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
                    <p className="text-sm font-medium text-emerald-100">Active Now</p>
                    <h3 className="text-2xl font-bold mt-2">
                      {teachers.filter(t => t.canEnterMarks).length}
                    </h3>
                  </div>
                  <div className="p-3 bg-white/10 rounded-full">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-100">Pending Requests</p>
                    <h3 className="text-2xl font-bold mt-2">{requests.length}</h3>
                  </div>
                  <div className="p-3 bg-white/10 rounded-full">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-100">Pre-registered</p>
                    <h3 className="text-2xl font-bold mt-2">{preRegisteredTeachers.length}</h3>
                  </div>
                  <div className="p-3 bg-white/10 rounded-full">
                    <UserPlus className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pre-register Teachers Section */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl font-bold">Pre-register Teachers</CardTitle>
                <CardDescription>Add new teachers to the system</CardDescription>
              </div>
              <Button className="flex items-center gap-2" onClick={() => {}}>
                <PlusCircle className="w-4 h-4" />
                Add Teacher
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePreRegisterTeacher} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Teacher Name</Label>
                  <Input
                    id="name"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter teacher name"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerNumber">Register Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="registerNumber"
                      value={newTeacher.registerNumber}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, registerNumber: e.target.value }))}
                      placeholder="Enter register number"
                      className="flex-1"
                    />
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                      Add
                    </Button>
                  </div>
                </div>
              </form>

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                        <th className="px-6 py-3 font-medium text-gray-500">Register Number</th>
                        <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                        <th className="px-6 py-3 font-medium text-gray-500">Added On</th>
                        <th className="px-6 py-3 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {preRegisteredTeachers.map((teacher) => (
                        <tr key={teacher._id} className="bg-white hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{teacher.name}</td>
                          <td className="px-6 py-4 text-gray-500">{teacher.registerNumber}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              teacher.isRegistered 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {teacher.isRegistered ? 'Registered' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(teacher.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              onClick={() => handleDeletePreRegisteredTeacher(teacher._id)}
                              size="sm"
                              variant="destructive"
                              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {preRegisteredTeachers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Users className="w-8 h-8 text-gray-400" />
                              <p className="text-sm text-gray-500">No pre-registered teachers found</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Access Requests */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl font-bold">Access Requests</CardTitle>
                <CardDescription>Manage teacher access requests</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <Check className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">All caught up!</h3>
                  <p className="text-sm text-gray-500 mt-1">No pending access requests</p>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                          <th className="px-6 py-3 font-medium text-gray-500">Email</th>
                          <th className="px-6 py-3 font-medium text-gray-500">Register Number</th>
                          <th className="px-6 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {requests.map((request) => (
                          <tr key={request.id} className="bg-white hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{request.name}</td>
                            <td className="px-6 py-4 text-gray-500">{request.email}</td>
                            <td className="px-6 py-4 text-gray-500">{request.registerNumber}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleApproveRequest(request.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleRejectRequest(request.id)}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <UserX className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teacher Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl font-bold">Teacher Management</CardTitle>
                <CardDescription>Manage approved teachers and their permissions</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {teachers.length === 0 ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">No teachers yet</h3>
                  <p className="text-sm text-gray-500 mt-1">Start by pre-registering teachers</p>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                          <th className="px-6 py-3 font-medium text-gray-500">Email</th>
                          <th className="px-6 py-3 font-medium text-gray-500">Register Number</th>
                          <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                          <th className="px-6 py-3 font-medium text-gray-500">Mark Entry</th>
                          <th className="px-6 py-3 font-medium text-gray-500">Last Update</th>
                          <th className="px-6 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {teachers.map((teacher) => (
                          <tr key={teacher.id} className="bg-white hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{teacher.name}</td>
                            <td className="px-6 py-4 text-gray-500">{teacher.email}</td>
                            <td className="px-6 py-4 text-gray-500">{teacher.registerNumber}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                teacher.isApproved 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {teacher.isApproved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                teacher.canEnterMarks 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {teacher.canEnterMarks ? 'Enabled' : 'Disabled'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                              {teacher.lastMarkEntryAccess ? (
                                <div>
                                  <p className="text-sm">{new Date(teacher.lastMarkEntryAccess.grantedAt).toLocaleDateString()}</p>
                                  <p className="text-xs text-gray-400">{teacher.lastMarkEntryAccess.reason}</p>
                                </div>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {teacher.isApproved ? (
                                  <>
                                    <Button
                                      onClick={() => handleToggleMarkEntry(teacher)}
                                      size="sm"
                                      variant={teacher.canEnterMarks ? "destructive" : "default"}
                                    >
                                      {teacher.canEnterMarks ? (
                                        <>
                                          <Lock className="w-4 h-4 mr-1" />
                                          Revoke
                                        </>
                                      ) : (
                                        <>
                                          <Unlock className="w-4 h-4 mr-1" />
                                          Grant
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteTeacher(teacher.id)}
                                      size="sm"
                                      variant="destructive"
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      onClick={() => handleApproveRequest(teacher.id)}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => handleRejectRequest(teacher.id)}
                                      size="sm"
                                      variant="destructive"
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grant Access Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Grant Mark Entry Access</DialogTitle>
            <DialogDescription>
              Please provide a reason for granting mark entry access to {selectedTeacher?.name}.
              This will be recorded for tracking purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Input
                id="reason"
                placeholder="Enter reason for granting access"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedTeacher && toggleAccess(selectedTeacher.id, reason)}
              disabled={!reason.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Grant Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 