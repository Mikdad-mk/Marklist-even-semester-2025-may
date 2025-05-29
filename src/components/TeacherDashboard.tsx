import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Plus,
  Save,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import LogoutButton from "./LogoutButton";

interface StudentMark {
  id: string;
  admissionNumber: string;
  name: string;
  ce: string;
  te: string;
  total: number;
  result: 'Pass' | 'Fail' | 'Pending';
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role !== 'teacher') {
      return;
    }

    checkAccess();
    if (hasAccess) {
      fetchStudentMarks();
    }
  }, [user]);

  const checkAccess = async () => {
    try {
      const response = await fetch('/api/teacher/access-status');
      if (!response.ok) {
        throw new Error('Failed to check access status');
      }
      const data = await response.json();
      setHasAccess(data.hasAccess);
    } catch (error) {
      console.error('Error checking access:', error);
      toast({
        title: "Error",
        description: "Failed to check access status",
        variant: "destructive"
      });
    }
  };

  const requestAccess = async () => {
    try {
      const response = await fetch('/api/teacher/request-access', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to request access');
      }

      toast({
        title: "Success",
        description: "Access request sent successfully",
      });
    } catch (error) {
      console.error('Error requesting access:', error);
      toast({
        title: "Error",
        description: "Failed to request access",
        variant: "destructive"
      });
    }
  };

  const fetchStudentMarks = async () => {
    try {
      const response = await fetch('/api/teacher/student-marks');
      if (!response.ok) {
        throw new Error('Failed to fetch student marks');
      }
      const data = await response.json();
      setStudentMarks(data);
    } catch (error) {
      console.error('Error fetching student marks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student marks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncToSheets = async () => {
    try {
      const response = await fetch('/api/teacher/sync-to-sheets', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync to sheets');
      }

      toast({
        title: "Success",
        description: "Data synced to Google Sheets successfully",
      });
    } catch (error) {
      console.error('Error syncing to sheets:', error);
      toast({
        title: "Error",
        description: "Failed to sync to Google Sheets",
        variant: "destructive"
      });
    }
  };

  const calculateTotal = (ce: string, te: string) => {
    const ceValue = parseInt(ce) || 0;
    const teValue = parseInt(te) || 0;
    return ceValue + teValue;
  };

  const getResult = (total: number) => {
    return total >= 50 ? "Pass" : "Fail";
  };

  const updateMark = (id: string, field: string, value: string) => {
    setStudentMarks(prevMarks => 
      prevMarks.map(mark => {
        if (mark.id === id) {
          const updatedMark = { ...mark, [field]: value };
          if (field === "ce" || field === "te") {
            updatedMark.total = calculateTotal(updatedMark.ce, updatedMark.te);
            updatedMark.result = getResult(updatedMark.total);
          }
          return updatedMark;
        }
        return mark;
      })
    );
  };

  const saveMarks = () => {
    if (!selectedClass || !selectedSubject) {
      toast({
        title: "Error",
        description: "Please select class and subject first",
        variant: "destructive",
      });
      return;
    }

    const incompleteMarks = studentMarks.filter(mark => !mark.ce || !mark.te);
    if (incompleteMarks.length > 0) {
      toast({
        title: "Warning",
        description: `${incompleteMarks.length} students have incomplete marks`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Marks saved successfully",
    });
  };

  const dashboardStats = [
    {
      title: "Students Evaluated",
      value: studentMarks.filter(mark => mark.ce && mark.te).length.toString(),
      total: studentMarks.length,
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Pass Rate",
      value: `${Math.round((studentMarks.filter(mark => mark.result === "Pass").length / studentMarks.length) * 100)}%`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Pending Reviews",
      value: studentMarks.filter(mark => mark.result === "Pending").length.toString(),
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Completed",
      value: studentMarks.filter(mark => mark.result !== "Pending").length.toString(),
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  // Classes options
  const classes = [
    { value: "6th", label: "6th Standard" },
    { value: "8th", label: "8th Standard" },
    { value: "plus-one", label: "Plus One" },
    { value: "plus-two", label: "Plus Two" },
    { value: "d1", label: "D1" },
    { value: "d2", label: "D2" },
    { value: "d3", label: "D3" },
  ];

  // Subject options
  const subjects = [
    { value: "english", label: "English" },
    { value: "malayalam", label: "Malayalam" },
    { value: "arabic", label: "Arabic" },
    { value: "islamic-studies", label: "Islamic Studies" },
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "biology", label: "Biology" },
  ];

  if (!user) {
    return <div className="p-8 text-center ">you are not authorized</div>;
  }

  if (user.role !== 'teacher') {
    return <div className="p-8 text-center text-red-600">You are not authorized to view this page.</div>;
  }

  if (!hasAccess) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white shadow rounded text-center">
        <h2 className="text-xl font-bold mb-2">Access Pending</h2>
        <p className="mb-4">Your account is pending admin approval. Please wait for access to be granted.</p>
        <Button onClick={requestAccess} variant="outline">Request Access</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Teacher Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user?.name || 'Teacher'}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={syncToSheets} variant="outline" className="shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              Sync to Sheets
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
                    {stat.total && (
                      <p className="text-sm text-slate-500">of {stat.total}</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Class and Subject Selection */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Add Marks
            </CardTitle>
            <CardDescription>Select class and subject to add student marks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.value} value={cls.value}>{cls.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.value} value={subject.value}>{subject.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={saveMarks} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Marks
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marks Entry Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Student Marks Entry</CardTitle>
            <CardDescription>
              CE: Continuous Evaluation (Max: 30, Pass: 15) | TE: Terminal Examination (Max: 70, Pass: 28)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-center">CE (30)</TableHead>
                    <TableHead className="text-center">TE (70)</TableHead>
                    <TableHead className="text-center">Total (100)</TableHead>
                    <TableHead className="text-center">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentMarks.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">{student.admissionNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max="30"
                          value={student.ce}
                          onChange={(e) => updateMark(student.id, "ce", e.target.value)}
                          className="w-20 text-center"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max="70"
                          value={student.te}
                          onChange={(e) => updateMark(student.id, "te", e.target.value)}
                          className="w-20 text-center"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {student.total}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={student.result === "Pass" ? "default" : student.result === "Fail" ? "destructive" : "secondary"}
                          className={
                            student.result === "Pass" ? "bg-emerald-100 text-emerald-800" : 
                            student.result === "Fail" ? "" : "bg-amber-100 text-amber-800"
                          }
                        >
                          {student.result}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
