'use client';

import { useState, ChangeEvent } from 'react';
import { 
  Upload, 
  Building2, 
  Fingerprint, 
  CheckCircle2, 
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import { VerificationStep, CompanyData } from '../lib/types';

interface VerificationFlowProps {
  step: VerificationStep;
  setStep: (step: VerificationStep) => void;
  companyData: CompanyData;
  setCompanyData: (data: CompanyData) => void;
  userHash: string;
  isProcessing: boolean;
  manualAddress: string;
  setManualAddress: (addr: string) => void;
  onUpload: (file: File) => void;
  onGenerateHash: () => void;
  onPublish: () => void;
  onSwitchToChat: () => void;
  addLog: (message: string) => void;
}

export default function VerificationFlow({
  step,
  companyData,
  setCompanyData,
  userHash,
  isProcessing,
  onUpload,
  onGenerateHash,
  onPublish,
  onSwitchToChat,
  addLog
}: VerificationFlowProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userHash);
    setHasCopied(true);
    addLog('System: Hash copied to clipboard.');
    setTimeout(() => setHasCopied(false), 2000);
  };

  const steps = [
    { id: 'upload' as const, icon: Upload, label: 'Upload' },
    { id: 'extract' as const, icon: Building2, label: 'Extract' },
    { id: 'commit' as const, icon: Fingerprint, label: 'Commit' },
    { id: 'success' as const, icon: CheckCircle2, label: 'Complete' },
  ];

  return (
    <>
      <div className="flex justify-between items-center px-4 mb-8">
        {steps.map((s, idx) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className={`flex flex-col items-center gap-2 transition-all ${
              step === s.id ? 'text-orange-400' : 'text-white/20'
            }`}>
              <div className={`p-3 rounded-full border-2 transition-all ${
                step === s.id 
                  ? 'border-orange-400 bg-orange-400/20 shadow-lg shadow-orange-400/30' 
                  : 'border-current bg-transparent'
              }`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">{s.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-3 transition-all ${
                steps.findIndex(st => st.id === step) > idx ? 'bg-orange-400/50' : 'bg-white/10'
              }`} />
            )}
          </div>
        ))}
      </div>

      {step === 'upload' && (
        <div className="flex flex-col items-center text-center gap-8 py-12 animate-in">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">Verify Your Employment</h2>
            <p className="text-white/60 max-w-md leading-relaxed">
              Upload your company ID card. All data is processed locally and hashed on your device.
            </p>
          </div>
          
          <label className="w-full max-w-lg aspect-[4/3] border-3 border-dashed border-white/20 hover:border-orange-400/60 hover:bg-orange-400/5 rounded-3xl flex flex-col items-center justify-center gap-5 cursor-pointer transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className="w-14 h-14 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-bold animate-pulse text-orange-400">Processing ID Card...</span>
              </div>
            ) : (
              <>
                <div className="p-5 bg-white/5 rounded-2xl group-hover:bg-orange-400/20 transition-all relative z-10">
                  <Upload className="w-10 h-10 text-white/50 group-hover:text-orange-400 transition-all" />
                </div>
                <div className="flex flex-col items-center relative z-10">
                  <span className="font-bold text-white text-lg">Upload Company ID Card</span>
                  <span className="text-xs text-white/40 mt-2">Scanned securely in your browser</span>
                </div>
              </>
            )}
          </label>
        </div>
      )}

      {step === 'extract' && (
        <div className="flex flex-col gap-8 py-6 animate-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Review Extracted Data</h2>
            <p className="text-white/60">Verify your information before generating the cryptographic commitment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Company Name</label>
              <input 
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/50 outline-none text-white transition-all hover:bg-white/10"
                value={companyData.companyName}
                onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Employee ID</label>
              <input 
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/50 outline-none text-white transition-all hover:bg-white/10"
                value={companyData.employeeId}
                onChange={(e) => setCompanyData({...companyData, employeeId: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Department</label>
              <input 
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/50 outline-none text-white transition-all hover:bg-white/10"
                value={companyData.department}
                onChange={(e) => setCompanyData({...companyData, department: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Issue Date</label>
              <input 
                type="date"
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/50 outline-none text-white transition-all hover:bg-white/10"
                value={companyData.issueDate}
                onChange={(e) => setCompanyData({...companyData, issueDate: e.target.value})}
              />
            </div>
          </div>

          <button 
            onClick={onGenerateHash}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold p-5 rounded-xl shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Generate Identity Proof <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 'commit' && (
        <div className="flex flex-col items-center text-center gap-8 py-12 animate-in">
          <div className="w-24 h-24 bg-orange-500/10 rounded-3xl border-2 border-orange-400/30 flex items-center justify-center shadow-lg shadow-orange-400/20">
            <Fingerprint className="w-12 h-12 text-orange-400" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">Your Verification Proof</h2>
            <p className="text-white/60 max-w-md leading-relaxed">
              This cryptographic hash proves your employment without revealing your identity.
            </p>
          </div>

          <div className="relative w-full max-w-lg group">
            <div className="w-full bg-black/50 border-2 border-white/10 p-6 rounded-2xl font-mono text-orange-400 text-sm break-all leading-relaxed pr-20 bg-gradient-to-br from-black/50 to-orange-500/5">
              {userHash}
            </div>
            <button 
              onClick={copyToClipboard}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 border-2 border-white/10 rounded-xl transition-all text-white group-hover:scale-110 active:scale-95"
            >
              {hasCopied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <button 
            onClick={onPublish}
            disabled={isProcessing}
            className="w-full max-w-md bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold p-6 rounded-xl shadow-xl shadow-orange-500/30 disabled:opacity-50 transition-all"
          >
            {isProcessing ? 'Publishing to Ledger...' : 'Anchor to Midnight Network'}
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="flex flex-col items-center text-center gap-10 py-16 animate-in">
          <div className="w-32 h-32 bg-emerald-500/10 border-4 border-emerald-400/40 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(52,211,153,0.3)] animate-pulse">
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight">Verification Complete!</h2>
            <p className="text-white/70 max-w-lg text-lg leading-relaxed">
              Your identity is now anchored on the Midnight Network. You'll automatically access the chat room on your next visit.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onSwitchToChat} 
              className="px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black shadow-xl shadow-orange-500/40 hover:scale-105 transition-all"
            >
              Enter Chat Room
            </button>
          </div>
        </div>
      )}
    </>
  );
}
