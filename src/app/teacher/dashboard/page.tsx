'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Loader2 } from 'lucide-react';
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subject, setSubject] = useState('');
  const [ce, setCE] = useState('');
  const [te, setTE] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [recentSubmissions, setRecentSubmissions] = useState<Mark[]>([]);
  
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

  const resetForm = () => {
    setSubject('');
    setCE('');
    setTE('');
    if (!selectedStudent) {
      setAdmissionNumber('');
      setStudentName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!user?.canEnterMarks) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to enter marks at this time. Please contact the administrator.",
        variant: "destructive"
      });
      setSubmitting(false);
      return;
    }

    try {
      // Basic validation
      if (!admissionNumber.trim()) {
        toast({
          title: "Error",
          description: "Please enter admission number",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      if (!studentName.trim()) {
        toast({
          title: "Error",
          description: "Please enter student name",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Validate subject
      if (!subject.trim()) {
        toast({
          title: "Error",
          description: "Please enter a subject",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Validate marks
      if (ce === '' || te === '') {
        toast({
          title: "Error",
          description: "Please enter both CE and TE marks",
          variant: "destructive",
        });
        setSubmitting(false);
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
        setSubmitting(false);
        return;
      }

      if (isNaN(teValue) || teValue < 0 || teValue > 70) {
        toast({
          title: "Error",
          description: "TE marks must be between 0 and 70",
          variant: "destructive",
        });
        setSubmitting(false);
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

      // Send the marks data to the server
      const response = await fetch('/api/teacher/marks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit marks');
      }

      // Add to recent submissions
      setRecentSubmissions(prev => [
        { ...formData, id: data.id } as Mark,
        ...prev.slice(0, 4) // Keep only last 5 submissions
      ]);

      // Success! Reset form
      resetForm();
      
      toast({
        title: "Success",
        description: "Marks submitted successfully",
      });

      // Refresh students list if needed
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
    } finally {
      setSubmitting(false);
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
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-200"></div>
          <div className="h-4 w-24 rounded bg-indigo-200"></div>
        </div>
      </div>
    );
  }

  if (!user?.isApproved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center max-w-md mx-4">
          <div className="mb-6 text-red-500">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Your account has been rejected by the admin. You cannot access the mark management system.
          </p>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {!user?.canEnterMarks && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription>
              Your mark entry access is currently disabled. Please contact the administrator.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-2xl mb-8 p-6 transition-all hover:shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
            Select Class
          </h2>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className={`mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl transition-all ${
              !user?.canEnterMarks ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
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
          <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-2xl p-6 transition-all hover:shadow-md animate-scale-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Enter Marks
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Details */}
                <div className="space-y-4">
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
                        if (e.target.value.trim()) {
                          const student = students.find(s => s.admissionNumber === e.target.value);
                          if (student) {
                            setSelectedStudent(student.id);
                            setStudentName(student.name);
                          } else {
                            setSelectedStudent('');
                          }
                        }
                      }}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                      placeholder="Enter admission number"
                      required
                      disabled={!user?.canEnterMarks || submitting}
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
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                      placeholder="Enter student name"
                      required
                      disabled={!user?.canEnterMarks || submitting}
                    />
                  </div>
                </div>

                {/* Subject and Marks */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                      placeholder="Enter subject name"
                      required
                      disabled={!user?.canEnterMarks || submitting}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ce" className="block text-sm font-medium text-gray-700">
                        CE (Max: 30)
                      </label>
                      <div className="mt-1 relative rounded-xl shadow-sm">
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
                          className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                          placeholder="0-30"
                          required
                          disabled={!user?.canEnterMarks || submitting}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="te" className="block text-sm font-medium text-gray-700">
                        TE (Max: 70)
                      </label>
                      <div className="mt-1 relative rounded-xl shadow-sm">
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
                          className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                          placeholder="0-70"
                          required
                          disabled={!user?.canEnterMarks || submitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full py-3 font-medium rounded-xl transition-all ${
                  user?.canEnterMarks 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!user?.canEnterMarks || submitting || !admissionNumber.trim() || !studentName.trim() || !subject.trim() || !ce || !te}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </span>
                ) : user?.canEnterMarks ? (
                  <span className="flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" />
                    Submit Marks
                  </span>
                ) : (
                  'Mark Entry Disabled'
                )}
              </Button>
            </form>

            {/* Recent Submissions */}
            {recentSubmissions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CE</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TE</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" key="recent-submissions-tbody">
                      {recentSubmissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.ce}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.te}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.total}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              submission.result === 'Pass' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {submission.result}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 