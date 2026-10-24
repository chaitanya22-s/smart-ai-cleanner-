import React, { useState } from 'react';
import { AuditDecision, RemediationStep, StepPriority, StepStatus } from '../types';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Bot,
  ChevronDown,
  ChevronUp,
  Code,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RemediationCenterViewProps {
  decisions: AuditDecision[];
  onExecuteSimulatedRemediation: (requestId: string) => void;
  onUpdateStepState: (requestId: string, stepId: string, newState: StepStatus) => void;
}

export const RemediationCenterView: React.FC<RemediationCenterViewProps> = ({
  decisions,
  onExecuteSimulatedRemediation,
  onUpdateStepState
}) => {
  // Find incomplete decisions that have remediation plans
  const incompleteDecisions = decisions.filter(d => d.status === 'INCOMPLETE' && d.remediationPlan && d.remediationPlan.length > 0);
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    incompleteDecisions[0]?.requestId || decisions[0]?.requestId || ''
  );

  const activeDecision = decisions.find(d => d.requestId === selectedRequestId) || incompleteDecisions[0];
  const steps = activeDecision?.remediationPlan || [];

  const [expandedStepId, setExpandedStepId] = useState<string | null>(steps[0]?.id || null);
  const [scriptModalStep, setScriptModalStep] = useState<RemediationStep | null>(null);
  const [aiScript, setAiScript] = useState<string | null>(null);
  const [isScriptLoading, setIsScriptLoading] = useState(false);

  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const filteredSteps = steps.filter(s => {
    return priorityFilter === 'ALL' || s.priority === priorityFilter;
  });

  const handleGenerateScript = async (step: RemediationStep) => {
    setScriptModalStep(step);
    setAiScript(null);
    setIsScriptLoading(true);

    try {
      const res = await fetch('/api/audit/gemini-remediation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepNumber: step.stepNumber,
          system: step.system,
          action: step.action,
          affectedFields: step.affectedFields,
          recordReference: step.recordReference,
          problemDescription: step.problemDescription
        })
      });

      const data = await res.json();
      setAiScript(data.script || '-- Script generation completed');
    } catch (err: any) {
      setAiScript(`-- Error generating script: ${err.message}`);
    } finally {
      setIsScriptLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Ordered Remediation Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritized, dependency-aware operational remediation plans preserving statutory retention and stopping resurrection.
          </p>
        </div>

        {activeDecision && activeDecision.status === 'INCOMPLETE' && (
          <button
            onClick={() => onExecuteSimulatedRemediation(activeDecision.requestId)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Remediation & Re-Audit Case</span>
          </button>
        )}
      </div>

      {/* Target Request Selector & Filter */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">Case Plan:</span>
          <select
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value)}
            className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            {decisions.map(d => (
              <option key={d.requestId} value={d.requestId}>
                {d.requestId} ({d.customerId}) — {d.status} ({d.remediationPlan?.length || 0} steps)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Priority Filter:</span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                  priorityFilter === p ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step List */}
      <div className="space-y-4">
        {filteredSteps.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              No Pending Remediation Steps
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This deletion request satisfies all mandatory policy invariants or has already completed verified remediation.
            </p>
          </div>
        ) : (
          filteredSteps.map((step) => {
            const isExpanded = expandedStepId === step.id;
            return (
              <div
                key={step.id}
                className={`bg-white border rounded-lg shadow-xs transition-colors overflow-hidden ${
                  step.state === 'VERIFIED' ? 'border-emerald-200' : 'border-slate-200'
                }`}
              >
                {/* Step Header */}
                <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-mono text-xs font-bold text-slate-800 shrink-0">
                      {step.stepNumber}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          step.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          step.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {step.priority}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {step.action}: {step.system}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({step.recordReference})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 truncate max-w-xl">
                        {step.problemDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Selector */}
                    <select
                      value={step.state}
                      onChange={(e) => onUpdateStepState(activeDecision.requestId, step.id, e.target.value as StepStatus)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded border focus:outline-none cursor-pointer ${
                        step.state === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        step.state === 'APPROVED' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="PROPOSED">PROPOSED</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="BLOCKED">BLOCKED</option>
                      <option value="VERIFIED">VERIFIED</option>
                    </select>

                    {/* Generate Script Button */}
                    <button
                      onClick={() => handleGenerateScript(step)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <Code className="w-3.5 h-3.5 text-slate-600" />
                      <span>Script</span>
                    </button>

                    {/* Expand Toggle */}
                    <button
                      onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-700">Recommended Implementation Procedure</span>
                        <div className="p-2.5 bg-slate-900 text-slate-200 font-mono text-[11px] rounded leading-relaxed overflow-x-auto">
                          {step.recommendedProcedure}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="font-semibold text-slate-700">Expected Outcome & Governance Invariant</span>
                        <p className="p-2.5 bg-white border border-slate-200 rounded text-slate-700 leading-relaxed">
                          {step.expectedOutcome}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-[11px]">
                      <div className="p-2.5 bg-white border border-slate-200 rounded">
                        <span className="text-slate-400 block font-mono">Applicable Rule</span>
                        <span className="font-semibold text-slate-800">{step.applicableRule}</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded">
                        <span className="text-slate-400 block font-mono">Prerequisites</span>
                        <span className="font-semibold text-slate-800">{step.prerequisites.join(', ') || 'None'}</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded">
                        <span className="text-slate-400 block font-mono">Responsible Team</span>
                        <span className="font-semibold text-slate-800">{step.responsibleTeam}</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded">
                        <span className="text-slate-400 block font-mono">Required Evidence</span>
                        <span className="font-semibold text-slate-800">{step.evidenceRequired}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* AI Script Modal */}
      {scriptModalStep && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Idempotent Remediation Script Generator
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mt-1">
                  Step #{scriptModalStep.stepNumber}: {scriptModalStep.action} on {scriptModalStep.system}
                </h3>
              </div>
              <button
                onClick={() => setScriptModalStep(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Target: {scriptModalStep.recordReference}</span>
                <span className="font-mono text-[11px]">Powered by Gemini 3.8 Flash</span>
              </div>

              {isScriptLoading ? (
                <div className="p-8 bg-slate-900 text-center rounded-lg text-slate-400 text-xs">
                  Generating enterprise-grade SQL and API remediation procedures...
                </div>
              ) : (
                <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs rounded-lg max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {aiScript}
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                Verify commands in staging sandbox prior to production execution.
              </span>
              <button
                onClick={() => setScriptModalStep(null)}
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
