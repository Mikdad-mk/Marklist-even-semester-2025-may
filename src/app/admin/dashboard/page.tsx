'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, UserCheck, UserX, Lock, Unlock } from 'lucide-react';
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Logout */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Pre-register Teachers Section */}
          <div className="bg-white shadow rounded-lg mb-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pre-register Teachers
            </h2>
            <form onSubmit={handlePreRegisterTeacher} className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Teacher Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter teacher name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700">
                    Register Number
                  </label>
                  <Input
                    id="registerNumber"
                    type="text"
                    value={newTeacher.registerNumber}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, registerNumber: e.target.value }))}
                    placeholder="Enter register number"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="flex items-center gap-2">
                Add Teacher
              </Button>
            </form>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Register Number
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preRegisteredTeachers.map((teacher) => (
                    <tr key={teacher._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {teacher.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.registerNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          teacher.isRegistered 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {teacher.isRegistered ? 'Registered' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(teacher.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Teacher Access Requests */}
          <div className="bg-white shadow rounded-lg mb-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Teacher Access Requests
            </h2>
            {requests.length === 0 ? (
              <p className="text-gray-500">No pending requests</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Register Number
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.registerNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Approved Teachers */}
          <Card className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Teacher Management
            </h2>
            {teachers.length === 0 ? (
              <p className="text-gray-500">No teachers found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Register Number
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mark Entry Access
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Access Update
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teachers.map((teacher) => (
                      <tr key={teacher.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {teacher.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {teacher.registerNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            teacher.isApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {teacher.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            teacher.canEnterMarks 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {teacher.canEnterMarks ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {teacher.lastMarkEntryAccess ? (
                            <div>
                              <p>Updated: {new Date(teacher.lastMarkEntryAccess.grantedAt).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-400">Reason: {teacher.lastMarkEntryAccess.reason}</p>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-2">
                          {teacher.isApproved ? (
                            <Button
                              onClick={() => handleToggleMarkEntry(teacher)}
                              variant={teacher.canEnterMarks ? "destructive" : "default"}
                              size="sm"
                              className={`flex items-center gap-2 w-full font-medium ${
                                teacher.canEnterMarks 
                                  ? 'bg-red-600 hover:bg-red-700 text-white border-0' 
                                  : 'bg-green-600 hover:bg-green-700 text-white border-0'
                              }`}
                            >
                              {teacher.canEnterMarks ? (
                                <>
                                  <Lock className="h-4 w-4" />
                                  Revoke Access
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-4 w-4" />
                                  Grant Access
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className="space-y-2">
                              <Button
                                onClick={() => handleApproveRequest(teacher.id)}
                                variant="default"
                                size="sm"
                                className="flex items-center gap-2 w-full"
                              >
                                <UserCheck className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectRequest(teacher.id)}
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2 w-full"
                              >
                                <UserX className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
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
    </div>
  );
} 