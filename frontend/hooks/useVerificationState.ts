'use client';

import { useState, useEffect } from 'react';
import { VerificationState, CompanyData } from '@/lib/types';

const VERIFICATION_KEY = 'whistle_poddu_verification';

export function useVerificationState() {
  const [verificationState, setVerificationState] = useState<VerificationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load verification state from localStorage on mount
    const stored = localStorage.getItem(VERIFICATION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as VerificationState;
        // Check if verification is still valid (within 30 days)
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const isValid = Date.now() - parsed.timestamp < thirtyDaysInMs;
        
        if (isValid) {
          setVerificationState(parsed);
        } else {
          // Clear expired verification
          localStorage.removeItem(VERIFICATION_KEY);
        }
      } catch (error) {
        console.error('Failed to parse verification state:', error);
        localStorage.removeItem(VERIFICATION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const saveVerification = (userHash: string, companyData: CompanyData) => {
    const state: VerificationState = {
      isVerified: true,
      userHash,
      companyData,
      timestamp: Date.now(),
    };
    localStorage.setItem(VERIFICATION_KEY, JSON.stringify(state));
    setVerificationState(state);
  };

  const clearVerification = () => {
    localStorage.removeItem(VERIFICATION_KEY);
    setVerificationState(null);
  };

  return {
    verificationState,
    isLoading,
    saveVerification,
    clearVerification,
  };
}
