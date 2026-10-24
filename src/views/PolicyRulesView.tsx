import React from 'react';
import { DatasetPackage } from '../types';
import {
  ShieldCheck,
  Scale,
  Lock,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';

interface PolicyRulesViewProps {
  dataset: DatasetPackage;
}

export const PolicyRulesView: React.FC<PolicyRulesViewProps> = ({ dataset }) => {
  const rules = dataset.files['deletion_rules.csv'] || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Info */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Deletion Policy & Rules Engine
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Authoritative policy specification loaded from <span className="font-mono text-slate-700">deletion_rules.csv</span>.
          Defines treatment actions, permitted identifiers, prohibited fields, and statutory retention exceptions.
        </p>
      </div>

      {/* Two Explainer Cards: Tombstone vs Financial Retention */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tombstone Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Account Tombstone Policy</span>
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Relational Integrity Without Personal Identifiers
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The internal <span className="font-mono font-semibold text-slate-800">user_id</span> UUID is permitted to remain in the primary database with <span className="font-mono text-slate-800">is_tombstone=true</span> to preserve relational foreign keys for historical orders. Direct identifiers (full name, email, phone) and reversible SHA-256 hashes MUST be nullified. The tombstone must never permit identity re-association.
          </p>
        </div>

        {/* Financial Retention Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <Scale className="w-4 h-4 text-amber-600" />
            <span>Statutory 7-Year Tax Exception</span>
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            IRS 26 U.S.C. § 6001 & Commercial Ledgers
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Orders and payment settlements MUST be preserved for 7 years to satisfy statutory tax and commercial accounting mandates. Never delete a legally required financial record simply to pass an audit. Instead, customer delivery names and street addresses are redacted while preserving the transaction amounts and tax codes.
          </p>
        </div>
      </div>

      {/* Authoritative Rules Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Authoritative Deletion Rules Directory ({rules.length} Rules)
          </h3>
          <span className="text-xs font-mono text-slate-500">Source: deletion_rules.csv</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3 font-mono">Rule ID</th>
                <th className="py-2.5 px-3">System Name</th>
                <th className="py-2.5 px-3">Data Category</th>
                <th className="py-2.5 px-3 font-mono">Required Treatment</th>
                <th className="py-2.5 px-3">Permitted Fields</th>
                <th className="py-2.5 px-3">Prohibited Fields</th>
                <th className="py-2.5 px-3">Legal Basis</th>
                <th className="py-2.5 px-3 font-mono">Required Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {rules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 text-[11px]">
                    {rule.rule_id}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {rule.system_name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {rule.data_category}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-emerald-800 text-[11px]">
                    {rule.required_action}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                    {rule.permitted_identifiers}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-rose-700">
                    {rule.prohibited_identifiers}
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px]">
                    {rule.legal_basis}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                    {rule.evidence_required}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
