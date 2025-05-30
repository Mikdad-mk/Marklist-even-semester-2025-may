"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, Award, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const CE_PASS = 15;
const TE_PASS = 28;
const CE_MAX = 30;
const TE_MAX = 70;
const TOTAL_MAX = 100;

function getSubjectResult(ce: number, te: number) {
  return ce >= CE_PASS && te >= TE_PASS ? "Pass" : "Fail";
}

function getLevel(avg: number) {
  if (avg >= 90) return "Excellency";
  if (avg >= 80) return "Very Good";
  if (avg >= 65) return "Good";
  if (avg >= 50) return "Average";
  return "Below Average";
}

function getEligibility(cls: string, allPassed: boolean) {
  if (!allPassed) return "Failed";
  if (["Plus Two", "D3"].includes(cls)) return "Eligible for Higher Study";
  return "All Pass";
}

export default function ResultPage() {
  const params = useParams();
  const admissionNumber = params?.admissionNumber as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const response = await fetch(`/api/result/${admissionNumber}`);
        if (!response.ok) {
          throw new Error('Result not found');
        }
        const data = await response.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };
    if (admissionNumber) fetchResult();
  }, [admissionNumber]);

  const handlePrint = () => {
    window.print();
  };

  // Calculate marks, pass/fail, totals, averages, level, eligibility
  let subjects = result?.subjects?.map((sub: any) => {
    const total = (sub.ce || 0) + (sub.te || 0);
    const subjectResult = getSubjectResult(sub.ce, sub.te);
    return { ...sub, total, result: subjectResult };
  }) || [];
  const totalMarks = subjects.reduce((sum: number, s: any) => sum + s.total, 0);
  const average = subjects.length ? Math.round(totalMarks / subjects.length) : 0;
  const allPassed = subjects.every((s: any) => s.result === "Pass");
  const eligibility = result ? getEligibility(result.class, allPassed) : "-";
  const level = getLevel(average);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100 via-blue-100 to-indigo-100 p-4 md:p-8 print:bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="border-0 shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] overflow-hidden print:shadow-none print:border">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 md:p-8 print:bg-white print:text-black">
            <div className="flex flex-col items-center text-center space-y-4">
              <Award className="w-16 h-16 text-blue-100 print:hidden mb-2" />
              <div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 leading-tight">
                  Islamic Da'wa Academy
                </CardTitle>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-blue-100">
                  Even Semester Examination 2025
                </h2>
                <CardDescription className="text-base sm:text-lg text-blue-100 print:text-gray-600 font-medium">
                  Academic Performance Report - May 2025
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8 print:space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <span className="text-slate-600 font-medium">Fetching your results...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-500">
                <AlertTriangle className="w-12 h-12 mb-4" />
                <span className="font-medium text-lg">{error}</span>
              </div>
            ) : result ? (
              <>
                <div className="grid md:grid-cols-2 gap-6 print:gap-4">
                  {/* Student Info Card */}
                  <div className="bg-white rounded-xl p-6 shadow-lg print:shadow-none print:border">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{result.name}</h3>
                    <div className="space-y-2 text-gray-600">
                      <p>Class: <span className="font-semibold">{result.class}</span></p>
                      <p>Admission No: <span className="font-mono font-semibold">{result.admission_number}</span></p>
                    </div>
                  </div>

                  {/* Performance Summary Card */}
                  <div className="bg-white rounded-xl p-6 shadow-lg print:shadow-none print:border">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Score</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-gray-800">{totalMarks}</span>
                          <Progress value={(totalMarks / (subjects.length * 100)) * 100} className="w-32" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Average</p>
                          <p className="text-lg font-semibold text-gray-800">{average}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Level</p>
                          <p className="text-lg font-semibold text-blue-600">{level}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          eligibility === "Failed" 
                            ? "bg-red-100 text-red-700" 
                            : "bg-green-100 text-green-700"
                        }`}>
                          {eligibility === "Failed" ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                          {eligibility}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Subject</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">CE (30)</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">TE (70)</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Total (100)</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((sub: any, idx: number) => (
                          <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-gray-800 font-medium">{sub.name}</td>
                            <td className="px-6 py-4 text-center">{sub.ce}</td>
                            <td className="px-6 py-4 text-center">{sub.te}</td>
                            <td className="px-6 py-4 text-center font-semibold">{sub.total}</td>
                            <td className="px-6 py-4">
                              <div className={`flex items-center justify-center ${
                                sub.result === "Pass" 
                                  ? "text-green-600" 
                                  : "text-red-600"
                              }`}>
                                {sub.result === "Pass" 
                                  ? <CheckCircle className="w-5 h-5 mr-1" /> 
                                  : <XCircle className="w-5 h-5 mr-1" />}
                                {sub.result}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Print Button */}
                <div className="flex justify-end pt-4 print:hidden">
                  <Button 
                    onClick={handlePrint} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> 
                    Print Result
                  </Button>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 