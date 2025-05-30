'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  class: string;
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

const classes = ['6th', '8th', 'Plus One', 'Plus Two', 'D1', 'D2', 'D3'];

export default function MarksEntry() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [studentName, setStudentName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [ce, setCE] = useState('');
  const [te, setTE] = useState('');
  const [recentSubmissions, setRecentSubmissions] = useState<Mark[]>([]);
  const { user } = useAuth();
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

    if (user.status === 'inactive') {
      router.push('/teacher/dashboard');
      toast({
        title: "Account Restricted",
        description: "Your account has been disabled by an administrator. You cannot enter marks at this time.",
        variant: "destructive"
      });
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchStudents = async (className: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/students?class=${className}`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate marks
      const ceValue = parseInt(ce);
      const teValue = parseInt(te);

      if (isNaN(ceValue) || ceValue < 0 || ceValue > 30) {
        toast({
          title: "Error",
          description: "CE marks must be between 0 and 30",
          variant: "destructive"
        });
        return;
      }

      if (isNaN(teValue) || teValue < 0 || teValue > 70) {
        toast({
          title: "Error",
          description: "TE marks must be between 0 and 70",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/teacher/marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: studentName.trim(),
          admissionNumber: admissionNumber.trim(),
          class: selectedClass,
          subject: subject.trim(),
          ce: ceValue,
          te: teValue
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit marks');
      }

      // Add to recent submissions
      setRecentSubmissions(prev => [
        {
          id: data._id,
          studentId: data.studentId || 'new',
          subject: subject,
          ce: ceValue,
          te: teValue,
          total: ceValue + teValue,
          result: (ceValue + teValue) >= 40 ? 'Pass' : 'Fail'
        },
        ...prev.slice(0, 4) // Keep only last 5 submissions
      ]);

      // Reset form
      setStudentName('');
      setAdmissionNumber('');
      setSubject('');
      setCE('');
      setTE('');

      toast({
        title: "Success",
        description: "Marks submitted successfully",
      });
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit marks",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'teacher' || !user.isApproved || user.status === 'inactive') {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Enter Marks</h1>
        <p className="text-gray-600">Submit student marks for evaluation</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mark Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Mark Entry Form</CardTitle>
            <CardDescription>Enter student marks for CE and TE</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Class</label>
                <Select
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Student Name</label>
                <Input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Admission Number</label>
                <Input
                  type="text"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  placeholder="Enter admission number"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <Input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">CE (Max: 30)</label>
                  <Input
                    type="number"
                    value={ce}
                    onChange={(e) => setCE(e.target.value)}
                    min="0"
                    max="30"
                    placeholder="0-30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">TE (Max: 70)</label>
                  <Input
                    type="number"
                    value={te}
                    onChange={(e) => setTE(e.target.value)}
                    min="0"
                    max="70"
                    placeholder="0-70"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !studentName || !admissionNumber || !selectedClass || !subject || !ce || !te}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Marks'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Last 5 mark entries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentSubmissions.map((submission) => {
                  const student = students.find(s => s.id === submission.studentId);
                  return (
                    <div key={submission.id} className="py-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {submission.studentId === 'new' ? studentName : (student?.name || 'Unknown Student')}
                          </p>
                          <p className="text-sm text-gray-500">{submission.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            Total: {submission.total}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              submission.result === 'Pass'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {submission.result}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        CE: {submission.ce} | TE: {submission.te}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No recent submissions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 