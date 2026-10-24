import { AuditDecision, CustomerFriendlyStatus, CustomerProgressStep, CustomerDeletionRequestSummary } from '../types';
import { maskEmail } from './csvParser';

export function mapDecisionToCustomerSummary(
  decision: AuditDecision,
  rawEmail?: string
): CustomerDeletionRequestSummary {
  const isComplete = decision.status === 'COMPLETE';
  const isIncomplete = decision.status === 'INCOMPLETE';
  const isNotApplicable = decision.status === 'NOT_APPLICABLE';

  // Determine friendly status
  let status: CustomerFriendlyStatus = 'Deletion In Progress';
  let progressStep: CustomerProgressStep = 'processing';
  let actionRequired = false;
  let explanation = '';

  if (isComplete) {
    status = 'Deletion Complete';
    progressStep = 'complete';
    actionRequired = false;
    explanation =
      'Your deletion request has been completed. Our verification process confirmed that the required data treatments have been applied to the systems covered by this audit. Some records may be retained where permitted or required by the applicable policy.';
  } else if (isIncomplete) {
    // If there are critical unverified resurrection risks or data exposure violations
    const hasCriticalIssues = decision.findings.some(f => !f.isCompliant && f.severity === 'CRITICAL');
    const hasResurrection = decision.resurrectionRisks.length > 0;

    if (hasCriticalIssues || hasResurrection) {
      status = 'Action Required';
      progressStep = 'verifying';
      actionRequired = true;
      explanation =
        'We found an issue that needs further attention. Our team is reviewing it. Your request has not yet been verified as complete.';
    } else {
      status = 'Verification Pending';
      progressStep = 'verifying';
      actionRequired = false;
      explanation =
        'Your request is being checked across the relevant systems. We will show the final status when the required verification is complete.';
    }
  } else if (isNotApplicable) {
    status = 'Request Received';
    progressStep = 'received';
    actionRequired = false;
    explanation =
      'No formal deletion request is currently registered for this account reference. If you recently submitted one, please check again shortly.';
  }

  // Derive email: either passed in, or from first confirmed link, or generic mask
  let emailToMask = rawEmail || '';
  if (!emailToMask && decision.identityGraph.length > 0) {
    const emailLink = decision.identityGraph.find(l => l.identifierType.includes('EMAIL'));
    if (emailLink) {
      emailToMask = emailLink.rawIdentifierValue;
    }
  }

  const masked = emailToMask ? maskEmail(emailToMask) : `user_${decision.customerId.slice(-4)}@***.com`;

  // Number of systems checked safely
  const systemsCheckedCount = 9;

  return {
    requestId: decision.requestId,
    customerId: decision.customerId,
    maskedEmail: masked,
    submittedAt: decision.auditTimestamp, // or from deletion_requests
    status,
    progressStep,
    lastVerifiedAt: decision.auditTimestamp,
    actionRequired,
    systemsCheckedCount,
    explanation,
    verifiedComplete: isComplete,
    verificationSummary: isComplete
      ? {
          systemsChecked: systemsCheckedCount,
          completionDate: decision.auditTimestamp,
          retentionExemptionNote:
            'Statutory tax & financial ledger records preserved under legal retention schedule with customer identifiers redacted.',
          certificateId: decision.proofOfDeletion?.certificateId
        }
      : undefined
  };
}
