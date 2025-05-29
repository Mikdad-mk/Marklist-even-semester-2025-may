'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  class: string;
  displayName: string;
}

interface Mark {
  id: string;
  studentId: string;
  subject: string;
  ce: number;
  te: number;
  total: number;
  result: 'Pass' | 'Fail';
}

export default function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subject, setSubject] = useState('');
  const [ce, setCE] = useState('');
  const [te, setTE] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  
  const { user, logout } = useAuth();
  const router = useRouter();

  const classes = ['6th', '8th', 'Plus One', 'Plus Two', 'D1', 'D2', 'D3'];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'teacher') {
      router.push('/');
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the teacher dashboard",
        variant: "destructive"
      });
      return;
    }

    if (!user.isApproved) {
      router.push('/pending');
      return;
    }

    if (!user.canEnterMarks) {
      toast({
        title: "Mark Entry Restricted",
        description: "Your mark entry access is currently disabled. Please contact the administrator.",
        variant: "destructive"
      });
    }

    setLoading(false);
  }, [user, router]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedStudent) {
      const student = students.find(s => s.id === selectedStudent);
      if (student) {
        setAdmissionNumber(student.admissionNumber);
        setStudentName(student.name);
      }
    }
  }, [selectedStudent, students]);

  const fetchStudents = async (className: string) => {
    try {
      const response = await fetch(`/api/teacher/students?class=${className}`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setError('Failed to load students');
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.canEnterMarks) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to enter marks at this time. Please contact the administrator.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Debug logs for form state
      console.log('Submitting form with values:', {
        selectedStudent,
        admissionNumber,
        studentName,
        subject,
        ce,
        te
      });

      // Basic validation
      if (!admissionNumber.trim()) {
        toast({
          title: "Error",
          description: "Please enter admission number",
          variant: "destructive",
        });
        return;
      }

      if (!studentName.trim()) {
        toast({
          title: "Error",
          description: "Please enter student name",
          variant: "destructive",
        });
        return;
      }

      // Validate subject
      if (!subject.trim()) {
        toast({
          title: "Error",
          description: "Please enter a subject",
          variant: "destructive",
        });
        return;
      }

      // Validate marks
      if (ce === '' || te === '') {
        toast({
          title: "Error",
          description: "Please enter both CE and TE marks",
          variant: "destructive",
        });
        return;
      }

      const ceValue = parseInt(ce);
      const teValue = parseInt(te);

      if (isNaN(ceValue) || ceValue < 0 || ceValue > 30) {
        toast({
          title: "Error",
          description: "CE marks must be between 0 and 30",
          variant: "destructive",
        });
        return;
      }

      if (isNaN(teValue) || teValue < 0 || teValue > 70) {
        toast({
          title: "Error",
          description: "TE marks must be between 0 and 70",
          variant: "destructive",
        });
        return;
      }

      // First, if this is a new student, create the student
      let studentId = selectedStudent;
      
      if (!selectedStudent) {
        // Create new student first
        const studentResponse = await fetch('/api/teacher/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: studentName.trim(),
            admissionNumber: admissionNumber.trim(),
            class: selectedClass,
          }),
        });

        if (!studentResponse.ok) {
          const studentData = await studentResponse.json();
          throw new Error(studentData.error || studentData.message || 'Failed to create student');
        }

        const studentData = await studentResponse.json();
        studentId = studentData.id; // Get the MongoDB ObjectId from the response
      }

      // Now submit the marks with the valid student ID
      const formData = {
        studentId,
        subject: subject.trim(),
        ce: ceValue,
        te: teValue,
        total: ceValue + teValue,
        result: (ceValue + teValue) >= 40 ? 'Pass' : 'Fail'
      };

      console.log('Sending marks data to server:', formData);

      // Send the marks data to the server
      const response = await fetch('/api/teacher/marks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Server response status:', response.status);
      const data = await response.json();
      console.log('Server response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit marks');
      }

      // Success! Reset form
      setSubject('');
      setCE('');
      setTE('');
      
      toast({
        title: "Success",
        description: "Marks submitted successfully",
      });

      // Refresh marks list
      if (studentId) {
        fetchStudents(selectedClass);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit marks",
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user?.isApproved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            Your account has been rejected by the admin. You cannot access the mark management system.
          </p>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Logout */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome, {user?.name}</p>
              {!user?.canEnterMarks && (
                <p className="mt-1 text-sm text-red-500">Mark entry access is currently disabled</p>
              )}
              {user?.lastMarkEntryAccess && (
                <p className="mt-1 text-xs text-gray-400">
                  Last access update: {new Date(user.lastMarkEntryAccess.grantedAt).toLocaleDateString()} - 
                  {user.lastMarkEntryAccess.reason}
                </p>
              )}
            </div>
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
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {!user?.canEnterMarks && (
          <Alert variant="destructive" className="mb-6 bg-red-50 border border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 font-semibold">Access Restricted</AlertTitle>
            <AlertDescription className="text-red-700">
              Your mark entry access is currently disabled. Please contact the administrator for assistance.
            </AlertDescription>
          </Alert>
        )}

        {/* Class Selection */}
        <div className="bg-white shadow rounded-lg mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select Class
          </h2>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
              !user?.canEnterMarks ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            disabled={!user?.canEnterMarks}
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <>
            {/* Mark Entry Form */}
            <div className="bg-white shadow rounded-lg mb-8 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Enter Marks
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="admissionNumber" className="block text-sm font-medium text-gray-700">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      id="admissionNumber"
                      value={admissionNumber}
                      onChange={(e) => {
                        setAdmissionNumber(e.target.value);
                        // Only try to find existing student if admission number is not empty
                        if (e.target.value.trim()) {
                          const student = students.find(s => s.admissionNumber === e.target.value);
                          if (student) {
                            setSelectedStudent(student.id);
                            setStudentName(student.name);
                          } else {
                            // Don't clear the form if student not found
                            setSelectedStudent('');
                          }
                        }
                      }}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter admission number"
                      required
                      disabled={!user?.canEnterMarks}
                    />
                  </div>
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
                      Student Name
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter student name"
                      required
                      disabled={!user?.canEnterMarks}
                    />
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter subject name"
                    required
                    disabled={!user?.canEnterMarks}
                  />
                </div>

                {/* Marks Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ce" className="block text-sm font-medium text-gray-700">
                      CE (Max: 30)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        id="ce"
                        min="0"
                        max="30"
                        value={ce}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 30)) {
                            setCE(value);
                          }
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="0-30"
                        required
                        disabled={!user?.canEnterMarks}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="te" className="block text-sm font-medium text-gray-700">
                      TE (Max: 70)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        id="te"
                        min="0"
                        max="70"
                        value={te}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 70)) {
                            setTE(value);
                          }
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="0-70"
                        required
                        disabled={!user?.canEnterMarks}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className={`w-full font-medium ${
                    user?.canEnterMarks 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-400 cursor-not-allowed text-white'
                  }`}
                  disabled={!user?.canEnterMarks || !admissionNumber.trim() || !studentName.trim() || !subject.trim() || !ce || !te}
                >
                  {user?.canEnterMarks ? 'Submit Marks' : 'Mark Entry Disabled'}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 