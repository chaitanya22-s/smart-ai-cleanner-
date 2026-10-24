import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  FileCheck2,
  Fingerprint,
  Layers,
  Repeat,
  Wrench,
  Award,
  Database,
  History,
  ShieldCheck,
  Settings,
  ShieldAlert
} from 'lucide-react';

export type NavSection =
  | 'overview'
  | 'new-audit'
  | 'requests'
  | 'identity'
  | 'exposure'
  | 'resurrection'
  | 'remediation'
  | 'proof'
  | 'evidence'
  | 'history'
  | 'rules'
  | 'settings';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  openCriticalCount: number;
  resurrectionCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  openCriticalCount,
  resurrectionCount
}) => {
  const navItems: { id: NavSection; label: string; icon: React.ElementType; badge?: number; alert?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'new-audit', label: 'New Audit', icon: UploadCloud },
    { id: 'requests', label: 'Deletion Requests', icon: FileCheck2 },
    { id: 'identity', label: 'Identity Explorer', icon: Fingerprint },
    { id: 'exposure', label: 'Data Exposure', icon: Layers, badge: openCriticalCount, alert: openCriticalCount > 0 },
    { id: 'resurrection', label: 'Resurrection Risks', icon: Repeat, badge: resurrectionCount, alert: resurrectionCount > 0 },
    { id: 'remediation', label: 'Remediation Center', icon: Wrench },
    { id: 'proof', label: 'Proof of Deletion', icon: Award },
    { id: 'evidence', label: 'Evidence Explorer', icon: Database },
    { id: 'history', label: 'Audit History', icon: History },
    { id: 'rules', label: 'Policy Rules', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          SC
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-white tracking-tight leading-tight truncate">
            Smart AI Cleaner
          </span>
          <span className="text-[11px] text-slate-400 font-medium leading-tight truncate">
            by Chaitanya
          </span>
        </div>
      </div>

      {/* Mode Tag */}
      <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-medium">Audit Mode</span>
        <span className="text-emerald-400 font-semibold tracking-wide">EVIDENCE VERIFIED</span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors text-left ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded font-semibold ${
                    item.alert ? 'bg-rose-950 text-rose-300 border border-rose-800/60' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Incident Case Banner in Sidebar */}
      <div className="p-3 mx-3 mb-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px] space-y-1.5">
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>$2.4M Incident Baseline</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Sarah Jenkins case (CUST-84920). Dashboard showed complete, but sync job re-seeded deleted email.
        </p>
      </div>

      {/* User Auditor Footer */}
      <div className="p-3 border-t border-slate-800 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-semibold text-white">
          C
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-white truncate">Chaitanya</span>
          <span className="text-[10px] text-slate-400 truncate">Lead Privacy Auditor</span>
        </div>
      </div>
    </aside>
  );
};
