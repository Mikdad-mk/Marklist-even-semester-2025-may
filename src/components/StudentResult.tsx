"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Award, TrendingUp, Calendar, User, Hash, Printer, CheckCircle, XCircle } from "lucide-react";
import { Style } from "@/components/ui/style";

interface StudentResultProps {
  admissionNumber: string;
}

const StudentResult = ({ admissionNumber: propAdmissionNumber }: StudentResultProps) => {
  // Use the URL parameter instead of the prop if it's just a placeholder
  const params = useParams();
  // Use the URL parameter if available, otherwise use the prop
  const admissionNumber = params?.admissionNumber as string || propAdmissionNumber;

  // Mock student data
  const studentData = {
    admissionNumber: admissionNumber || "IDA2024001",
    name: "Mohammad Ibrahim Khan",
    class: "Plus Two",
    semester: "Even Semester 2024–25",
    examDate: "May 2024"
  };

  const marks = [
    { subject: "English", ce: 28, te: 65, total: 93, result: "Pass" },
    { subject: "Malayalam", ce: 25, te: 58, total: 83, result: "Pass" },
    { subject: "Arabic", ce: 30, te: 70, total: 100, result: "Pass" },
    { subject: "Islamic Studies", ce: 29, te: 68, total: 97, result: "Pass" },
    { subject: "Mathematics", ce: 22, te: 45, total: 67, result: "Pass" },
    { subject: "Physics", ce: 26, te: 52, total: 78, result: "Pass" },
  ];

  const totalMarks = marks.reduce((sum, mark) => sum + mark.total, 0);
  const maxMarks = marks.length * 100;
  const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
  const average = (totalMarks / marks.length).toFixed(2);

  const getGrade = (avg: number) => {
    if (avg >= 90) return { grade: "Excellency", color: "text-emerald-600 bg-emerald-50" };
    if (avg >= 80) return { grade: "Very Good", color: "text-blue-600 bg-blue-50" };
    if (avg >= 65) return { grade: "Good", color: "text-indigo-600 bg-indigo-50" };
    if (avg >= 50) return { grade: "Average", color: "text-amber-600 bg-amber-50" };
    return { grade: "Below Average", color: "text-red-600 bg-red-50" };
  };

  const getStatus = () => {
    const allPassed = marks.every(mark => mark.result === "Pass");
    if (!allPassed) return { status: "Failed", color: "text-red-600 bg-red-50", icon: XCircle };
    
    if (studentData.class === "Plus Two" || studentData.class === "D3") {
      return { status: "Eligible for Higher Study", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle };
    }
    
    return { status: "All Pass", color: "text-blue-600 bg-blue-50", icon: CheckCircle };
  };

  const gradeInfo = getGrade(parseFloat(average));
  const statusInfo = getStatus();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl print:shadow-none">
          <CardHeader className="text-center bg-gradient-to-r from-emerald-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Islamic Da'wa Academy</CardTitle>
                <p className="text-emerald-50">{studentData.semester} - {studentData.examDate}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Admission Number</p>
                    <p className="font-semibold text-slate-800">{studentData.admissionNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Student Name</p>
                    <p className="font-semibold text-slate-800">{studentData.name}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Class</p>
                    <p className="font-semibold text-slate-800">{studentData.class}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <statusInfo.icon className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <Badge className={statusInfo.color + " font-semibold"}>
                      {statusInfo.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marks Table */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Examination Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Subject</TableHead>
                    <TableHead className="text-center font-semibold">CE (30)</TableHead>
                    <TableHead className="text-center font-semibold">TE (70)</TableHead>
                    <TableHead className="text-center font-semibold">Total (100)</TableHead>
                    <TableHead className="text-center font-semibold">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.map((mark, index) => (
                    <TableRow key={index} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">{mark.subject}</TableCell>
                      <TableCell className="text-center">
                        <span className={mark.ce >= 15 ? "text-emerald-600" : "text-red-600"}>
                          {mark.ce}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={mark.te >= 28 ? "text-emerald-600" : "text-red-600"}>
                          {mark.te}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{mark.total}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={mark.result === "Pass" ? "default" : "destructive"}
                          className={mark.result === "Pass" ? "bg-emerald-100 text-emerald-800" : ""}
                        >
                          {mark.result}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator className="my-6" />

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Total Marks</p>
                <p className="text-2xl font-bold text-slate-800">{totalMarks}/{maxMarks}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Percentage</p>
                <p className="text-2xl font-bold text-slate-800">{percentage}%</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Average</p>
                <p className="text-2xl font-bold text-slate-800">{average}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Grade</p>
                <Badge className={gradeInfo.color + " text-lg font-bold px-3 py-1"}>
                  {gradeInfo.grade}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Quote */}
        <Card className="bg-gradient-to-r from-emerald-50 to-indigo-50 border-0 shadow-lg print:shadow-none">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-800">Congratulations!</h3>
            </div>
            <blockquote className="text-slate-700 italic mb-2">
              "Success is not final, failure is not fatal: it is the courage to continue that counts."
            </blockquote>
            <cite className="text-slate-500 text-sm">— Winston Churchill</cite>
            <p className="text-emerald-600 font-medium mt-3">
              Keep striving for excellence in your academic journey!
            </p>
          </CardContent>
        </Card>

        {/* Print Button */}
        <div className="flex justify-center print:hidden">
          <Button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-900 text-white shadow-lg flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Result
          </Button>
        </div>

        {/* Print Styles */}
        <Style jsx global>
          {`
            @media print {
              body { 
                print-color-adjust: exact; 
                -webkit-print-color-adjust: exact; 
              }
              .print\\:hidden { display: none !important; }
              .print\\:shadow-none { box-shadow: none !important; }
              .print\\:bg-white { background: white !important; }
              .print\\:p-0 { padding: 0 !important; }
            }
          `}
        </Style>
      </div>
    </div>
  );
};

export default StudentResult;
