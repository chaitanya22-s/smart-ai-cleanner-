import React, { useState, useEffect } from 'react';
import { CustomerFriendlyStatus, CustomerProgressStep, CustomerDeletionRequestSummary } from '../types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';

interface CustomerPortalViewProps {
  onOpenCheckStatus: () => void;
  isCheckStatusOpen: boolean;
  onCloseCheckStatus: () => void;
  onSwitchToAdmin: () => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  onOpenCheckStatus,
  isCheckStatusOpen,
  onCloseCheckStatus,
  onSwitchToAdmin
}) => {
  // Public Feed State
  const [recentlyDeleted, setRecentlyDeleted] = useState<any[]>([]);
  const [deletedData, setDeletedData] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  // Verification Summary Modal for Completed Items
  const [selectedVerificationSummary, setSelectedVerificationSummary] = useState<any | null>(null);

  // Customer Status Check Workflow State
  const [step, setStep] = useState<'input-email' | 'enter-otp' | 'view-status'>('input-email');
  const [inputEmail, setInputEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [maskedVerifiedEmail, setMaskedVerifiedEmail] = useState('');

  // Status Check Feedback
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [devModeMessage, setDevModeMessage] = useState<string | null>(null);

  // Authenticated Requests State
  const [myRequests, setMyRequests] = useState<CustomerDeletionRequestSummary[]>([]);
  const [selectedRequestIndex, setSelectedRequestIndex] = useState<number>(0);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [refreshNotification, setRefreshNotification] = useState<string | null>(null);

  // Fetch Public Feed on mount
  const fetchPublicFeed = async () => {
    try {
      setFeedLoading(true);
      const res = await fetch('/api/customer/public-feed');
      const data = await res.json();
      setRecentlyDeleted(data.recentlyDeleted || []);
      setDeletedData(data.deletedData || []);
    } catch (err) {
      console.error('Failed to load public feed:', err);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicFeed();
  }, []);

  // Request OTP Handler
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes('@')) {
      setOtpError('Please enter a valid email address.');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    setDevModeMessage(null);

    try {
      const res = await fetch('/api/customer/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputEmail.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || 'Failed to send verification code.');
        return;
      }

      if (data.mode === 'development') {
        setDevModeMessage(data.message || 'Development Mode: No external SMTP gateway is configured.');
        if (data.devCode) {
          setOtpCode(data.devCode); // Pre-fill for convenience in test environment
        }
      }

      setStep('enter-otp');
    } catch (err: any) {
      setOtpError(err.message || 'Network error requesting verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/customer/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputEmail.trim(), otp: otpCode.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || 'Invalid verification code.');
        return;
      }

      setAuthToken(data.token);
      setMaskedVerifiedEmail(data.email);

      // Fetch customer requests
      const reqRes = await fetch('/api/customer/my-requests', {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      const reqData = await reqRes.json();

      setMyRequests(reqData.requests || []);
      setSelectedRequestIndex(0);
      setStep('view-status');
    } catch (err: any) {
      setOtpError(err.message || 'Failed to verify code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // "Check Status Again" Handler
  const handleCheckStatusAgain = async (requestId: string) => {
    if (!authToken) return;
    setIsRefreshingStatus(true);
    setRefreshNotification(null);

    try {
      const res = await fetch(`/api/customer/refresh-status/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();

      if (res.ok && data.summary) {
        setMyRequests(prev =>
          prev.map(r => (r.requestId === requestId ? data.summary : r))
        );
        setRefreshNotification('Status and verification timestamp refreshed with latest backend data.');
        setTimeout(() => setRefreshNotification(null), 4000);
      }
    } catch (err: any) {
      console.error('Failed to refresh status:', err);
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  // Helper for status badge styling
  const renderStatusBadge = (status: CustomerFriendlyStatus) => {
    switch (status) {
      case 'Deletion Complete':
        return (
          <span className="inline-flex items-center gap-1.5 font-bold text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Deletion Complete</span>
          </span>
        );
      case 'Action Required':
        return (
          <span className="inline-flex items-center gap-1.5 font-bold text-xs text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Action Required</span>
          </span>
        );
      case 'Verification Pending':
        return (
          <span className="inline-flex items-center gap-1.5 font-medium text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Verification Pending</span>
          </span>
        );
      case 'Deletion In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 font-medium text-xs text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 shrink-0 animate-spin" />
            <span>Deletion In Progress</span>
          </span>
        );
      case 'Request Received':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Request Received</span>
          </span>
        );
    }
  };

  // Active request in view-status mode
  const activeCustomerReq = myRequests[selectedRequestIndex] || null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Welcome Hero & Direct Action */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Right to Erasure Tracker</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Customer Data Deletion Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Track the progress of your personal data erasure request. We independently verify that personal identifiers are permanently removed across internal systems and downstream services.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={onOpenCheckStatus}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Check My Deletion Status</span>
            </button>
          </div>
        </div>

        {/* SECTION A: RECENTLY DELETED */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Recently Deleted
              </h2>
              <p className="text-xs text-slate-500">
                Active and recently processed deletion requests with live verification statuses.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            {feedLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading recent deletion activity...</div>
            ) : recentlyDeleted.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No recent deletion requests recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Customer Email</th>
                      <th className="py-3 px-4">Request Date</th>
                      <th className="py-3 px-4">Current Deletion Status</th>
                      <th className="py-3 px-4">Last Verified</th>
                      <th className="py-3 px-4">Further Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {recentlyDeleted.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">
                          {row.maskedEmail}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-3 px-4">
                          {renderStatusBadge(row.status)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {row.lastVerifiedAt ? new Date(row.lastVerifiedAt).toLocaleDateString() : 'Today'}
                        </td>
                        <td className="py-3 px-4">
                          {row.actionRequired ? (
                            <span className="font-semibold text-rose-700 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Action Required</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* SECTION B: DELETED DATA (ONLY VERIFIED COMPLETE REQUESTS) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Deleted Data
              </h2>
              <p className="text-xs text-slate-500">
                Verified records where personal data treatments have been confirmed by our audit engine.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              {deletedData.length} Verified Deletions
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            {feedLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading verified records...</div>
            ) : deletedData.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No deletion requests have met all 100% completion verification checks yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Customer Reference</th>
                      <th className="py-3 px-4">Completion Date</th>
                      <th className="py-3 px-4">Verification Status</th>
                      <th className="py-3 px-4">Coverage</th>
                      <th className="py-3 px-4 text-right">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {deletedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">
                          {row.maskedEmail}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {new Date(row.completionDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{row.verificationStatus}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="font-semibold text-slate-800">{row.systemsCheckedCount} systems</span> verified
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedVerificationSummary(row)}
                            className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                          >
                            View Summary
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Footer info & Admin Switcher */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            Northstar Shop Privacy Compliance Office · All erasures verified in accordance with GDPR Art. 17 & CCPA § 1798.105.
          </p>
          <button
            onClick={onSwitchToAdmin}
            className="font-semibold text-slate-700 hover:text-slate-900 underline"
          >
            Compliance & Engineering Staff Portal
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CHECK DELETION STATUS MODAL / CUSTOMER WORKFLOW */}
      {/* ========================================================= */}
      {isCheckStatusOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {step === 'view-status' ? 'Your Data Deletion Status' : 'Check Deletion Status'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {step === 'input-email' && 'Enter the email address associated with your deletion request.'}
                  {step === 'enter-otp' && 'Enter the one-time code to securely confirm ownership of your email.'}
                  {step === 'view-status' && 'Verified deletion progress and statutory retention details.'}
                </p>
              </div>
              <button
                onClick={() => {
                  onCloseCheckStatus();
                  setStep('input-email');
                  setOtpError(null);
                  setDevModeMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {otpError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{otpError}</span>
              </div>
            )}

            {/* Dev Mode Banner (Mandatory requirement when no external SMTP configured) */}
            {devModeMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                  <Info className="w-4 h-4" />
                  <span>Development / Testing Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">{devModeMessage}</p>
              </div>
            )}

            {/* STEP 1: INPUT EMAIL */}
            {step === 'input-email' && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. sarah.jenkins@example.com"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Try <span className="font-mono text-slate-600">sarah.jenkins@example.com</span> or <span className="font-mono text-slate-600">david.vance@vancetech.io</span> from the benchmark dataset.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-md transition-colors shadow-xs"
                  >
                    {otpLoading ? 'Sending Verification Code...' : 'Verify My Identity'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: ENTER OTP */}
            {step === 'enter-otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Enter 6-Digit One-Time Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-mono tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Code expires in 10 minutes. Possession of the email alone is never treated as proof of identity.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep('input-email'); setOtpError(null); }}
                    className="w-1/3 py-2 px-3 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading || otpCode.length !== 6}
                    className="w-2/3 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-md transition-colors shadow-xs"
                  >
                    {otpLoading ? 'Verifying Identity...' : 'Check Status'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SIMPLE CUSTOMER STATUS PAGE */}
            {step === 'view-status' && (
              <div className="space-y-6 text-xs">
                {myRequests.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="font-bold text-slate-800">No Deletion Request Found</div>
                    <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
                      There is no registered erasure request associated with <span className="font-mono">{maskedVerifiedEmail}</span>.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Multi-Request Switcher (if customer submitted more than 1 request) */}
                    {myRequests.length > 1 && (
                      <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-md">
                        <span className="text-[11px] font-semibold text-slate-500">Your Requests:</span>
                        <div className="flex items-center gap-1">
                          {myRequests.map((r, i) => (
                            <button
                              key={r.requestId}
                              onClick={() => setSelectedRequestIndex(i)}
                              className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                                selectedRequestIndex === i
                                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {r.requestId}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeCustomerReq && (
                      <div className="space-y-5">
                        {/* Summary Metadata Card */}
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[10px] font-mono">Registered Email</span>
                              <span className="font-mono font-bold text-slate-900">{activeCustomerReq.maskedEmail}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] font-mono">Request Reference ID</span>
                              <span className="font-mono font-bold text-slate-900">{activeCustomerReq.requestId}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] font-mono">Request Submitted</span>
                              <span className="text-slate-800 font-medium">
                                {new Date(activeCustomerReq.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] font-mono">Current Status</span>
                              <div>{renderStatusBadge(activeCustomerReq.status)}</div>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                            <span>Last verified by engine:</span>
                            <span>{new Date(activeCustomerReq.lastVerifiedAt).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Customer-Friendly Progress Tracker */}
                        {/* Sequence: Request Received → Data Search → Deletion Processing → Final Verification → Complete */}
                        <div className="space-y-2">
                          <span className="font-bold text-slate-800 block text-xs">
                            Erasure Workflow Progress
                          </span>
                          <div className="grid grid-cols-5 gap-1 text-center text-[10px] sm:text-[11px] font-medium">
                            {[
                              { key: 'received', label: '1. Received' },
                              { key: 'searching', label: '2. Search' },
                              { key: 'processing', label: '3. Processing' },
                              { key: 'verifying', label: '4. Verifying' },
                              { key: 'complete', label: '5. Complete' }
                            ].map((s, idx) => {
                              const stepOrder = ['received', 'searching', 'processing', 'verifying', 'complete'];
                              const currentIndex = stepOrder.indexOf(activeCustomerReq.progressStep);
                              const isStepDone = idx <= currentIndex;
                              const isCurrent = idx === currentIndex;

                              return (
                                <div key={s.key} className="space-y-1">
                                  <div
                                    className={`h-2 rounded-full ${
                                      isStepDone
                                        ? activeCustomerReq.status === 'Action Required' && isCurrent
                                          ? 'bg-rose-500'
                                          : 'bg-emerald-600'
                                        : 'bg-slate-200'
                                    }`}
                                  />
                                  <span className={isCurrent ? 'font-bold text-slate-900' : 'text-slate-500'}>
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Friendly Status Explanation Box */}
                        <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1.5 shadow-xs">
                          <h4 className="font-bold text-slate-900 text-xs">Status Details</h4>
                          <p className="text-slate-700 leading-relaxed text-xs">
                            {activeCustomerReq.explanation}
                          </p>
                          {activeCustomerReq.verificationSummary?.retentionExemptionNote && (
                            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                              <span className="font-semibold text-slate-700">Notice: </span>
                              {activeCustomerReq.verificationSummary.retentionExemptionNote}
                            </p>
                          )}
                        </div>

                        {/* Refresh Notification */}
                        {refreshNotification && (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{refreshNotification}</span>
                          </div>
                        )}

                        {/* Action Buttons: "Check Status Again" */}
                        <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                          <button
                            onClick={() => handleCheckStatusAgain(activeCustomerReq.requestId)}
                            disabled={isRefreshingStatus}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-md transition-colors"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
                            <span>{isRefreshingStatus ? 'Checking Backend...' : 'Check Status Again'}</span>
                          </button>

                          <button
                            onClick={() => {
                              onCloseCheckStatus();
                              setStep('input-email');
                            }}
                            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VERIFICATION SUMMARY MODAL FOR DELETED DATA */}
      {/* ========================================================= */}
      {selectedVerificationSummary && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                  Verified Deletion Summary
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Customer {selectedVerificationSummary.maskedEmail}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVerificationSummary(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="text-slate-500 text-[11px]">Audit Completion Timestamp</div>
                <div className="font-mono font-semibold text-slate-900">
                  {new Date(selectedVerificationSummary.completionDate).toLocaleString()}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800">Verification Outcome:</span>
                <p>
                  All personal identifiers (direct contact details and linkable hashes) have been verified permanently erased or redacted across <span className="font-semibold text-slate-900">{selectedVerificationSummary.systemsCheckedCount} connected internal systems</span>.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800">Retention Exceptions:</span>
                <p className="text-[11px] text-slate-600">
                  {selectedVerificationSummary.retentionExemptionNote ||
                    'Certain financial and tax transaction records are retained in compliance with statutory audit obligations, with personal shipping and contact information permanently redacted.'}
                </p>
              </div>

              {selectedVerificationSummary.certificateId && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px] font-mono">
                  Certificate Ref: {selectedVerificationSummary.certificateId}
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedVerificationSummary(null)}
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
