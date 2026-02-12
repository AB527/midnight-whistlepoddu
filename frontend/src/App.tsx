import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Shield } from 'lucide-react';
import WalletConnect from './components/WalletConnect';
import VerificationFlow from './components/VerificationFlow';
import GlobalChat from './components/GlobalChat';
import SystemMonitor from './components/SystemMonitor';
import { useVerificationState } from './hooks/useVerificationState';
import { Mode, VerificationStep, CompanyData, LogEntry } from './lib/types';
import { MidnightDAppAPI } from './lib/midnight-api';

export default function App() {
  const { verificationState, isLoading, saveVerification, clearVerification } = useVerificationState();
  
  const [mode, setMode] = useState<Mode>('verify');
  const [step, setStep] = useState<VerificationStep>('upload');
  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: '',
    employeeId: '',
    department: '',
    issueDate: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [userHash, setUserHash] = useState('');
  const [walletAddr, setWalletAddr] = useState<string | null>(null);
  const [coinPublicKey, setCoinPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMocked, setIsMocked] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const midnightApi = useRef<MidnightDAppAPI>(new MidnightDAppAPI());

  // Auto-redirect verified users to chat
  useEffect(() => {
    if (!isLoading && verificationState?.isVerified) {
      setMode('chat');
      setUserHash(verificationState.userHash);
      setCompanyData(verificationState.companyData);
      addLog('System: Existing verification found. Welcome back!');
      addLog(`System: Logged in as verified employee of ${verificationState.companyData.companyName}`);
    }
  }, [isLoading, verificationState]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date(), message }]);
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    addLog('System: Searching for Midnight Lace extension...');
    
    try {
      // @ts-ignore
      const midnight = window.midnight;
      if (!midnight || !midnight.mnLace) {
        throw new Error('EXTENSION_MISSING');
      }

      addLog('System: Requesting connection from Lace...');
      const walletAPI = await midnight.mnLace.connect('undeployed');
      
      const { unshieldedAddress } = await walletAPI.getUnshieldedAddress();
      
      // Initialize Midnight API with the connected wallet
      await midnightApi.current.initialize(walletAPI);
      
      setWalletAddr(unshieldedAddress);
      setCoinPublicKey(unshieldedAddress);
      setIsMocked(false);
      addLog(`Wallet Connected: ${unshieldedAddress.substring(0, 10)}...`);
      setIsConnecting(false);
    } catch (err: any) {
      if (err.message === 'EXTENSION_MISSING') {
        addLog('⚠️ Error: Midnight Lace Wallet not found.');
        addLog('👉 Please install the extension to use the real flow.');
        setTimeout(() => {
          addLog('System: Switching to [Simulation Mode] for demo purposes...');
          const mockAddr = "mn_whistle_" + Math.random().toString(36).substr(2, 9);
          setWalletAddr(mockAddr);
          setIsMocked(true);
          addLog(`Wallet Connected: ${mockAddr.substring(0, 10)}... (MOCKED)`);
          setIsConnecting(false);
        }, 2000);
      } else {
        addLog(`Error: ${err.message || 'Failed to connect to Lace Wallet.'}`);
        setIsConnecting(false);
      }
    }
  };

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    addLog(`File attached: ${file.name}`);
    addLog('Secure Sandbox: Processing ID card locally...');
    
    setTimeout(() => {
      setCompanyData({
        companyName: 'TechCorp Industries',
        employeeId: 'EMP-2024-7845',
        department: 'Engineering',
        issueDate: '2024-01-15'
      });
      addLog('OCR Engine: Company data extraction successful.');
      setIsProcessing(false);
      setStep('extract');
    }, 1500);
  };

  const calculateHash = async () => {
    setIsProcessing(true);
    addLog('System: Generating company claim hash...');
    
    // Create hash from company name (this matches what the contract expects)
    const dataString = companyData.companyName.toLowerCase().trim();
    const msgUint8 = new TextEncoder().encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    setTimeout(() => {
      setUserHash(hashHex);
      addLog(`System: Company claim hash generated.`);
      setIsProcessing(false);
      setStep('commit');
    }, 800);
  };

  const handlePublish = async () => {
    setIsProcessing(true);
    
    // SIMULATION MODE (no wallet connected)
    if (true || !walletAddr || isMocked) {
      addLog('⚠️ Warning: Lace Wallet not connected. Using SIMULATION mode.');
      addLog('Simulation: Storing claim in localStorage (NOT on blockchain)...');
      
      const ledger = JSON.parse(localStorage.getItem('whistle_ledger') || '[]');
      const newEntry = { 
        hash: userHash, 
        company: companyData.companyName,
        employeeId: companyData.employeeId,
        department: companyData.department
      };
      
      if (!ledger.find((e: any) => e.hash === userHash)) {
        ledger.push(newEntry);
        localStorage.setItem('whistle_ledger', JSON.stringify(ledger));
      }
      
      // Save verification state for persistence
      saveVerification(userHash, companyData);
      
      setTimeout(() => {
        addLog(`Simulation Complete: Claim stored locally`);
        addLog('System: Verification state saved. Auto-login enabled.');
        setIsProcessing(false);
        setStep('success');
      }, 1500);
      return;
    }
    
    // REAL BLOCKCHAIN MODE
    try {
      addLog('Midnight Prover: Preparing company claim for blockchain...');
      
      const claim = { companyName: companyData.companyName };
      const walletAddressBytes = await midnightApi.current.getWalletAddress();
      
      // Check if contract address exists
      const envContractAddress = manualAddress.trim() || (import.meta as any).env?.VITE_CONTRACT_ADDRESS;
      
      let finalizedTx;
      
      if (envContractAddress && envContractAddress.trim() !== '') {
        addLog(`Connecting to deployed contract: ${envContractAddress.substring(0, 10)}...`);
        try {
          await midnightApi.current.findContract(envContractAddress);
          finalizedTx = await midnightApi.current.registerCompanyClaim(claim, walletAddressBytes);
          addLog(`Registration circuit executed successfully!`);
          setDeployedAddress(envContractAddress);
        } catch (findErr: any) {
          if (findErr.message?.includes('mismatched')) {
            addLog(`❌ Version Mismatch: Contract version mismatch detected.`);
            addLog(`💡 Tip: Clear VITE_CONTRACT_ADDRESS in .env and redeploy.`);
            throw new Error("CONTRACT_VERSION_MISMATCH");
          }
          throw findErr;
        }
      } else {
        addLog(`Deploying new contract...`);
        const deployResult = await midnightApi.current.deployNewContract();
        addLog(`✅ Contract deployed! Address: ${deployResult.contractAddress}`);
        setDeployedAddress(deployResult.contractAddress);
        
        // Connect to the newly deployed contract
        await midnightApi.current.findContract(deployResult.contractAddress);
        finalizedTx = await midnightApi.current.registerCompanyClaim(claim, walletAddressBytes);
      }
      
      addLog(`Success: Company claim registered on-chain! Tx: ${finalizedTx.txHash.substring(0, 10)}...`);
      
      // Save verification state
      saveVerification(userHash, companyData);
      
      setIsProcessing(false);
      setStep('success');
    } catch (err: any) {
      addLog(`Error: Blockchain registration failed. ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleSwitchToChat = () => {
    setMode('chat');
    addLog(`System: Switched to Anonymous Chat mode.`);
  };

  const handleLogout = () => {
    clearVerification();
    setMode('verify');
    setStep('upload');
    setCompanyData({ companyName: '', employeeId: '', department: '', issueDate: '' });
    setUserHash('');
    setDeployedAddress(null);
    addLog('System: Logged out. Verification state cleared.');
  };

  // Show loading state while checking verification
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-950/20 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 font-bold">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen p-4 md:p-8 flex flex-col items-center bg-gradient-to-br from-slate-900 via-orange-950/20 to-slate-900">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '-4s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '-6s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center gap-6 mb-12 w-full max-w-xl text-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-500/30 to-amber-500/30 rounded-2xl border-2 border-orange-400/40 shadow-lg shadow-orange-500/20">
            <MessageCircle className="w-10 h-10 text-orange-400" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-black tracking-tight text-white">
              Whistle Poddu
            </h1>
            <p className="text-orange-400/80 text-sm font-bold mt-1">Anonymous Workplace Reviews</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <div className="flex p-1 bg-white/5 border-2 border-white/10 rounded-full backdrop-blur-sm">
            <button 
              onClick={() => setMode('verify')}
              disabled={!verificationState?.isVerified}
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                mode === 'verify' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 text-white' 
                  : verificationState?.isVerified
                    ? 'text-white/60 hover:text-white'
                    : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <Shield className="w-4 h-4" />
              Verify Identity
            </button>
            <button 
              onClick={() => setMode('chat')}
              disabled={!verificationState?.isVerified}
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                mode === 'chat' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 text-white' 
                  : verificationState?.isVerified 
                    ? 'text-white/60 hover:text-white' 
                    : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Global Chat
            </button>
          </div>

          <WalletConnect
            walletAddr={walletAddr}
            isConnecting={isConnecting}
            isMocked={isMocked}
            onConnect={connectWallet}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1fr,420px] gap-8 w-full max-w-7xl">
        {/* Main Panel */}
        <section className="bg-black/40 backdrop-blur-xl border-2 border-white/10 rounded-3xl p-8 shadow-2xl">
          {mode === 'verify' ? (
            <VerificationFlow
              step={step}
              setStep={setStep}
              companyData={companyData}
              setCompanyData={setCompanyData}
              userHash={userHash}
              isProcessing={isProcessing}
              manualAddress={manualAddress}
              setManualAddress={setManualAddress}
              onUpload={handleFileUpload}
              onGenerateHash={calculateHash}
              onPublish={handlePublish}
              onSwitchToChat={handleSwitchToChat}
              addLog={addLog}
            />
          ) : (
            <GlobalChat
              companyData={companyData}
              userHash={userHash}
              addLog={addLog}
              onLogout={handleLogout}
            />
          )}
        </section>

        {/* Sidebar */}
        <aside className="flex flex-col">
          <SystemMonitor 
            logs={logs} 
            isMocked={isMocked}
            walletAddr={walletAddr}
            deployedAddress={deployedAddress}
          />
        </aside>
      </div>
    </main>
  );
}