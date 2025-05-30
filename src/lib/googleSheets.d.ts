export interface MarkData {
  studentName: string;
  admissionNumber: string;
  class: string;
  subject: string;
  ce: number;
  te: number;
  total: number;
  result: 'Pass' | 'Fail';
  submittedAt: string;
}

export function appendToSheet(data: MarkData): Promise<any>;
export function setupSheet(): Promise<boolean>; 