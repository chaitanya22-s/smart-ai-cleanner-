import React from 'react';
import { Search, Shield, ShieldCheck, Lock, ExternalLink } from 'lucide-react';

interface CustomerHeaderProps {
  onOpenCheckStatus: () => void;
  onSwitchToAdmin: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  onOpenCheckStatus,
  onSwitchToAdmin
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            SC
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-tight">
              Smart AI Cleaner
            </span>
            <span className="text-[11px] text-slate-500 font-medium leading-tight">
              Customer Deletion Tracker · by Chaitanya
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Prominent Check Status CTA */}
          <button
            onClick={onOpenCheckStatus}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-xs whitespace-nowrap"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Check My Deletion Status</span>
          </button>

          {/* Separate Admin Console Switcher */}
          <button
            onClick={onSwitchToAdmin}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            title="Access Compliance & Audit Console (Authorized Staff)"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Admin Console</span>
          </button>
        </div>
      </div>
    </header>
  );
};
