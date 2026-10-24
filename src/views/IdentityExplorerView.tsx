import React, { useState } from 'react';
import { AuditDecision } from '../types';
import {
  Fingerprint,
  Mail,
  Phone,
  Hash,
  UserCheck,
  User,
  ShoppingBag,
  FileText,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface IdentityExplorerViewProps {
  decisions: AuditDecision[];
  selectedCustomerId: string;
  onSelectCustomer: (customerId: string) => void;
  maskingEnabled: boolean;
  onToggleMasking: () => void;
}

export const IdentityExplorerView: React.FC<IdentityExplorerViewProps> = ({
  decisions,
  selectedCustomerId,
  onSelectCustomer,
  maskingEnabled,
  onToggleMasking
}) => {
  const currentDecision = decisions.find(d => d.customerId === selectedCustomerId) || decisions[0];
  const identityLinks = currentDecision?.identityGraph || [];

  const confirmedMatches = identityLinks.filter(l => l.confidence === 'CONFIRMED_MATCH');
  const probableMatches = identityLinks.filter(l => l.confidence === 'PROBABLE_MATCH');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Controls: Customer Selector & Masking */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Active Customer Identity Graph
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => onSelectCustomer(e.target.value)}
              className="text-sm font-bold text-slate-900 bg-transparent border-none focus:outline-none cursor-pointer pr-6"
            >
              {decisions.map(d => (
                <option key={d.customerId} value={d.customerId}>
                  {d.customerId} ({d.requestId}) — {d.status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMasking}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            {maskingEnabled ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{maskingEnabled ? 'Masking Active (Safe)' : 'Raw Values Revealed'}</span>
          </button>
        </div>
      </div>

      {/* Visual Identity Graph Canvas */}
      <div className="bg-slate-900 text-slate-200 rounded-lg p-6 border border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Identity Correlation Graph
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {identityLinks.length} Discovered Identifiers Correlated
          </span>
        </div>

        {/* Node Layout Simulation */}
        <div className="py-6 flex flex-col items-center space-y-6">
          {/* Central Root Node */}
          <div className="px-5 py-3 rounded-lg bg-emerald-950 border border-emerald-500/50 shadow-md text-center max-w-sm">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              Root Subject Node
            </div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {currentDecision?.customerId}
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              Request: {currentDecision?.requestId} · Status: {currentDecision?.status}
            </div>
          </div>

          {/* Connected Children Cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {identityLinks.map((link) => {
              const displayVal = maskingEnabled ? link.maskedIdentifierValue : link.rawIdentifierValue;
              let icon = <Mail className="w-3.5 h-3.5 text-slate-400" />;
              if (link.identifierType.includes('PHONE')) icon = <Phone className="w-3.5 h-3.5 text-slate-400" />;
              if (link.identifierType.includes('HASH')) icon = <Hash className="w-3.5 h-3.5 text-slate-400" />;
              if (link.identifierType.includes('NAME')) icon = <User className="w-3.5 h-3.5 text-slate-400" />;

              return (
                <div
                  key={link.id}
                  className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-md space-y-1 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase flex items-center gap-1">
                      {icon}
                      <span>{link.identifierType}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 font-mono">
                      {link.confidence}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white truncate" title={link.rawIdentifierValue}>
                    {displayVal}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Source: {link.sourceFile} ({link.matchingMethod})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deterministic Relationship Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Deterministic Relationship & Provenance Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Traceable evidence proving how each identifier was linked to the subject.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-700 font-mono tabular-nums">
            {confirmedMatches.length} Confirmed Matches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4 font-mono">Type</th>
                <th className="py-2.5 px-4 font-mono">Resolved Value</th>
                <th className="py-2.5 px-4">Classification</th>
                <th className="py-2.5 px-4">Source File</th>
                <th className="py-2.5 px-4">Matching Method</th>
                <th className="py-2.5 px-4">Provenance Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {identityLinks.map(link => {
                const val = maskingEnabled ? link.maskedIdentifierValue : link.rawIdentifierValue;
                return (
                  <tr key={link.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 text-[11px]">
                      {link.identifierType}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-medium">
                      {val}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {link.confidence}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {link.sourceFile}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {link.matchingMethod}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {link.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
