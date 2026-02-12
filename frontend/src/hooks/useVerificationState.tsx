import { useState, useEffect } from 'react';
import { VerificationState, CompanyData } from '../lib/types';

const STORAGE_KEY = 'whistle_verification_state';

export function useVerificationState() {
  const [verificationState, setVerificationState] = useState<VerificationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load verification state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: VerificationState = JSON.parse(stored);
        // Verify the state is valid
        if (parsed.isVerified && parsed.userHash && parsed.companyData) {
          setVerificationState(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load verification state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save verification state to localStorage
  const saveVerification = (userHash: string, companyData: CompanyData) => {
    const newState: VerificationState = {
      isVerified: true,
      userHash,
      companyData,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setVerificationState(newState);
    } catch (error) {
      console.error('Failed to save verification state:', error);
    }
  };

  // Clear verification state
  const clearVerification = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setVerificationState(null);
    } catch (error) {
      console.error('Failed to clear verification state:', error);
    }
  };

  return {
    verificationState,
    isLoading,
    saveVerification,
    clearVerification
  };
}