"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 print:bg-white">
      <Card className="max-w-2xl w-full border-0 shadow-2xl print:shadow-none print:border print:max-w-full">
        <CardHeader className="text-center pb-4 print:pb-2">
          <CardTitle className="text-2xl text-slate-800 print:text-black">Student Result Sheet</CardTitle>
          <CardDescription className="text-slate-600 print:text-black">
            Admission Number: <span className="font-mono">{admissionNumber}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 print:space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2 print:hidden" />
              <span className="text-slate-600 print:text-black">Loading result...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 font-medium py-8 print:text-black">{error}</div>
          ) : result ? (
            <>
              {/* Student Info */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 print:flex-row print:justify-between print:items-center">
                <div>
                  <div className="text-lg font-semibold text-slate-800 print:text-black">{result.name}</div>
                  <div className="text-slate-700 print:text-black">Class: {result.class}</div>
                  <div className="text-slate-700 print:text-black">Admission No: <span className="font-mono">{result.admission_number}</span></div>
                </div>
                <div className="text-slate-700 print:text-black">
                  <div>Total Marks: <span className="font-bold">{totalMarks}</span></div>
                  <div>Average: <span className="font-bold">{average}</span></div>
                  <div>Level: <span className="font-bold">{level}</span></div>
                  <div>Eligibility: <span className={eligibility === "Failed" ? "font-bold text-red-600 print:text-black" : "font-bold text-emerald-600 print:text-black"}>{eligibility}</span></div>
                </div>
              </div>
              {/* Marks Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-slate-300 print:border-black">
                  <thead>
                    <tr className="bg-slate-100 print:bg-white">
                      <th className="border border-slate-300 px-3 py-2 text-left print:border-black">Subject</th>
                      <th className="border border-slate-300 px-3 py-2 print:border-black">CE (30)</th>
                      <th className="border border-slate-300 px-3 py-2 print:border-black">TE (70)</th>
                      <th className="border border-slate-300 px-3 py-2 print:border-black">Total (100)</th>
                      <th className="border border-slate-300 px-3 py-2 print:border-black">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub: any, idx: number) => (
                      <tr key={idx} className="even:bg-slate-50 print:bg-white">
                        <td className="border border-slate-300 px-3 py-2 print:border-black">{sub.name}</td>
                        <td className="border border-slate-300 px-3 py-2 text-center print:border-black">{sub.ce}</td>
                        <td className="border border-slate-300 px-3 py-2 text-center print:border-black">{sub.te}</td>
                        <td className="border border-slate-300 px-3 py-2 text-center print:border-black">{sub.total}</td>
                        <td className={sub.result === "Pass" ? "border border-slate-300 px-3 py-2 text-center text-emerald-600 font-semibold print:border-black print:text-black" : "border border-slate-300 px-3 py-2 text-center text-red-600 font-semibold print:border-black print:text-black"}>{sub.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Print Button */}
              <div className="flex justify-end pt-4 print:hidden">
                <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print Result
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
} 