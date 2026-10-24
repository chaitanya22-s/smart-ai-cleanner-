import React, { useState } from 'react';
import { AuditDecision, AuditFinding, StepPriority } from '../types';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  ShieldAlert,
  Database
} from 'lucide-react';

interface DataExposureViewProps {
  decisions: AuditDecision[];
}

export const DataExposureView: React.FC<DataExposureViewProps> = ({ decisions }) => {
  const [selectedSystem, setSelectedSystem] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [complianceFilter, setComplianceFilter] = useState<'ALL' | 'VIOLATION' | 'COMPLIANT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFinding, setActiveFinding] = useState<AuditFinding | null>(null);

  // Aggregate all findings across all decisions
  const allFindings = decisions.flatMap(d => d.findings);

  // Unique systems for filter
  const uniqueSystems = Array.from(new Set(allFindings.map(f => f.system)));

  const filteredFindings = allFindings.filter(f => {
    const matchesSystem = selectedSystem === 'ALL' || f.system === selectedSystem;
    const matchesSeverity = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
    const matchesCompliance =
      complianceFilter === 'ALL' ||
      (complianceFilter === 'VIOLATION' && !f.isCompliant) ||
      (complianceFilter === 'COMPLIANT' && f.isCompliant);
    const matchesSearch =
      f.recordRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.system.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.customerId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSystem && matchesSeverity && matchesCompliance && matchesSearch;
  });

  const totalViolations = allFindings.filter(f => !f.isCompliant).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Cross-System Data Exposure Inventory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full discovery scan linking customer identifiers to underlying records across 9 connected systems.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
            {totalViolations} Open Violations
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            {allFindings.length - totalViolations} Verified Compliant
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by system, record ref, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
          </div>

          {/* System Filter */}
          <div>
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Systems ({uniqueSystems.length})</option>
              {uniqueSystems.map(sys => (
                <option key={sys} value={sys}>{sys}</option>
              ))}
            </select>
          </div>

          {/* Severity & Compliance Filters */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
              <option value="LOW">Low Only</option>
            </select>

            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value as any)}
              className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All States</option>
              <option value="VIOLATION">Violations Only</option>
              <option value="COMPLIANT">Compliant Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exposure Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">System</th>
                <th className="py-2.5 px-4 font-mono">Record Reference</th>
                <th className="py-2.5 px-4">Data Category</th>
                <th className="py-2.5 px-4">Severity</th>
                <th className="py-2.5 px-4">Observed Treatment</th>
                <th className="py-2.5 px-4 font-mono">Evidence Ref</th>
                <th className="py-2.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No exposure records found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredFindings.map(f => {
                  return (
                    <tr
                      key={f.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {f.customerId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {f.system}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {f.recordRef}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {f.category}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          f.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          f.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                          f.severity === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {f.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {f.isCompliant ? (
                          <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Compliant</span>
                          </span>
                        ) : (
                          <span className="text-rose-700 font-medium inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Prohibited PII</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {f.evidenceRef}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setActiveFinding(f)}
                          className="font-semibold text-slate-800 hover:text-slate-950 hover:underline"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finding Inspector Modal / Drawer */}
      {activeFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Exposure Finding Details
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    activeFinding.isCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {activeFinding.isCompliant ? 'COMPLIANT' : 'VIOLATION'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeFinding.system} · {activeFinding.category}
                </h3>
              </div>
              <button
                onClick={() => setActiveFinding(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium">Record Identifier Reference</div>
                <div className="font-mono font-bold text-slate-900">{activeFinding.recordRef}</div>
                <div className="text-[11px] text-slate-500">Source: {activeFinding.sourceFile} ({activeFinding.evidenceRef})</div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-800">Mandatory Policy Requirement</div>
                <div className="p-2.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px]">
                  {activeFinding.policyRequirement}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-800">Observed State in Evidence</div>
                <div className="p-2.5 bg-rose-50 text-rose-900 rounded font-mono text-[11px]">
                  {activeFinding.observedState}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-800">Auditor Finding Details</div>
                <p className="text-slate-700 leading-relaxed bg-white border border-slate-200 p-2.5 rounded">
                  {activeFinding.details}
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setActiveFinding(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
