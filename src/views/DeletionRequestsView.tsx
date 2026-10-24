import React, { useState } from 'react';
import { AuditDecision, AuditDecisionStatus } from '../types';
import { AuditStatusBadge } from '../components/AuditStatusBadge';
import { maskEmail } from '../utils/csvParser';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  FileCheck2,
  Bot,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { NavSection } from '../components/Sidebar';

interface DeletionRequestsViewProps {
  decisions: AuditDecision[];
  selectedRequestId: string | null;
  onSelectRequest: (requestId: string | null) => void;
  maskingEnabled: boolean;
  onNavigate: (section: NavSection) => void;
}

export const DeletionRequestsView: React.FC<DeletionRequestsViewProps> = ({
  decisions,
  selectedRequestId,
  onSelectRequest,
  maskingEnabled,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AuditDecisionStatus>('ALL');

  // AI Investigation State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  const filteredDecisions = decisions.filter(d => {
    const matchesSearch =
      d.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customerId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeDecision = decisions.find(d => d.requestId === selectedRequestId) || null;

  const handleRunAiInvestigation = async () => {
    if (!activeDecision) return;
    setIsAiLoading(true);
    setAiAnalysisResult(null);

    try {
      const res = await fetch('/api/audit/gemini-investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: activeDecision.requestId,
          customerData: {
            customerId: activeDecision.customerId,
            identityLinks: activeDecision.identityGraph
          },
          openFindings: activeDecision.findings.filter(f => !f.isCompliant),
          resurrectionRisks: activeDecision.resurrectionRisks,
          policyContext: {
            status: activeDecision.status,
            score: activeDecision.score
          }
        })
      });

      const data = await res.json();
      setAiAnalysisResult(data.analysis || 'Analysis complete.');
    } catch (err: any) {
      setAiAnalysisResult(`Investigation error: ${err.message || 'Server request failed'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Request ID (DEL-REQ-...) or Customer ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800"
          />
        </div>

        {/* Status Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(['ALL', 'COMPLETE', 'INCOMPLETE', 'NOT_APPLICABLE'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'All Requests' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4 font-mono">Request ID</th>
                <th className="py-2.5 px-4">Subject Reference</th>
                <th className="py-2.5 px-4">Audit Status</th>
                <th className="py-2.5 px-4 font-mono">Audit Score</th>
                <th className="py-2.5 px-4">Persistent PII</th>
                <th className="py-2.5 px-4">Resurrection</th>
                <th className="py-2.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredDecisions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No deletion requests match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDecisions.map(dec => {
                  const nonCompliant = dec.findings.filter(f => !f.isCompliant).length;
                  const hasResurrection = dec.resurrectionRisks.length > 0;
                  const isSelected = dec.requestId === selectedRequestId;

                  return (
                    <tr
                      key={dec.requestId}
                      className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-slate-50 border-l-2 border-slate-900' : ''}`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {dec.requestId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-slate-800">{dec.customerId}</span>
                          <span className="text-[11px] text-slate-400">
                            {dec.identityGraph.length > 0
                              ? (maskingEnabled ? dec.identityGraph[0].maskedIdentifierValue : dec.identityGraph[0].rawIdentifierValue)
                              : 'No linked email'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <AuditStatusBadge status={dec.status} />
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-800 font-semibold">
                        {dec.score.scorePercentage}%
                      </td>
                      <td className="py-3 px-4">
                        {nonCompliant > 0 ? (
                          <span className="text-rose-700 font-semibold tabular-nums">
                            {nonCompliant} violations
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {hasResurrection ? (
                          <span className="text-amber-700 font-semibold inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Hazard Detected</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Safe</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectRequest(dec.requestId)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          Audit Details
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

      {/* Selected Request Detail Drawer / Deep-Dive Inspector */}
      {activeDecision && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold text-slate-900">
                  {activeDecision.requestId}
                </span>
                <AuditStatusBadge status={activeDecision.status} />
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  Audit Score: {activeDecision.score.scorePercentage}%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Customer: <span className="font-mono font-semibold text-slate-800">{activeDecision.customerId}</span> · Evaluated on {new Date(activeDecision.auditTimestamp).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunAiInvestigation}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-md transition-colors shadow-xs"
              >
                <Bot className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                <span>{isAiLoading ? 'Analyzing Evidence...' : 'AI Compliance Deep-Dive'}</span>
              </button>

              <button
                onClick={() => onSelectRequest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI Analysis Box (if generated) */}
          {aiAnalysisResult && (
            <div className="bg-slate-900 text-slate-200 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini Lead Privacy Auditor Assessment</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Model: gemini-3.8-flash</span>
              </div>
              <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-300">
                {aiAnalysisResult}
              </div>
            </div>
          )}

          {/* Human Readable Explanation & Supporting Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Auditor Conclusion & Rationale
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded border border-slate-200/80">
                {activeDecision.humanExplanation}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Unresolved Non-Compliance Issues ({activeDecision.unresolvedIssues.length})
              </h4>
              {activeDecision.unresolvedIssues.length === 0 ? (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-3.5 rounded border border-emerald-200 font-medium">
                  Zero unresolved issues. All statutory requirements passed.
                </div>
              ) : (
                <ul className="text-xs text-rose-800 bg-rose-50 p-3.5 rounded border border-rose-200 space-y-1.5 list-disc list-inside">
                  {activeDecision.unresolvedIssues.map((issue, idx) => (
                    <li key={idx} className="leading-snug">{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 6 Category Breakdown Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Six-Pillar Deletion Audit Matrix
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(activeDecision.evaluatedCategories).map(([key, cat]) => {
                const titleMap: Record<string, string> = {
                  requestValidation: '1. Request Validation',
                  identityCoverage: '2. Identity Coverage',
                  dataTreatment: '3. Data Treatment (Zero PII)',
                  processSafety: '4. Process & Sync Safety',
                  retentionCompliance: '5. Retention Compliance',
                  evidenceQuality: '6. Evidence Quality'
                };
                const isPass = cat.status === 'PASS';
                const isNa = cat.status === 'NOT_APPLICABLE';

                return (
                  <div key={key} className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{titleMap[key] || key}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        isPass ? 'text-emerald-700 bg-emerald-100' : (isNa ? 'text-slate-600 bg-slate-200' : 'text-rose-700 bg-rose-100')
                      }`}>
                        {cat.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {cat.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Steps & Action Bar */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {activeDecision.status === 'INCOMPLETE' && (
                <button
                  onClick={() => onNavigate('remediation')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-md transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Review {activeDecision.remediationPlan?.length || 0} Remediation Steps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {activeDecision.status === 'COMPLETE' && (
                <button
                  onClick={() => onNavigate('proof')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors inline-flex items-center gap-1.5"
                >
                  <span>View Proof of Deletion Certificate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => onNavigate('identity')}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Inspect Identity Graph
              </button>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Audit Run ID: {activeDecision.runId}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
