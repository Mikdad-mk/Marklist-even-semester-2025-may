'use client';

import { useState } from 'react';

interface Mark {
  subject: string;
  ce: number;
  te: number;
  total: number;
  result: 'Pass' | 'Fail';
}

interface StudentResult {
  admissionNumber: string;
  name: string;
  class: string;
  marks: Mark[];
  totalMarks: number;
  average: number;
  overallResult: 'Eligible for Higher Study' | 'All Pass' | 'Failed';
  level: 'Excellency' | 'Very Good' | 'Good' | 'Average' | 'Below Average';
}

export default function ResultPage() {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [result, setResult] = useState<StudentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/result/${admissionNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch result');
      }
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError('Failed to fetch result. Please check the admission number.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Islamic Da'wa Academy
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Even Semester 2024–25 May Result
          </p>
        </div>

        {/* Result Search Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admission-number"
                className="block text-sm font-medium text-gray-700"
              >
                Enter Admission Number
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="admission-number"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your admission number"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'View Result'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-8">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="bg-white shadow rounded-lg p-6 print:shadow-none">
            {/* Student Info */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Admission Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {result.admissionNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{result.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Class</dt>
                  <dd className="mt-1 text-sm text-gray-900">{result.class}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.overallResult === 'Failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {result.overallResult}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Marks Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CE (30)
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TE (70)
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total (100)
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.marks.map((mark, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mark.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mark.ce}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mark.te}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mark.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            mark.result === 'Pass'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {mark.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Total Marks
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {result.totalMarks}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Average</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {result.average.toFixed(2)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Level</dt>
                  <dd className="mt-1 text-sm text-gray-900">{result.level}</dd>
                </div>
              </dl>
            </div>

            {/* Print Button */}
            <div className="mt-6 print:hidden">
              <button
                onClick={handlePrint}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Print Result
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 