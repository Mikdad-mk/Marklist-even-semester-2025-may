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
  PlusCircle,
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
  status: 'active' | 'inactive';
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

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [preRegisteredTeachers, setPreRegisteredTeachers] = useState<PreRegisteredTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTeacher, setNewTeacher] = useState({ name: '', registerNumber: '' });
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [reason, setReason] = useState('');
  
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
        description: "You do not have permission to access the admin panel",
        variant: "destructive"
      });
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
      
      fetchTeachers();
      fetchRequests();
      toast({
        title: "Success",
        description: "Teacher approved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve teacher",
        variant: "destructive"
      });
      console.error('Error:', error);
    }
  };

  const handleRejectRequest = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/admin/reject-teacher/${teacherId}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to reject teacher');
      
      fetchTeachers();
      fetchRequests();
      toast({
        title: "Success",
        description: "Teacher rejected successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject teacher",
        variant: "destructive"
      });
      console.error('Error:', error);
    }
  };

  const handleToggleMarkEntry = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    if (!teacher.canEnterMarks) {
      setShowDialog(true);
    } else {
      await toggleAccess(teacher.id);
    }
  };

  const toggleAccess = async (teacherId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/toggle-mark-entry/${teacherId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) throw new Error('Failed to toggle mark entry access');
      
      fetchTeachers();
      setShowDialog(false);
      setReason('');
      toast({
        title: "Success",
        description: "Mark entry access updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update mark entry access",
        variant: "destructive"
      });
      console.error('Error:', error);
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

  const handleToggleStatus = async (teacherId: string, currentStatus: 'active' | 'inactive') => {
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: currentStatus === 'active' ? 'inactive' : 'active'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update teacher status');
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: data.message,
      });

      // Refresh the teachers list
      fetchTeachers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update teacher status",
        variant: "destructive"
      });
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-full">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-200"></div>
          <div className="h-4 w-24 rounded bg-indigo-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <Card className="bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Pre-register Teachers</CardTitle>
            <CardDescription>Add new teachers to the system</CardDescription>
          </div>
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

          <div className="rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preRegisteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50">
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
        </CardContent>
      </Card>

      {/* Teacher Access Requests */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Access Requests</CardTitle>
            <CardDescription>Manage teacher access requests</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{request.name}</td>
                    <td className="px-6 py-4 text-gray-500">{request.email}</td>
                    <td className="px-6 py-4 text-gray-500">{request.registerNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleApproveRequest(request.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
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
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Mail className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-500">No pending access requests</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Management */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-sm">
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
            <div className="space-y-4">
              {teachers.map((teacher) => (
                <Card key={teacher.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{teacher.name}</h3>
                        <p className="text-sm text-gray-500">{teacher.email}</p>
                        <p className="text-sm text-gray-500">Register No: {teacher.registerNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={teacher.status === 'active' ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleStatus(teacher.id, teacher.status)}
                        >
                          {teacher.status === 'active' ? (
                            <>
                              <Lock className="w-4 h-4 mr-1" />
                              Disable Account
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 mr-1" />
                              Enable Account
                            </>
                          )}
                        </Button>
                        <Button
                          variant={teacher.canEnterMarks ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleMarkEntry(teacher)}
                          disabled={teacher.status === 'inactive'}
                          className={!teacher.canEnterMarks ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                        >
                          {teacher.canEnterMarks ? (
                            <>
                              <UserX className="w-4 h-4 mr-1" />
                              Revoke Access
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Grant Access
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {teacher.lastMarkEntryAccess && (
                      <div className="mt-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline-block mr-1" />
                        Last access granted: {new Date(teacher.lastMarkEntryAccess.grantedAt).toLocaleString()}
                        {teacher.lastMarkEntryAccess.reason && (
                          <span className="ml-2">
                            Reason: {teacher.lastMarkEntryAccess.reason}
                          </span>
                        )}
                      </div>
                    )}
                    {teacher.status === 'inactive' && (
                      <div className="mt-2 text-sm text-red-500 flex items-center">
                        <Lock className="w-4 h-4 mr-1" />
                        Account is currently disabled
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grant Access Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Mark Entry Access</DialogTitle>
            <DialogDescription>
              Please provide a reason for granting mark entry access to {selectedTeacher?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for granting access"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedTeacher && toggleAccess(selectedTeacher.id, reason)}
              disabled={!reason.trim()}
            >
              Grant Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 