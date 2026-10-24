import { RemediationStep, AuditFinding, ResurrectionRisk } from '../types';
import { ResolvedCustomerIdentity } from './identityResolver';

export function generateRemediationPlan(
  requestId: string,
  identity: ResolvedCustomerIdentity,
  findings: AuditFinding[],
  risks: ResurrectionRisk[]
): RemediationStep[] {
  const steps: RemediationStep[] = [];
  const openViolations = findings.filter(f => !f.isCompliant);
  const { userId } = identity;

  let stepNumber = 1;

  // Step 1: Request & Identity Verification
  steps.push({
    id: `step-${stepNumber}`,
    stepNumber: stepNumber++,
    priority: 'HIGH',
    system: 'Privacy Operations Portal',
    recordReference: `request_id:${requestId}`,
    problemDescription: 'Verify authenticity of deletion request and map all historical customer identifiers.',
    applicableRule: 'RULE-ACC-01 / Identity Governance',
    action: 'VERIFY',
    affectedFields: ['request_id', 'customer_id', 'identity_proof'],
    prerequisites: ['User identity verification token received'],
    recommendedProcedure: 'Confirm identity proof from portal and lock account from inbound OAuth logins.',
    expectedOutcome: 'Identity graph fully anchored to customer user_id.',
    verificationMethod: 'Review identity_history.csv cryptographic hash links.',
    evidenceRequired: 'ID_VERIFY_PASS certificate logged in audit ledger.',
    responsibleTeam: 'Privacy Operations',
    estimatedComplexity: 'LOW',
    state: 'VERIFIED',
    isExecuted: true
  });

  // Step 2: Legal Retention Preservation
  steps.push({
    id: `step-${stepNumber}`,
    stepNumber: stepNumber++,
    priority: 'CRITICAL',
    system: 'Order & Payment Ledger',
    recordReference: `user_id:${userId} orders & payments`,
    problemDescription: 'Flag and isolate statutory 7-year tax orders and payment tokens prior to any destructive purge.',
    applicableRule: 'RULE-FIN-01 / IRS 26 U.S.C. § 6001',
    action: 'RETAIN',
    affectedFields: ['order_id', 'amount', 'tax_code', 'currency', 'retained_for_tax'],
    prerequisites: ['Step 1'],
    recommendedProcedure: 'Mark orders with retained_for_tax=true and ensure foreign keys point to stable internal tombstone.',
    expectedOutcome: 'Tax and accounting ledger entries are protected from premature deletion.',
    verificationMethod: 'SELECT count(*) FROM orders WHERE user_id = :id AND retained_for_tax = true',
    evidenceRequired: 'AUDIT_RETENTION_FLAG confirmation log.',
    responsibleTeam: 'Finance & Compliance Engineering',
    estimatedComplexity: 'LOW',
    state: 'APPROVED',
    isExecuted: false
  });

  // Step 3: Halt and Purge Resurrecting Pipelines (Sync, CDC, Replicas)
  if (risks.length > 0) {
    const primaryRisk = risks[0];
    steps.push({
      id: `step-${stepNumber}`,
      stepNumber: stepNumber++,
      priority: 'CRITICAL',
      system: primaryRisk.sourceSystem,
      recordReference: primaryRisk.sourceRecordRef,
      problemDescription: `Halt synchronization pipeline causing write-after-deletion: ${primaryRisk.recreationTrigger}`,
      applicableRule: 'RULE-SYNC-01 / System Integrity',
      action: 'DISABLE',
      affectedFields: ['sync_job_schedule', 'cdc_event_queue', 'retry_payloads'],
      prerequisites: ['Step 2'],
      recommendedProcedure: 'Pause job schedule or configure topic consumer filter to reject upserts for deleted customer IDs.',
      expectedOutcome: 'No downstream synchronization job can push dirty customer records back into master database.',
      verificationMethod: 'Verify sync job status is paused or deletion tombstone filter is enabled.',
      evidenceRequired: 'CDC_TOMBSTONE_VERIFICATION acknowledgment.',
      responsibleTeam: 'Data Platform & Infrastructure',
      estimatedComplexity: 'HIGH',
      state: 'PROPOSED',
      isExecuted: false
    });

    steps.push({
      id: `step-${stepNumber}`,
      stepNumber: stepNumber++,
      priority: 'CRITICAL',
      system: 'Kafka Sync Pipeline',
      recordReference: `topic:customers.cdc:${userId}`,
      problemDescription: 'Sanitize queued and retry payloads in message broker containing unredacted customer PII.',
      applicableRule: 'RULE-SYNC-01',
      action: 'PURGE',
      affectedFields: ['email', 'phone', 'payload_sample'],
      prerequisites: [`Step ${stepNumber - 1}`],
      recommendedProcedure: 'Emit Kafka tombstone record (null value) for customer key to trigger log compaction.',
      expectedOutcome: 'Kafka queue compacted and old customer records eradicated from broker logs.',
      verificationMethod: 'Kafka topic consumer inspection confirming zero uncompacted payloads.',
      evidenceRequired: 'KAFKA_COMPACTION_OFFSET_CERTIFICATE',
      responsibleTeam: 'Data Infrastructure',
      estimatedComplexity: 'MEDIUM',
      state: 'PROPOSED',
      isExecuted: false
    });
  }

  // Step 4: Primary Account DB Tombstone Conversion
  const accViolation = openViolations.find(v => v.system === 'Customer Accounts DB');
  if (accViolation) {
    steps.push({
      id: `step-${stepNumber}`,
      stepNumber: stepNumber++,
      priority: 'CRITICAL',
      system: 'Customer Accounts DB',
      recordReference: `customer_accounts:user_id=${userId}`,
      problemDescription: 'Convert active customer account into compliant tombstone: nullify name, email, phone, and password hash.',
      applicableRule: 'RULE-ACC-01',
      action: 'ANONYMIZE',
      affectedFields: ['email', 'phone', 'full_name', 'status', 'is_tombstone'],
      prerequisites: ['Step 2'],
      recommendedProcedure: `UPDATE customer_accounts SET email = NULL, phone = NULL, full_name = '[DELETED_TOMBSTONE]', status = 'TOMBSTONE', is_tombstone = true, updated_at = NOW() WHERE user_id = '${userId}';`,
      expectedOutcome: 'Account retains only internal user_id for relational integrity; all direct PII completely erased.',
      verificationMethod: 'Execute SELECT email, phone, full_name FROM customer_accounts WHERE user_id = :id; assert all are null.',
      evidenceRequired: 'DB_TOMBSTONE_VERIFICATION SQL audit log.',
      responsibleTeam: 'Core Identity Engineering',
      estimatedComplexity: 'LOW',
      state: 'PROPOSED',
      isExecuted: false
    });
  }

  // Step 5: CRM HubSpot Profile Hard Purge
  const crmViolation = openViolations.find(v => v.system === 'CRM HubSpot');
  if (crmViolation) {
    steps.push({
      id: `step-${stepNumber}`,
      stepNumber: stepNumber++,
      priority: 'CRITICAL',
      system: 'CRM HubSpot',
      recordReference: crmViolation.recordRef,
      problemDescription: 'Hard delete CRM customer profile and opt-out records to prevent re-seeding.',
      applicableRule: 'RULE-CRM-01',
      action: 'PURGE',
      affectedFields: ['crm_email', 'phone', 'marketing_opt_in', 'loyalty_tier'],
      prerequisites: ['Step 3'],
      recommendedProcedure: `Invoke HubSpot REST API: DELETE https://api.hubapi.com/crm/v3/objects/contacts/${crmViolation.recordRef.split(':')[1]}?archive=false`,
      expectedOutcome: 'Customer profile permanently deleted from CRM and absent from marketing mailing lists.',
      verificationMethod: 'HTTP GET on contact ID returns 404 Not Found.',
      evidenceRequired: 'CRM_API_DELETE_204 response receipt.',
      responsibleTeam: 'Marketing Operations',
      estimatedComplexity: 'LOW',
      state: 'PROPOSED',
      isExecuted: false
    });
  }

  // Step 6: Search Index Invalidation (Elasticsearch)
  const esViolation = openViolations.find(v => v.system === 'Search Index Elasticsearch');
  if (esViolation) {
    steps.push({
      id: `step-${stepNumber}`,
      stepNumber: stepNumber++,
      priority: 'HIGH',
      system: 'Search Index Elasticsearch',
      recordReference: esViolation.recordRef,
      problemDescription: 'Evict and purge cached search index documents containing customer name and email.',
      applicableRule: 'RULE-IDX-01',
      action: 'DELETE',
      affectedFields: ['cached_email', 'cached_name', 'indexed_text'],
      prerequisites: ['Step 4'],
      recommendedProcedure: `DELETE /customers_v3/_doc/${esViolation.recordRef.split(' ')[0].replace('doc_id:', '')}`,
      expectedOutcome: 'Elasticsearch document removed from index and refresh cycle executed.',
      verificationMethod: 'Query Elasticsearch index by customer email; assert zero hits.',
      evidenceRequired: 'ELASTICSEARCH_DOC_404 confirmation.',
      responsibleTeam: 'Search Engineering',
      estimatedComplexity: 'LOW',
      state: 'PROPOSED',
      isExecuted: false
    });
  }

  // Step 7: Analytics Export Scrubbing (Snowflake)
  const anlViolation = openViolations.find(v => v.system === 'Analytics Snowflake');
  if (anlViolation) {
    steps.push({
      id: `step-${stepNumber}`,
      stepNumber: stepNumber++,
      priority: 'HIGH',
      system: 'Analytics Snowflake',
      recordReference: anlViolation.recordRef,
      problemDescription: 'Scrub raw email and reversible SHA-256 hash from Snowflake analytics tables and historical export dumps.',
      applicableRule: 'RULE-ANL-01',
      action: 'REDACT',
      affectedFields: ['raw_email', 'email_hash'],
      prerequisites: ['Step 4'],
      recommendedProcedure: `UPDATE weekly_cohort_activity SET raw_email = NULL, email_hash = NULL, user_id = '[ANONYMIZED_USER]' WHERE user_id = '${userId}';`,
      expectedOutcome: 'Aggregated analytics metrics remain intact for reporting while personal identifiers are scrubbed.',
      verificationMethod: 'Run analytics query checking for matching email or hash; expect 0 rows.',
      evidenceRequired: 'ETL_SCRUB_LOG audit receipt.',
      responsibleTeam: 'Data Platform',
      estimatedComplexity: 'MEDIUM',
      state: 'PROPOSED',
      isExecuted: false
    });
  }

  // Step 8: Support Document Shredding (Zendesk / S3)
  const supViolation = openViolations.find(v => v.system === 'Support Zendesk S3');
  if (supViolation) {
    steps.push({
      id: `step-${stepNumber}`,
      stepNumber: stepNumber++,
      priority: 'CRITICAL',
      system: 'Support Zendesk S3',
      recordReference: supViolation.recordRef,
      problemDescription: 'Permanently purge sensitive identity verification documents (driver license/passport scans) from S3.',
      applicableRule: 'RULE-SUP-01',
      action: 'PURGE',
      affectedFields: ['file_path', 'contains_pii', 'pii_types_detected'],
      prerequisites: ['Step 1'],
      recommendedProcedure: 'Execute S3 DeleteObject API and replace attachment pointer with redacted tombstone marker.',
      expectedOutcome: 'File binary destroyed from object storage; support ticket metadata unlinked.',
      verificationMethod: 'AWS S3 HeadObject returns 404 Not Found.',
      evidenceRequired: 'S3_OBJECT_DELETE_LOG with cryptographic erasure confirmation.',
      responsibleTeam: 'Customer Experience Operations',
      estimatedComplexity: 'LOW',
      state: 'PROPOSED',
      isExecuted: false
    });
  }

  // Step 9: Redact Shipping Address on Retained Orders
  const ordViolation = openViolations.find(v => v.system === 'Order & Payment Ledger');
  if (ordViolation) {
    steps.push({
      id: `step-${stepNumber}`,
      stepNumber: stepNumber++,
      priority: 'MEDIUM',
      system: 'Order & Payment Ledger',
      recordReference: `orders:user_id=${userId}`,
      problemDescription: 'Redact customer shipping name and physical address from retained statutory tax orders.',
      applicableRule: 'RULE-FIN-01',
      action: 'REDACT',
      affectedFields: ['shipping_name', 'shipping_address'],
      prerequisites: ['Step 2'],
      recommendedProcedure: `UPDATE orders SET shipping_name = '[REDACTED_FINANCIAL_RETENTION]', shipping_address = '[REDACTED_FINANCIAL_RETENTION]' WHERE user_id = '${userId}';`,
      expectedOutcome: 'Tax ledger order preserved with anonymized shipping destination.',
      verificationMethod: 'Verify shipping fields contain redaction placeholder.',
      evidenceRequired: 'FINANCIAL_REDACTION_AUDIT_LOG',
      responsibleTeam: 'Finance Engineering',
      estimatedComplexity: 'LOW',
      state: 'PROPOSED',
      isExecuted: false
    });
  }

  // Step 10: Disaster Recovery Snapshot Reconciliation Policy
  steps.push({
    id: `step-${stepNumber}`,
    stepNumber: stepNumber++,
    priority: 'HIGH',
    system: 'Backup & Restore Systems',
    recordReference: 'DR_SNAPSHOT_RECONCILIATION_GATE',
    problemDescription: 'Enforce DR restore-time reconciliation to ensure cold backup restores apply deletion ledger.',
    applicableRule: 'RULE-BAK-01',
    action: 'RECONCILE',
    affectedFields: ['restore_jobs', 'snapshot_reconciliation'],
    prerequisites: ['Step 4'],
    recommendedProcedure: 'Deploy Terraform post-restore lifecycle hook running deletion tombstone sync script.',
    expectedOutcome: 'Any subsequent backup restoration automatically cleanses resurrected records before live traffic.',
    verificationMethod: 'Simulate staging restore with test tombstone.',
    evidenceRequired: 'RESTORE_RECONCILIATION_AUDIT',
    responsibleTeam: 'DevOps & SRE',
    estimatedComplexity: 'MEDIUM',
    state: 'PROPOSED',
    isExecuted: false
  });

  // Step 11: Final Full Cross-System Verification Audit
  steps.push({
    id: `step-${stepNumber}`,
    stepNumber: stepNumber++,
    priority: 'HIGH',
    system: 'Audit Decision Engine',
    recordReference: `audit_run:${requestId}`,
    problemDescription: 'Re-scan all 19 systems with identity graph to confirm zero remaining PII and zero resurrection risks.',
    applicableRule: 'Full Compliance Verification',
    action: 'VERIFY',
    affectedFields: ['all_connected_systems'],
    prerequisites: [`Step ${stepNumber - 1}`],
    recommendedProcedure: 'Trigger complete independent deletion audit run; verify status evaluates to COMPLETE.',
    expectedOutcome: 'Audit decision transitions to COMPLETE with 100% passing checks and Proof of Deletion certificate.',
    verificationMethod: 'Deterministic Decision Engine audit report.',
    evidenceRequired: 'PROOF_OF_DELETION_CERTIFICATE_SIGNED',
    responsibleTeam: 'Lead Privacy Auditor',
    estimatedComplexity: 'LOW',
    state: 'PROPOSED',
    isExecuted: false
  });

  return steps;
}
