import React, { useState, useMemo, useEffect } from 'react';
import { CustomerHeader } from './components/CustomerHeader';
import { CustomerPortalView } from './views/CustomerPortalView';
import { Sidebar, NavSection } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './views/OverviewView';
import { NewAuditView } from './views/NewAuditView';
import { DeletionRequestsView } from './views/DeletionRequestsView';
import { IdentityExplorerView } from './views/IdentityExplorerView';
import { DataExposureView } from './views/DataExposureView';
import { ResurrectionRisksView } from './views/ResurrectionRisksView';
import { RemediationCenterView } from './views/RemediationCenterView';
import { ProofOfDeletionView } from './views/ProofOfDeletionView';
import { EvidenceExplorerView } from './views/EvidenceExplorerView';
import { AuditHistoryView } from './views/AuditHistoryView';
import { PolicyRulesView } from './views/PolicyRulesView';
import { SettingsView } from './views/SettingsView';

import { NORTHSTAR_INCIDENT_DATASET } from './data/defaultDataset';
import { createSanitizedPostRemediationDataset } from './data/sanitizedDataset';
import { runFullBatchAudit } from './engine/decisionEngine';
import { DatasetPackage, AuditDecision, AuditRunHistoryItem, StepStatus } from './types';
import { Lock, KeyRound, ShieldAlert, X } from 'lucide-react';

