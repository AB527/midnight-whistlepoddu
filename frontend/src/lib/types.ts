export type Mode = 'verify' | 'chat';
export type VerificationStep = 'upload' | 'extract' | 'commit' | 'success';

export interface CompanyData {
  companyName: string;
  employeeId: string;
  department: string;
  issueDate: string;
}

export interface Review {
  id: string;
  company: string;
  content: string;
  timestamp: Date;
  userHash: string;
  category: 'culture' | 'management' | 'compensation' | 'worklife' | 'other';
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface LogEntry {
  timestamp: Date;
  message: string;
}

export interface VerificationState {
  isVerified: boolean;
  userHash: string;
  companyData: CompanyData;
  timestamp: number;
}
