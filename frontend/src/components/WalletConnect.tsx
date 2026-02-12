'use client';

import { Wallet } from 'lucide-react';

interface WalletConnectProps {
  walletAddr: string | null;
  isConnecting: boolean;
  isMocked: boolean;
  onConnect: () => void;
}

export default function WalletConnect({
  walletAddr,
  isConnecting,
  isMocked,
  onConnect
}: WalletConnectProps) {
  return (
    <button 
      onClick={onConnect}
      disabled={!!walletAddr || isConnecting}
      className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border transition-all shadow-lg ${
        walletAddr 
          ? (isMocked 
              ? 'border-amber-500/40 bg-amber-500/15 text-amber-400 shadow-amber-500/20' 
              : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-emerald-500/20'
            ) 
          : 'border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 shadow-white/10'
      }`}
    >
      <Wallet className="w-4 h-4" />
      {isConnecting 
        ? 'Connecting...' 
        : walletAddr 
          ? (isMocked 
              ? `SIM: ${walletAddr.substring(0, 8)}...` 
              : `${walletAddr.substring(0, 8)}...`
            ) 
          : 'Connect Lace'
      }
    </button>
  );
}