export default function App() {
  // App Mode: 'customer' (default for consumers) vs 'admin' (compliance engineering console)
  const [appMode, setAppMode] = useState<'customer' | 'admin'>('customer');
  const [isCheckStatusModalOpen, setIsCheckStatusModalOpen] = useState(false);

  // Admin Auth Gate State
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('compliance-lead-2024');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Admin Audit Console State
  const [currentSection, setCurrentSection] = useState<NavSection>('overview');
  const [dataset, setDataset] = useState<DatasetPackage>(NORTHSTAR_INCIDENT_DATASET);
  const [maskingEnabled, setMaskingEnabled] = useState<boolean>(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>('DEL-REQ-2024-0891');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('CUST-84920');
  const [isRunningAudit, setIsRunningAudit] = useState<boolean>(false);

  // Initial audit run calculation
  const [decisions, setDecisions] = useState<AuditDecision[]>(() => {
    return runFullBatchAudit(NORTHSTAR_INCIDENT_DATASET.files, 'RUN-2024-04-10-INITIAL');
  });

  const [history, setHistory] = useState<AuditRunHistoryItem[]>([
    {
      runId: 'RUN-2024-04-10-INITIAL',
      timestamp: '2024-04-10T14:22:00Z',
      datasetName: 'Northstar Shop $2.4M Incident Package',
      totalRequests: 4,
      completeCount: 1,
      incompleteCount: 3,
      notApplicableCount: 0,
      openCriticalRisks: 5,
      notes: 'Initial independent audit run on raw incident evidence. Verified write-after-deletion resurrection in sync pipeline JOB-SYNC-9921 and persistent PII in CRM and S3.'
    }
  ]);

  // Aggregate alert metrics for sidebar
  const openCriticalCount = useMemo(() => {
    return decisions.reduce(
      (acc, d) => acc + d.findings.filter(f => !f.isCompliant && f.severity === 'CRITICAL').length,
      0
    );
  }, [decisions]);

  const resurrectionCount = useMemo(() => {
    return decisions.reduce((acc, d) => acc + d.resurrectionRisks.length, 0);
  }, [decisions]);

  // Handle re-running the audit on current dataset
  const handleRunAudit = () => {
    setIsRunningAudit(true);
    setTimeout(() => {
      const runId = `RUN-${Date.now().toString().slice(-6)}`;
      const newDecisions = runFullBatchAudit(dataset.files, runId);
      setDecisions(newDecisions);

      const completeCount = newDecisions.filter(d => d.status === 'COMPLETE').length;
      const incompleteCount = newDecisions.filter(d => d.status === 'INCOMPLETE').length;
      const notApplicableCount = newDecisions.filter(d => d.status === 'NOT_APPLICABLE').length;
      const criticalRisks = newDecisions.reduce(
        (acc, d) => acc + d.findings.filter(f => !f.isCompliant && f.severity === 'CRITICAL').length,
        0
      );

      const historyEntry: AuditRunHistoryItem = {
        runId,
        timestamp: new Date().toISOString(),
        datasetName: dataset.metadata.packageName,
        totalRequests: newDecisions.length,
        completeCount,
        incompleteCount,
        notApplicableCount,
        openCriticalRisks: criticalRisks,
        notes: `Executed full audit verification across ${dataset.metadata.fileCount} files. Decision breakdown: ${completeCount} COMPLETE, ${incompleteCount} INCOMPLETE, ${notApplicableCount} NOT_APPLICABLE.`
      };

      setHistory(prev => [historyEntry, ...prev]);
      setIsRunningAudit(false);
    }, 400);
  };

  // Preset Loaders
  const handleLoadPreloadedIncident = () => {
    setDataset(NORTHSTAR_INCIDENT_DATASET);
    const runId = `RUN-INCIDENT-${Date.now().toString().slice(-4)}`;
    const newDec = runFullBatchAudit(NORTHSTAR_INCIDENT_DATASET.files, runId);
    setDecisions(newDec);
    setSelectedRequestId('DEL-REQ-2024-0891');
    setSelectedCustomerId('CUST-84920');

    // Notify backend
    fetch('/api/admin/reset-dataset', { method: 'POST' }).catch(() => {});

    setHistory(prev => [
      {
        runId,
        timestamp: new Date().toISOString(),
        datasetName: 'Northstar Shop $2.4M Incident Package (Reloaded)',
        totalRequests: newDec.length,
        completeCount: newDec.filter(d => d.status === 'COMPLETE').length,
        incompleteCount: newDec.filter(d => d.status === 'INCOMPLETE').length,
        notApplicableCount: 0,
        openCriticalRisks: 5,
        notes: 'Restored baseline incident package featuring active sync loop.'
      },
      ...prev
    ]);
  };

  const handleLoadPostRemediationBenchmark = () => {
    const sanitized = createSanitizedPostRemediationDataset();
    setDataset(sanitized);
    const runId = `RUN-REMEDIATED-${Date.now().toString().slice(-4)}`;
    const newDec = runFullBatchAudit(sanitized.files, runId);
    setDecisions(newDec);
    setSelectedRequestId('DEL-REQ-2024-0891');
    setSelectedCustomerId('CUST-84920');

    // Notify backend
    fetch('/api/admin/simulate-remediation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: 'DEL-REQ-2024-0891' })
    }).catch(() => {});

    setHistory(prev => [
      {
        runId,
        timestamp: new Date().toISOString(),
        datasetName: 'Post-Remediation Verification Package (Sanitized)',
        totalRequests: newDec.length,
        completeCount: newDec.filter(d => d.status === 'COMPLETE').length,
        incompleteCount: newDec.filter(d => d.status === 'INCOMPLETE').length,
        notApplicableCount: 0,
        openCriticalRisks: 0,
        notes: 'Loaded post-remediation dataset. Sarah Jenkins (CUST-84920) successfully verified COMPLETE with 100% audit score and issued Proof of Deletion.'
      },
      ...prev
    ]);
  };

  // Simulate Remediation Execution on a specific request
  const handleExecuteSimulatedRemediation = (requestId: string) => {
    if (requestId === 'DEL-REQ-2024-0891' || requestId.includes('84920')) {
      handleLoadPostRemediationBenchmark();
      setCurrentSection('proof');
    } else {
      handleRunAudit();
    }
  };

  // Update step status in state
  const handleUpdateStepState = (reqId: string, stepId: string, newState: StepStatus) => {
    setDecisions(prev => {
      return prev.map(dec => {
        if (dec.requestId === reqId && dec.remediationPlan) {
          const updatedPlan = dec.remediationPlan.map(s => {
            if (s.id === stepId) {
              return { ...s, state: newState, isExecuted: newState === 'VERIFIED' };
            }
            return s;
          });
          return { ...dec, remediationPlan: updatedPlan };
        }
        return dec;
      });
    });
  };

  // Export dossier download
  const handleExportReport = () => {
    const dossier = {
      platform: 'Smart AI Cleaner by Chaitanya',
      exportTimestamp: new Date().toISOString(),
      datasetPackage: dataset.metadata.packageName,
      auditRunsTotal: history.length,
      currentDecisions: decisions
    };
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_ai_cleaner_dossier_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectRequestAndNavigate = (reqId: string) => {
    setSelectedRequestId(reqId);
    const target = decisions.find(d => d.requestId === reqId);
    if (target) {
      setSelectedCustomerId(target.customerId);
    }
    setCurrentSection('requests');
  };

  // Admin Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthLoading(true);
    setAdminAuthError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: adminPasscode.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        setAdminAuthError(data.error || 'Invalid passcode.');
        return;
      }

      setAdminToken(data.token);
      setIsAdminAuthModalOpen(false);
      setAppMode('admin');
    } catch (err: any) {
      setAdminAuthError(err.message || 'Authentication error.');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-slate-50 text-slate-900 font-sans">
      {/* ========================================================= */}
      {/* CUSTOMER PORTAL MODE (DEFAULT FOR ORDINARY CUSTOMERS)      */}
      {/* ========================================================= */}
      {appMode === 'customer' && (
        <div className="flex flex-col min-h-screen">
          <CustomerHeader
            onOpenCheckStatus={() => setIsCheckStatusModalOpen(true)}
            onSwitchToAdmin={() => {
              if (adminToken) {
                setAppMode('admin');
              } else {
                setIsAdminAuthModalOpen(true);
              }
            }}
          />

          <main className="flex-1">
            <CustomerPortalView
              isCheckStatusOpen={isCheckStatusModalOpen}
              onOpenCheckStatus={() => setIsCheckStatusModalOpen(true)}
              onCloseCheckStatus={() => setIsCheckStatusModalOpen(false)}
              onSwitchToAdmin={() => setIsAdminAuthModalOpen(true)}
            />
          </main>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADVANCED ADMIN AUDIT CONSOLE (COMPLIANCE & ENGINEERING)    */}
      {/* ========================================================= */}
      {appMode === 'admin' && (
        <div className="flex h-screen w-screen overflow-hidden">
          <Sidebar
            currentSection={currentSection}
            onSelectSection={setCurrentSection}
            openCriticalCount={openCriticalCount}
            resurrectionCount={resurrectionCount}
          />

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header
              currentSection={currentSection}
              datasetName={dataset.metadata.packageName}
              lastAuditTimestamp={history[0]?.timestamp || ''}
              maskingEnabled={maskingEnabled}
              onToggleMasking={() => setMaskingEnabled(!maskingEnabled)}
              onRunAudit={handleRunAudit}
              onExportReport={handleExportReport}
              isRunningAudit={isRunningAudit}
              onSwitchToCustomerPortal={() => setAppMode('customer')}
            />

            <main className="flex-1 overflow-y-auto">
              {currentSection === 'overview' && (
                <OverviewView
                  decisions={decisions}
                  dataset={dataset}
                  onNavigate={setCurrentSection}
                  onSelectRequest={handleSelectRequestAndNavigate}
                />
              )}

              {currentSection === 'new-audit' && (
                <NewAuditView
                  currentDataset={dataset}
                  onUpdateDataset={(newPkg) => {
                    setDataset(newPkg);
                    handleRunAudit();
                  }}
                  onRunAudit={handleRunAudit}
                  onLoadPreloadedIncident={handleLoadPreloadedIncident}
                  onLoadPostRemediationBenchmark={handleLoadPostRemediationBenchmark}
                />
              )}

              {currentSection === 'requests' && (
                <DeletionRequestsView
                  decisions={decisions}
                  selectedRequestId={selectedRequestId}
                  onSelectRequest={setSelectedRequestId}
                  maskingEnabled={maskingEnabled}
                  onNavigate={setCurrentSection}
                />
              )}

              {currentSection === 'identity' && (
                <IdentityExplorerView
                  decisions={decisions}
                  selectedCustomerId={selectedCustomerId}
                  onSelectCustomer={(cId) => {
                    setSelectedCustomerId(cId);
                    const req = decisions.find(d => d.customerId === cId);
                    if (req) setSelectedRequestId(req.requestId);
                  }}
                  maskingEnabled={maskingEnabled}
                  onToggleMasking={() => setMaskingEnabled(!maskingEnabled)}
                />
              )}

              {currentSection === 'exposure' && (
                <DataExposureView decisions={decisions} />
              )}

              {currentSection === 'resurrection' && (
                <ResurrectionRisksView decisions={decisions} />
              )}

              {currentSection === 'remediation' && (
                <RemediationCenterView
                  decisions={decisions}
                  onExecuteSimulatedRemediation={handleExecuteSimulatedRemediation}
                  onUpdateStepState={handleUpdateStepState}
                />
              )}

              {currentSection === 'proof' && (
                <ProofOfDeletionView decisions={decisions} />
              )}

              {currentSection === 'evidence' && (
                <EvidenceExplorerView dataset={dataset} />
              )}

              {currentSection === 'history' && (
                <AuditHistoryView
                  history={history}
                  currentDecisions={decisions}
                  onSelectRun={() => {}}
                />
              )}

              {currentSection === 'rules' && (
                <PolicyRulesView dataset={dataset} />
              )}

              {currentSection === 'settings' && (
                <SettingsView
                  maskingEnabled={maskingEnabled}
                  onToggleMasking={() => setMaskingEnabled(!maskingEnabled)}
                  onResetIncidentDataset={handleLoadPreloadedIncident}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADMIN AUTHENTICATION GATE MODAL                            */}
      {/* ========================================================= */}
      {isAdminAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>Compliance Staff Access Gate</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Administrative Audit Console
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAdminAuthModalOpen(false);
                  setAdminAuthError(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This console provides unrestricted access to raw cross-system evidence, Kafka sync queues, and database tombstones. Authorized compliance officers only.
            </p>

            {adminAuthError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
                {adminAuthError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrative Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-800"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Default developer credentials: <span className="font-mono text-slate-600">compliance-lead-2024</span>
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminAuthModalOpen(false)}
                  className="w-1/3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminAuthLoading}
                  className="w-2/3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-md transition-colors"
                >
                  {adminAuthLoading ? 'Verifying...' : 'Sign In as Compliance Auditor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
