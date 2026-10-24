import React from 'react';
import { AuditDecision, DatasetPackage } from '../types';
import { AuditStatusBadge } from '../components/AuditStatusBadge';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  Repeat,
  Layers,
  FileText,
  ArrowRight,
  Database,
  Lock
} from 'lucide-react';
import { NavSection } from '../components/Sidebar';

interface OverviewViewProps {
  decisions: AuditDecision[];
  dataset: DatasetPackage;
  onNavigate: (section: NavSection) => void;
  onSelectRequest: (requestId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  decisions,
  dataset,
  onNavigate,
  onSelectRequest
}) => {
  const totalRequests = decisions.length;
  const completeCases = decisions.filter(d => d.status === 'COMPLETE');
  const incompleteCases = decisions.filter(d => d.status === 'INCOMPLETE');
  const notApplicableCases = decisions.filter(d => d.status === 'NOT_APPLICABLE');

  const totalCriticalFindings = decisions.reduce(
    (acc, d) => acc + d.findings.filter(f => !f.isCompliant && f.severity === 'CRITICAL').length,
    0
  );

  const totalResurrectionRisks = decisions.reduce(
    (acc, d) => acc + d.resurrectionRisks.length,
    0
  );

  // Group findings by system
  const systemCounts: Record<string, { total: number; nonCompliant: number }> = {};
  decisions.forEach(d => {
    d.findings.forEach(f => {
      if (!systemCounts[f.system]) {
        systemCounts[f.system] = { total: 0, nonCompliant: 0 };
      }
      systemCounts[f.system].total++;
      if (!f.isCompliant) {
        systemCounts[f.system].nonCompliant++;
      }
    });
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Incident Context Banner ($2.4M Loss Case Study) */}
      <div className="bg-white border border-rose-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-rose-50 rounded-md text-rose-700 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Case Study: Northstar Shop $2.4M Deletion Failure & Resurrection Breach
              </h2>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Regulatory Enforcement Assessment
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Northstar Shop suffered a $2.4 million regulatory loss after a customer erasure request (<span className="font-mono font-medium text-slate-800">CUST-84920</span> / Sarah Jenkins) was falsely flagged as <span className="font-semibold text-slate-800">COMPLETE</span> on an internal dashboard. While records were wiped from the UI, direct personal data persisted in the CRM, search caches, and cold exports. A nightly CDC sync job (<span className="font-mono font-medium text-slate-800">JOB-SYNC-9921</span>) later resurrected the account, blocking new registration with a 409 Conflict. This agent independently verifies raw evidence to guarantee true erasure and stop resurrection.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs">
              <button
                onClick={() => onSelectRequest('DEL-REQ-2024-0891')}
                className="inline-flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-800 hover:underline"
              >
                <span>Investigate Case DEL-REQ-2024-0891</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => onNavigate('resurrection')}
                className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 hover:underline"
              >
                <span>Inspect Pipeline Resurrection Loop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Analyzed Requests
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalRequests}
            </span>
            <span className="text-xs text-slate-500 font-medium">100% evaluated</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across {dataset.metadata.fileCount} enterprise dataset files
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Verified Complete
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {completeCases.length}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              {totalRequests > 0 ? Math.round((completeCases.length / totalRequests) * 100) : 0}% passing
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            All copies deleted, tombstones compliant
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Incomplete Cases
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
              {incompleteCases.length}
            </span>
            <span className="text-xs text-rose-600 font-semibold">
              {totalCriticalFindings} critical violations
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Requires ordered remediation
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Resurrection Hazards
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {totalResurrectionRisks}
            </span>
            <span className="text-xs text-amber-600 font-semibold">
              Active pipelines
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Sync, Kafka & restore hazards
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Requests Status Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Deletion Requests Audit Roster
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic policy verification verdict for each submitted subject request.
              </p>
            </div>
            <button
              onClick={() => onNavigate('requests')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Request ID</th>
                  <th className="py-2.5 px-4">Customer Reference</th>
                  <th className="py-2.5 px-4">Verdict</th>
                  <th className="py-2.5 px-4 font-mono">Score</th>
                  <th className="py-2.5 px-4">Violations</th>
                  <th className="py-2.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {decisions.map(dec => {
                  const nonCompliant = dec.findings.filter(f => !f.isCompliant).length;
                  return (
                    <tr key={dec.requestId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {dec.requestId}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {dec.customerId}
                      </td>
                      <td className="py-3 px-4">
                        <AuditStatusBadge status={dec.status} />
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-800">
                        {dec.score.scorePercentage}%
                      </td>
                      <td className="py-3 px-4">
                        {nonCompliant > 0 ? (
                          <span className="font-semibold text-rose-700 font-mono tabular-nums">
                            {nonCompliant} findings
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectRequest(dec.requestId)}
                          className="font-semibold text-slate-800 hover:text-slate-950 hover:underline"
                        >
                          Deep Dive
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: System Coverage & Risk Distribution */}
        <div className="space-y-6">
          {/* Systems Coverage */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Cross-System Coverage & Violations
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Inspection depth across enterprise data stores and streaming infrastructure.
            </p>

            <div className="mt-4 space-y-3">
              {Object.entries(systemCounts).map(([system, data]) => {
                const hasViolation = data.nonCompliant > 0;
                return (
                  <div key={system} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate">{system}</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {hasViolation ? (
                          <span className="font-semibold text-rose-700">{data.nonCompliant} violations</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Compliant</span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${hasViolation ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, Math.max(15, (data.total / 8) * 100))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Decision Engine Guarantee */}
          <div className="bg-slate-900 text-slate-300 rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Deterministic Policy Invariants</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Northstar Shop's decision engine never grants <span className="text-white font-semibold">COMPLETE</span> status based on UI claims or high percentage scores. Even a 99% score evaluates to <span className="text-rose-400 font-semibold">INCOMPLETE</span> if a single mandatory rule fails or a sync pipeline can re-seed personal data.
            </p>
            <div className="pt-1 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
              <span>Authoritative Source:</span>
              <span className="font-mono text-emerald-400">deletion_rules.csv</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
