import React from 'react';
import { AuditDecisionStatus } from '../types';
import { CheckCircle2, AlertTriangle, MinusCircle } from 'lucide-react';

interface Props {
  status: AuditDecisionStatus;
  showIcon?: boolean;
  className?: string;
}

export const AuditStatusBadge: React.FC<Props> = ({ status, showIcon = true, className = '' }) => {
  switch (status) {
    case 'COMPLETE':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold text-xs text-emerald-800 ${className}`}>
          {showIcon && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          <span>COMPLETE</span>
        </span>
      );
    case 'INCOMPLETE':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold text-xs text-rose-800 ${className}`}>
          {showIcon && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>INCOMPLETE</span>
        </span>
      );
    case 'NOT_APPLICABLE':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-xs text-slate-600 ${className}`}>
          {showIcon && <MinusCircle className="w-4 h-4 text-slate-500 shrink-0" />}
          <span>NOT_APPLICABLE</span>
        </span>
      );
    default:
      return <span className="text-xs text-slate-600">{status}</span>;
  }
};
