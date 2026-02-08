'use client';

import { useRef, useEffect } from 'react';
import { Terminal, Activity } from 'lucide-react';
import { LogEntry } from '@/lib/types';

interface SystemMonitorProps {
  logs: LogEntry[];
  isMocked: boolean;
}

export default function SystemMonitor({ logs, isMocked }: SystemMonitorProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-black/60 to-black/40 border-2 border-white/10 rounded-2xl backdrop-blur-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            Network Status
          </h3>
          <div className={`px-3 py-1 ${
            isMocked ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-400/30' : 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400/30'
          } text-[10px] font-black rounded-full uppercase tracking-wider`}>
            {isMocked ? 'Simulation' : 'Connected'}
          </div>
        </div>
        
        <div className="space-y-4">
          {[
            { label: 'Midnight Network', status: isMocked ? 'Simulated' : 'Active', color: isMocked ? 'bg-amber-500' : 'bg-emerald-500' },
            { label: 'ZK Proof System', status: 'Ready', color: 'bg-orange-500' },
            { label: 'Identity Ledger', status: isMocked ? 'LocalStorage' : 'Synced', color: isMocked ? 'bg-amber-500' : 'bg-emerald-500' },
            { label: 'Privacy Layer', status: 'Encrypted', color: 'bg-purple-500' },
          ].map((item) => (
            <div key={item.label} className="group">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/60 group-hover:text-white/90 transition-all font-medium">{item.label}</span>
                <span className="text-[10px] uppercase font-black text-white/30 group-hover:text-white/60 transition-all">{item.status}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} w-full transition-all shadow-lg`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col bg-black/80 border-2 border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm min-h-[400px]">
        <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b-2 border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white/60">System Console</span>
          </div>
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
          </div>
        </div>
        
        <div className="p-5 space-y-3 overflow-y-auto flex-1 font-mono text-[11px] leading-relaxed custom-scrollbar">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-white/10 py-16">
              <Terminal className="w-10 h-10" />
              <span className="text-[11px] uppercase tracking-widest font-bold">Awaiting Operations...</span>
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-4 group hover:bg-white/5 -mx-2 px-2 py-1 rounded transition-all">
                <span className="text-orange-400/30 select-none font-bold">#{i.toString().padStart(3, '0')}</span>
                <span className="text-white/70 break-all group-hover:text-orange-400/90 transition-all flex-1">
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
