import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-[#55443B] text-[#FFF9F5] px-4 py-1.5 text-xs font-medium shadow-lg border border-[#A7AB98]/40 animate-bounce">
      <WifiOff className="w-3.5 h-3.5 text-[#EFD7A8]" />
      <span>Mode Offline — Bunda tetap bisa mencatat belanja, data tersimpan di HP.</span>
    </div>
  );
};
