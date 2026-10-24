import React from 'react';
import { AuditRunHistoryItem, AuditDecision } from '../types';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers
} from 'lucide-react';

interface AuditHistoryViewProps {
  history: AuditRunHistoryItem[];
  currentDecisions: AuditDecision[];
  onSelectRun: (runId: string) => void;
}

export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({
  history,
  currentDecisions,
  onSelectRun
}) => {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header Info */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Audit Verification History & Timeline
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit run log recording evaluation runs, dataset package changes, and compliance state transitions.
        </p>
      </div>

      {/* History Log Timeline */}
      <div className="space-y-4">
        {history.map((item, index) => {
          const isLatest = index === 0;
          return (
            <div
              key={item.runId}
              className={`bg-white border rounded-lg p-5 shadow-xs transition-colors ${
                isLatest ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {item.runId}
                    </span>
                    {isLatest && (
                      <span className="text-[10px] font-bold text-white bg-slate-900 px-2 py-0.5 rounded font-mono">
                        ACTIVE RUN
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    {item.datasetName}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Metrics Pill Grid */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block font-sans">Total</span>
                    <span className="font-bold text-slate-800">{item.totalRequests}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-emerald-600 block font-sans font-medium">Complete</span>
                    <span className="font-bold text-emerald-700">{item.completeCount}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-rose-600 block font-sans font-medium">Incomplete</span>
                    <span className="font-bold text-rose-700">{item.incompleteCount}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-amber-600 block font-sans font-medium">Hazards</span>
                    <span className="font-bold text-amber-700">{item.openCriticalRisks}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded">
                <span className="font-bold text-slate-700">Auditor Run Log: </span>
                {item.notes}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
