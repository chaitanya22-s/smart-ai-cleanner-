export type AuditDecisionStatus = 'COMPLETE' | 'INCOMPLETE' | 'NOT_APPLICABLE';

export type MatchConfidence = 'CONFIRMED_MATCH' | 'PROBABLE_MATCH' | 'UNRELATED' | 'REQUIRES_REVIEW';

export type ActionType = 'DELETE' | 'REDACT' | 'ANONYMIZE' | 'RETAIN' | 'PURGE' | 'RECONCILE' | 'DISABLE' | 'VERIFY';

export type StepPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type StepStatus = 'PROPOSED' | 'APPROVED' | 'IN_PROGRESS' | 'BLOCKED' | 'VERIFIED';

export type Complexity = 'LOW' | 'MEDIUM' | 'HIGH';

export type ProcessType = 'SYNC' | 'IMPORT' | 'REPLICATION' | 'RESTORE' | 'EVENT_REPLAY' | 'RETRY_QUEUE';

export type ProcessState = 'ACTIVE' | 'HISTORICAL' | 'FAILED' | 'UNKNOWN';

export type CustomerFriendlyStatus =
  | 'Request Received'
  | 'Deletion In Progress'
  | 'Verification Pending'
  | 'Deletion Complete'
  | 'Action Required';

export type CustomerProgressStep =
  | 'received'
  | 'searching'
  | 'processing'
  | 'verifying'
  | 'complete';

export interface CustomerDeletionRequestSummary {
  requestId: string;
  customerId: string;
  maskedEmail: string;
  submittedAt: string;
  status: CustomerFriendlyStatus;
  progressStep: CustomerProgressStep;
  lastVerifiedAt: string;
  actionRequired: boolean;
  systemsCheckedCount: number;
  explanation: string;
  verifiedComplete: boolean;
  verificationSummary?: {
    systemsChecked: number;
    completionDate: string;
    retentionExemptionNote: string;
    certificateId?: string;
  };
}

export interface AuditFinding {
  id: string;
  requestId: string;
  customerId: string;
  system: string;
  category: string;
  sourceFile: string;
  recordRef: string;
  matchedIdentifierType: string;
  matchedIdentifierValue: string;
  policyRequirement: string;
  observedState: string;
  severity: StepPriority;
  evidenceRef: string;
  isCompliant: boolean;
  details: string;
}

export interface ResurrectionRisk {
  id: string;
  processId: string;
  processType: ProcessType;
  sourceSystem: string;
  destSystem: string;
  executionTimestamp: string;
  sourceRecordRef: string;
  evidenceSnippet: string;
  status: ProcessState;
  confidence: 'CONFIRMED' | 'SUSPECTED' | 'UNVERIFIED';
  requiredRemediation: string;
  affectedCustomerId: string;
  recreationTrigger: string;
}

export interface RemediationStep {
  id: string;
  stepNumber: number;
  priority: StepPriority;
  system: string;
  recordReference: string;
  problemDescription: string;
  applicableRule: string;
  action: ActionType;
  affectedFields: string[];
  prerequisites: string[];
  recommendedProcedure: string;
  expectedOutcome: string;
  verificationMethod: string;
  evidenceRequired: string;
  responsibleTeam: string;
  estimatedComplexity: Complexity;
  state: StepStatus;
  isExecuted?: boolean;
}

export interface IdentityLink {
  id: string;
  userId: string;
  identifierType: string;
  rawIdentifierValue: string;
  maskedIdentifierValue: string;
  confidence: MatchConfidence;
  sourceFile: string;
  sourceRecordId: string;
  matchingMethod: string;
  reason: string;
  isHistorical?: boolean;
}

export interface AuditScoreBreakdown {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  unresolvedChecks: number;
  notApplicableChecks: number;
  scorePercentage: number;
}

export interface EvaluatedCategory {
  pass: boolean;
  status: 'PASS' | 'FAIL' | 'UNRESOLVED' | 'NOT_APPLICABLE';
  summary: string;
  details: string[];
}

export interface ProofOfDeletionDocument {
  certificateId: string;
  deletionRequestId: string;
  auditRunId: string;
  auditTimestamp: string;
  customerReference: string;
  resolvedInternalId: string;
  systemsSearched: string[];
  searchScopeAndCoverage: string[];
  policyRulesEvaluated: string[];
  categoryVerifications: {
    system: string;
    category: string;
    requiredAction: string;
    verificationResult: 'VERIFIED_DELETION' | 'VERIFIED_REDACTION' | 'VERIFIED_ANONYMIZATION' | 'PERMITTED_RETAINED_DATA' | 'VERIFIED_ABSENCE';
    evidenceReference: string;
    verifiedTimestamp: string;
  }[];
  resurrectionVerification: {
    syncJobsChecked: number;
    restorePipelinesChecked: number;
    replicationQueuesChecked: number;
    unresolvedPathsCount: number;
    statement: string;
  };
  retentionComplianceStatement: string;
  tombstoneComplianceStatement: string;
  remainingScopeLimitations: string[];
  legalAttestation: string;
}

export interface AuditDecision {
  requestId: string;
  customerId: string;
  status: AuditDecisionStatus;
  score: AuditScoreBreakdown;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  humanExplanation: string;
  supportingEvidence: string[];
  unresolvedIssues: string[];
  recommendedNextSteps: string[];
  evaluatedCategories: {
    requestValidation: EvaluatedCategory;
    identityCoverage: EvaluatedCategory;
    dataTreatment: EvaluatedCategory;
    processSafety: EvaluatedCategory;
    retentionCompliance: EvaluatedCategory;
    evidenceQuality: EvaluatedCategory;
  };
  proofOfDeletion?: ProofOfDeletionDocument;
  remediationPlan?: RemediationStep[];
  findings: AuditFinding[];
  resurrectionRisks: ResurrectionRisk[];
  identityGraph: IdentityLink[];
  auditTimestamp: string;
  runId: string;
}

// Raw File Package Representation
export interface DatasetPackage {
  files: Record<string, any[]>;
  metadata: {
    packageName: string;
    fileCount: number;
    totalRows: number;
    uploadedAt: string;
    schemaHealth: {
      fileName: string;
      detectedColumns: string[];
      rowCount: number;
      hasErrors: boolean;
      issues: string[];
    }[];
  };
}

export interface AuditRunHistoryItem {
  runId: string;
  timestamp: string;
  datasetName: string;
  totalRequests: number;
  completeCount: number;
  incompleteCount: number;
  notApplicableCount: number;
  openCriticalRisks: number;
  notes: string;
}
