'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResultSearch() {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (admissionNumber.trim()) {
      router.push(`/results/${admissionNumber}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Student Result Portal</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="admissionNumber" className="block text-sm font-medium text-gray-700">
              Enter Admission Number
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="admissionNumber"
                name="admissionNumber"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your admission number"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Results
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 