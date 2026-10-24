import React from 'react';
import { NavSection } from './Sidebar';
import { Play, Download, ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  currentSection: NavSection;
  datasetName: string;
  lastAuditTimestamp: string;
  maskingEnabled: boolean;
  onToggleMasking: () => void;
  onRunAudit: () => void;
  onExportReport: () => void;
  isRunningAudit: boolean;
  onSwitchToCustomerPortal?: () => void;
}

const SECTION_TITLES: Record<NavSection, { title: string; breadcrumb: string }> = {
  'overview': { title: 'Executive Audit Overview', breadcrumb: 'Smart AI Cleaner / Audit Console / Overview' },
  'new-audit': { title: 'Dataset Ingestion & Package Manager', breadcrumb: 'Smart AI Cleaner / Audit Setup / Ingestion' },
  'requests': { title: 'Deletion Requests Directory', breadcrumb: 'Smart AI Cleaner / Compliance / Requests' },
  'identity': { title: 'Customer Identity Resolution Graph', breadcrumb: 'Smart AI Cleaner / Identity / Resolution' },
  'exposure': { title: 'Cross-System Data Exposure Inventory', breadcrumb: 'Smart AI Cleaner / Discovery / Exposure' },
  'resurrection': { title: 'Resurrection & Synchronization Monitor', breadcrumb: 'Smart AI Cleaner / Pipelines / Resurrection' },
  'remediation': { title: 'Ordered Remediation Center', breadcrumb: 'Smart AI Cleaner / Enforcement / Remediation' },
  'proof': { title: 'Cryptographic Proof of Deletion', breadcrumb: 'Smart AI Cleaner / Attestation / Proof' },
  'evidence': { title: 'Raw Evidence Explorer', breadcrumb: 'Smart AI Cleaner / Evidence / Explorer' },
  'history': { title: 'Audit Verification History', breadcrumb: 'Smart AI Cleaner / Audit Runs / History' },
  'rules': { title: 'Deletion Policy & Rules Engine', breadcrumb: 'Smart AI Cleaner / Governance / Rules' },
  'settings': { title: 'Settings & Auditor Credentials', breadcrumb: 'Smart AI Cleaner / System / Settings' },
};

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  datasetName,
  lastAuditTimestamp,
  maskingEnabled,
  onToggleMasking,
  onRunAudit,
  onExportReport,
  isRunningAudit,
  onSwitchToCustomerPortal
}) => {
  const sectionMeta = SECTION_TITLES[currentSection] || { title: 'Audit Platform', breadcrumb: 'Northstar Shop' };

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
      {/* Breadcrumb & Section Name */}
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-slate-500 font-medium tracking-tight truncate">
          {sectionMeta.breadcrumb}
        </span>
        <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">
          {sectionMeta.title}
        </h1>
      </div>

      {/* Meta context and actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Customer Portal Button */}
        {onSwitchToCustomerPortal && (
          <button
            onClick={onSwitchToCustomerPortal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-700" />
            <span>Customer Portal</span>
          </button>
        )}

        {/* Dataset Pill-free label */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-slate-400">Package:</span>
          <span className="font-semibold text-slate-800 max-w-[200px] truncate" title={datasetName}>
            {datasetName}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="font-mono tabular-nums text-[11px] text-slate-500">
            {lastAuditTimestamp ? new Date(lastAuditTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
          </span>
        </div>

        {/* Masking Toggle */}
        <button
          onClick={onToggleMasking}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
          title="Toggle privacy masking of customer emails and phones"
        >
          {maskingEnabled ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
          <span>{maskingEnabled ? 'Masked' : 'Raw PII'}</span>
        </button>

        {/* Export Report Action */}
        <button
          onClick={onExportReport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export Dossier</span>
        </button>

        {/* Run Full Audit Primary Action */}
        <button
          onClick={onRunAudit}
          disabled={isRunningAudit}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shadow-sm"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunningAudit ? 'animate-spin' : ''}`} />
          <span>{isRunningAudit ? 'Auditing...' : 'Run Full Audit'}</span>
        </button>
      </div>
    </header>
  );
};
