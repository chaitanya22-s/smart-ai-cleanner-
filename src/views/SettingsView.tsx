import React from 'react';
import {
  Settings,
  Shield,
  Bot,
  RotateCcw,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface SettingsViewProps {
  maskingEnabled: boolean;
  onToggleMasking: () => void;
  onResetIncidentDataset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  maskingEnabled,
  onToggleMasking,
  onResetIncidentDataset
}) => {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          System Settings & Auditor Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Auditor credentials, privacy masking defaults, and AI reasoning engine parameters.
        </p>
      </div>

      {/* Auditor Profile Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            C
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Chaitanya
            </h3>
            <p className="text-xs text-slate-500">
              Creator & Lead Privacy Compliance Engineer · Smart AI Cleaner
            </p>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Auditor ID: AUD-PRV-9841 · Smart AI Cleaner
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Masking Safeguards */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Privacy Safeguards & Identity Masking
        </h3>

        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
          <div className="space-y-0.5 max-w-lg">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              {maskingEnabled ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4 text-amber-600" />}
              <span>Mask Direct Identifiers by Default</span>
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When enabled, customer emails, telephone numbers, and residential addresses are pseudonymized across the UI and reports to prevent secondary data exposure during audit workflows.
            </p>
          </div>
          <button
            onClick={onToggleMasking}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              maskingEnabled ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {maskingEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Customer Portal Configuration (Configurable Time Window) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Customer Portal Feed Configuration
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200 gap-3">
          <div className="space-y-0.5 max-w-lg">
            <span className="text-xs font-bold text-slate-900">
              "Recently Deleted" Time Window
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Configures the chronological window for public recent deletion records shown to customers on the homepage.
            </p>
          </div>
          <select
            defaultValue="90"
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded focus:outline-none cursor-pointer"
          >
            <option value="30">Last 30 Days</option>
            <option value="60">Last 60 Days</option>
            <option value="90">Last 90 Days (Default)</option>
            <option value="180">Last 180 Days</option>
            <option value="365">Last 365 Days</option>
          </select>
        </div>
      </div>

      {/* Gemini AI Engine Configuration */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Server-Side Gemini AI Reasoning Engine
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
            Active · gemini-3.8-flash
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Gemini assists with technical root-cause explanations of sync resurrection loops, complex cross-system identity relationships, and automated drafting of safe SQL/API remediation procedures. In compliance with strict audit requirements, all final status verdicts remain 100% deterministic and bound to <span className="font-mono text-slate-800">deletion_rules.csv</span>.
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px] font-mono">Architecture</span>
            <span className="font-semibold text-slate-800">Server-Side Express Proxy</span>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px] font-mono">Telemetry</span>
            <span className="font-semibold text-slate-800">User-Agent: aistudio-build</span>
          </div>
        </div>
      </div>

      {/* Reset Benchmark */}
      <div className="bg-white border border-rose-200 rounded-lg p-5 shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-900">
            Reset to $2.4M Incident Baseline
          </h4>
          <p className="text-[11px] text-slate-500">
            Restores the exact 19-file breach state featuring the Sarah Jenkins deletion failure.
          </p>
        </div>
        <button
          onClick={onResetIncidentDataset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Dataset</span>
        </button>
      </div>
    </div>
  );
};
