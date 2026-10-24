import React, { useState } from 'react';
import { AuditDecision, ResurrectionRisk } from '../types';
import {
  Repeat,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Server,
  Database,
  RefreshCw,
  CheckCircle2,
  Lock,
  Code
} from 'lucide-react';

interface ResurrectionRisksViewProps {
  decisions: AuditDecision[];
}

export const ResurrectionRisksView: React.FC<ResurrectionRisksViewProps> = ({ decisions }) => {
  const [selectedRisk, setSelectedRisk] = useState<ResurrectionRisk | null>(null);

  // Aggregate all resurrection risks across decisions
  const allRisks = decisions.flatMap(d => d.resurrectionRisks);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Resurrection & Synchronization Hazard Monitor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline analysis scanning sync jobs, CDC streams, batch imports, and disaster recovery restores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            {allRisks.length} Resurrection Paths Flagged
          </span>
        </div>
      </div>

      {/* Visual Pipeline Failure Architecture Diagram */}
      <div className="bg-slate-900 text-slate-200 rounded-lg p-6 border border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Anatomy of the $2.4M Deletion Resurrection Loop
            </h3>
          </div>
          <span className="text-[11px] text-rose-400 font-mono font-semibold">
            HAZARD ACTIVE: WRITE-AFTER-DELETION
          </span>
        </div>

        {/* 4-Step Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Step 1 */}
          <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-lg space-y-2 relative">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              01 · Request Signoff
            </div>
            <div className="text-xs font-bold text-white">
              Operator Marked Complete
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Operator marked DEL-REQ-2024-0891 complete on dashboard. Accounts DB was wiped, but CRM HubSpot was skipped due to API timeout.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">2024-03-14 10:00 UTC</div>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-slate-800/80 border border-rose-900/60 rounded-lg space-y-2 relative">
            <div className="text-[10px] font-mono font-bold text-rose-400 uppercase">
              02 · CDC Sync Triggers
            </div>
            <div className="text-xs font-bold text-rose-300">
              Scheduled Kafka Sync Runs
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Job JOB-SYNC-9921 pulled unpurged customer profile from CRM and published upsert payload to the replication stream without tombstone check.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">2024-03-15 02:00 UTC</div>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-slate-800/80 border border-rose-900/60 rounded-lg space-y-2 relative">
            <div className="text-[10px] font-mono font-bold text-rose-400 uppercase">
              03 · Master Re-Seeded
            </div>
            <div className="text-xs font-bold text-rose-300">
              Personal Data Re-Created
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Primary PostgreSQL DB inserted sarah.jenkins@example.com back into customer_accounts table with status ACTIVE.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">2024-03-15 02:00:05 UTC</div>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-slate-800/80 border border-amber-900/60 rounded-lg space-y-2 relative">
            <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">
              04 · Consumer Collision
            </div>
            <div className="text-xs font-bold text-amber-300">
              Registration 409 Conflict
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When Sarah Jenkins attempted new account sign-up weeks later, registration service crashed with duplicate email conflict. DPA complaint triggered $2.4M fine.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">2024-04-02 10:14 UTC</div>
          </div>
        </div>
      </div>

      {/* Detected Resurrection Paths Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Suspected Resurrection Paths ({allRisks.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific processes where deleted data can re-enter enterprise systems.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-rose-700">
            {allRisks.filter(r => r.status === 'ACTIVE').length} Active Processes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4 font-mono">Process ID</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Source System</th>
                <th className="py-2.5 px-4">Destination System</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Confidence</th>
                <th className="py-2.5 px-4">Recreation Trigger</th>
                <th className="py-2.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allRisks.map(risk => (
                <tr key={risk.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {risk.processId}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {risk.processType}
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    {risk.sourceSystem}
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    {risk.destSystem}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      risk.status === 'ACTIVE' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {risk.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 font-mono text-[11px]">
                    {risk.confidence}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={risk.recreationTrigger}>
                    {risk.recreationTrigger}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedRisk(risk)}
                      className="font-semibold text-slate-800 hover:text-slate-950 hover:underline"
                    >
                      Remediate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Controls Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Recommended Architectural Safeguards
        </h3>
        <p className="text-xs text-slate-500">
          Permanent technical controls required to stop deleted identities from returning across distributed microservices.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <Database className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>1. Kafka Tombstone Compaction</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Emit null-payload tombstone records with customer user_id key to ensure Kafka log compaction permanently evicts pre-deletion mutation events.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>2. Idempotent Consumer Guards</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Configure event consumer handlers in downstream services to reject upsert operations if target customer is marked as TOMBSTONE in master ledger.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>3. DR Restore Reconciliation Gate</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mandate an automated Terraform lifecycle hook that executes the Deletion Ledger filter immediately upon snapshot recovery prior to traffic release.
            </p>
          </div>
        </div>
      </div>

      {/* Risk Detail Modal */}
      {selectedRisk && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Resurrection Hazard
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Process {selectedRisk.processId} ({selectedRisk.sourceSystem} → {selectedRisk.destSystem})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRisk(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium">Recreation Mechanism</div>
                <div className="font-semibold text-slate-900">{selectedRisk.recreationTrigger}</div>
                <div className="text-[11px] text-slate-500 font-mono">Timestamp: {selectedRisk.executionTimestamp}</div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-800">Evidence Snippet / Payload Sample</div>
                <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded overflow-x-auto">
                  {selectedRisk.evidenceSnippet}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-800">Required Remediation Control</div>
                <p className="text-slate-700 leading-relaxed bg-white border border-slate-200 p-2.5 rounded">
                  {selectedRisk.requiredRemediation}
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedRisk(null)}
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
