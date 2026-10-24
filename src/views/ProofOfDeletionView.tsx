import React, { useState } from 'react';
import { AuditDecision, ProofOfDeletionDocument } from '../types';
import {
  Award,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  FileCheck2,
  Lock,
  ExternalLink,
  Info
} from 'lucide-react';

interface ProofOfDeletionViewProps {
  decisions: AuditDecision[];
}

export const ProofOfDeletionView: React.FC<ProofOfDeletionViewProps> = ({ decisions }) => {
  const completeDecisions = decisions.filter(d => d.status === 'COMPLETE' && d.proofOfDeletion);
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    completeDecisions[0]?.requestId || ''
  );

  const activeDecision = completeDecisions.find(d => d.requestId === selectedRequestId) || completeDecisions[0];
  const proof: ProofOfDeletionDocument | undefined = activeDecision?.proofOfDeletion;

  const handleDownloadJson = () => {
    if (!proof) return;
    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proof_of_deletion_${proof.certificateId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Proof of Deletion Certificates
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically anchored compliance attestations generated solely for cases meeting all 6 completion conditions.
          </p>
        </div>

        {proof && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download JSON Dossier</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
          </div>
        )}
      </div>

      {completeDecisions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400 space-y-3">
          <Award className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-900">
            No Complete Deletion Certificates Available Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            A Proof of Deletion Certificate is generated only when all copies comply with policy, tombstones are clean, no resurrection paths exist, and tax retention is preserved.
          </p>
        </div>
      ) : (
        <>
          {/* Case Selector Dropdown if multiple */}
          {completeDecisions.length > 1 && (
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Select Certificate:</span>
              <select
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="text-xs font-bold text-slate-900 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {completeDecisions.map(d => (
                  <option key={d.requestId} value={d.requestId}>
                    {d.requestId} (Certificate: {d.proofOfDeletion?.certificateId})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Certificate Document (Printable) */}
          {proof && (
            <div className="bg-white border border-slate-300 rounded-lg p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
              {/* Header Lockup */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cryptographic Compliance Certificate</span>
                  </div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Proof of Personal Data Erasure
                  </h1>
                  <p className="text-xs text-slate-500">
                    Issued by Smart AI Cleaner by Chaitanya pursuant to GDPR Art. 17 and CCPA § 1798.105
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-mono text-xs font-bold text-slate-900">
                    {proof.certificateId}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Audit Run: {proof.auditRunId}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Timestamp: {new Date(proof.auditTimestamp).toUTCString()}
                  </div>
                </div>
              </div>

              {/* Subject & Search Coverage Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono">Request Reference</span>
                  <span className="font-mono font-bold text-slate-900">{proof.deletionRequestId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono">Resolved Internal ID</span>
                  <span className="font-mono font-bold text-slate-900">{proof.resolvedInternalId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono">Systems Inspected</span>
                  <span className="font-bold text-slate-900">{proof.systemsSearched.length} Enterprise Systems</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono">Resurrection Hazard</span>
                  <span className="font-bold text-emerald-700">Zero Unresolved Paths</span>
                </div>
              </div>

              {/* Verified Systems Breakdown Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  System-by-System Treatment Verification
                </h3>
                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">System</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 font-mono">Required Treatment</th>
                        <th className="py-2.5 px-3">Verified Outcome</th>
                        <th className="py-2.5 px-3 font-mono">Underlying Evidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {proof.categoryVerifications.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {v.system}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {v.category}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                            {v.requiredAction}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {v.verificationResult}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                            {v.evidenceReference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Statements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900">Pipeline Resurrection Guarantee</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {proof.resurrectionVerification.statement} Evaluated {proof.resurrectionVerification.syncJobsChecked} sync queues, {proof.resurrectionVerification.restorePipelinesChecked} DR restore pipelines, and verified Kafka compaction offset.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900">Statutory Tax & Retention Compliance</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {proof.retentionComplianceStatement}
                  </p>
                </div>
              </div>

              {/* Tombstone & Limitations */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900">Tombstone Specification: </span>
                  {proof.tombstoneComplianceStatement}
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                  <span className="font-bold text-slate-500 block">Scope Boundaries & Limitations:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {proof.remainingScopeLimitations.map((lim, i) => (
                      <li key={i}>{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Legal Signoff Footer */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">Chaitanya</span>
                  <div className="text-[11px]">Lead Privacy Compliance Engineer · Smart AI Cleaner</div>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="font-bold text-slate-800 font-mono">DPA COMPLIANCE ATTESTATION</span>
                  <div className="text-[11px]">Verified via Deterministic Policy Engine</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
