import { AuditFinding, StepPriority } from '../types';
import { ResolvedCustomerIdentity } from './identityResolver';

export function discoverCrossSystemExposure(
  requestId: string,
  identity: ResolvedCustomerIdentity,
  files: Record<string, any[]>
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const { userId, emails, emailHashes, phones } = identity;

  // 1. Customer Accounts DB
  const accounts = files['customer_accounts.csv'] || [];
  accounts.forEach((acc, idx) => {
    if (acc.user_id === userId) {
      const isTombstone = acc.is_tombstone === 'true' || acc.status === 'TOMBSTONE';
      const hasEmail = acc.email && acc.email.trim().length > 0;
      const hasName = acc.full_name && !acc.full_name.includes('[DELETED') && !acc.full_name.includes('[REDACTED');
      const hasPhone = acc.phone && acc.phone.trim().length > 0;

      if (!isTombstone || hasEmail || hasName || hasPhone) {
        findings.push({
          id: `find-acc-${idx}`,
          requestId,
          customerId: userId,
          system: 'Customer Accounts DB',
          category: 'Account Master',
          sourceFile: 'customer_accounts.csv',
          recordRef: `user_id:${acc.user_id}`,
          matchedIdentifierType: 'DIRECT_ACCOUNT_RECORD',
          matchedIdentifierValue: acc.email || acc.user_id,
          policyRequirement: 'RULE-ACC-01: Anonymize name, email, phone. Only internal user_id tombstone permitted.',
          observedState: `Account status=${acc.status}, is_tombstone=${acc.is_tombstone}, email=${acc.email || 'null'}, full_name=${acc.full_name || 'null'}`,
          severity: 'CRITICAL',
          evidenceRef: 'customer_accounts.csv:L' + (idx + 2),
          isCompliant: false,
          details: 'Direct identifiers remain populated in primary account table. Active record persists.'
        });
      } else {
        findings.push({
          id: `find-acc-${idx}`,
          requestId,
          customerId: userId,
          system: 'Customer Accounts DB',
          category: 'Account Master',
          sourceFile: 'customer_accounts.csv',
          recordRef: `user_id:${acc.user_id}`,
          matchedIdentifierType: 'PERMITTED_TOMBSTONE',
          matchedIdentifierValue: acc.user_id,
          policyRequirement: 'RULE-ACC-01: Tombstone permitted with nullified PII.',
          observedState: 'Tombstone verified with no direct identifiers.',
          severity: 'LOW',
          evidenceRef: 'customer_accounts.csv:L' + (idx + 2),
          isCompliant: true,
          details: 'Account successfully tombstoned. Permitted internal ID retained for relational integrity.'
        });
      }
    }
  });

  // 2. CRM Profiles
  const profiles = files['customer_profiles.csv'] || [];
  profiles.forEach((prof, idx) => {
    const emailMatch = prof.crm_email && emails.has(prof.crm_email.toLowerCase().trim());
    const idMatch = prof.user_id === userId;

    if (idMatch || emailMatch) {
      const isPurged = prof.loyalty_tier === 'PURGED' || (!prof.crm_email && !prof.phone);
      if (!isPurged) {
        findings.push({
          id: `find-crm-${idx}`,
          requestId,
          customerId: userId,
          system: 'CRM HubSpot',
          category: 'Marketing & Profile',
          sourceFile: 'customer_profiles.csv',
          recordRef: `profile_id:${prof.profile_id}`,
          matchedIdentifierType: idMatch ? 'USER_ID_FOREIGN_KEY' : 'CRM_EMAIL',
          matchedIdentifierValue: prof.crm_email || prof.user_id,
          policyRequirement: 'RULE-CRM-01: Complete purge required. No CRM profile permitted.',
          observedState: `Active CRM profile with email=${prof.crm_email}, marketing_opt_in=${prof.marketing_opt_in}`,
          severity: 'CRITICAL',
          evidenceRef: 'customer_profiles.csv:L' + (idx + 2),
          isCompliant: false,
          details: 'Customer profile still exists in HubSpot CRM and triggers downstream CDC sync.'
        });
      }
    }
  });

  // 3. Search Indexes (Elasticsearch)
  const searchIndexes = files['search_indexes.csv'] || [];
  searchIndexes.forEach((doc, idx) => {
    const idMatch = doc.user_id === userId;
    const emailMatch = doc.cached_email && emails.has(doc.cached_email.toLowerCase().trim());
    let textMatch = false;
    emails.forEach(e => {
      if (doc.indexed_text && doc.indexed_text.toLowerCase().includes(e)) textMatch = true;
    });

    if (idMatch || emailMatch || textMatch) {
      findings.push({
        id: `find-es-${idx}`,
        requestId,
        customerId: userId,
        system: 'Search Index Elasticsearch',
        category: 'Search & Caching',
        sourceFile: 'search_indexes.csv',
        recordRef: `doc_id:${doc.doc_id} (${doc.index_name})`,
        matchedIdentifierType: emailMatch ? 'CACHED_EMAIL' : 'SEARCH_DOCUMENT_USER_ID',
        matchedIdentifierValue: doc.cached_email || doc.user_id,
        policyRequirement: 'RULE-IDX-01: Hard deletion of search documents within 24h of request.',
        observedState: `Indexed text contains customer data: "${doc.indexed_text}"`,
        severity: 'HIGH',
        evidenceRef: 'search_indexes.csv:L' + (idx + 2),
        isCompliant: false,
        details: 'Cached search index document was never purged from Elasticsearch cluster.'
      });
    }
  });

  // 4. Analytics Exports (Snowflake)
  const analytics = files['analytics_exports.csv'] || [];
  analytics.forEach((exp, idx) => {
    const idMatch = exp.user_id === userId;
    const emailMatch = exp.raw_email && emails.has(exp.raw_email.toLowerCase().trim());
    const hashMatch = exp.email_hash && emailHashes.has(exp.email_hash.trim());

    if (idMatch || emailMatch || hashMatch) {
      const hasRawPii = !!(exp.raw_email && exp.raw_email.trim());
      const hasProhibitedHash = !!(exp.email_hash && exp.email_hash.trim());

      if (hasRawPii || hasProhibitedHash) {
        findings.push({
          id: `find-anl-${idx}`,
          requestId,
          customerId: userId,
          system: 'Analytics Snowflake',
          category: 'BI & Export Logs',
          sourceFile: 'analytics_exports.csv',
          recordRef: `export_id:${exp.export_id} (${exp.table_name})`,
          matchedIdentifierType: hasRawPii ? 'RAW_ANALYTICS_EMAIL' : 'PROHIBITED_SHA256_HASH',
          matchedIdentifierValue: exp.raw_email || exp.email_hash,
          policyRequirement: 'RULE-ANL-01: Remove raw emails and reversible SHA-256 hashes from BI exports.',
          observedState: `Unscrubbed export contains raw_email=${exp.raw_email || 'null'}, hash=${exp.email_hash ? exp.email_hash.slice(0, 10) + '...' : 'null'}`,
          severity: 'HIGH',
          evidenceRef: 'analytics_exports.csv:L' + (idx + 2),
          isCompliant: false,
          details: 'Data warehouse weekly cohort export contains personal email and linkable hash.'
        });
      }
    }
  });

  // 5. Support Attachments (Zendesk / S3)
  const attachments = files['support_attachments.csv'] || [];
  attachments.forEach((att, idx) => {
    if (att.user_id === userId) {
      const isRedacted = att.is_redacted === 'true';
      const containsPii = att.contains_pii === 'true';

      if (!isRedacted && containsPii) {
        findings.push({
          id: `find-sup-${idx}`,
          requestId,
          customerId: userId,
          system: 'Support Zendesk S3',
          category: 'Customer Support & Attachments',
          sourceFile: 'support_attachments.csv',
          recordRef: `attachment_id:${att.attachment_id} (Ticket ${att.ticket_id})`,
          matchedIdentifierType: 'IDENTITY_DOCUMENT_ATTACHMENT',
          matchedIdentifierValue: att.file_name,
          policyRequirement: 'RULE-SUP-01: Verification and identity attachments must be permanently unlinked and deleted.',
          observedState: `Unredacted file "${att.file_name}" stored in ${att.file_path}. PII detected: ${att.pii_types_detected}`,
          severity: 'CRITICAL',
          evidenceRef: 'support_attachments.csv:L' + (idx + 2),
          isCompliant: false,
          details: 'Sensitive identity scan (driver license/passport) remains stored unredacted in S3 support bucket.'
        });
      } else if (isRedacted) {
        findings.push({
          id: `find-sup-${idx}`,
          requestId,
          customerId: userId,
          system: 'Support Zendesk S3',
          category: 'Customer Support & Attachments',
          sourceFile: 'support_attachments.csv',
          recordRef: `attachment_id:${att.attachment_id}`,
          matchedIdentifierType: 'VERIFIED_PURGED_OBJECT',
          matchedIdentifierValue: att.file_name,
          policyRequirement: 'RULE-SUP-01: Redacted/purged ticket attachment.',
          observedState: 'Attachment purged and replaced with tombstone.',
          severity: 'LOW',
          evidenceRef: 'support_attachments.csv:L' + (idx + 2),
          isCompliant: true,
          details: 'Support attachment was verified permanently purged from S3 storage.'
        });
      }
    }
  });

  // 6. Orders and Payments (Retention Exception vs Personal Information)
  const orders = files['orders.csv'] || [];
  orders.forEach((ord, idx) => {
    if (ord.user_id === userId) {
      const hasShippingName = ord.shipping_name && !ord.shipping_name.includes('[REDACTED');
      const hasShippingAddress = ord.shipping_address && !ord.shipping_address.includes('[REDACTED');

      if (hasShippingName || hasShippingAddress) {
        findings.push({
          id: `find-ord-${idx}`,
          requestId,
          customerId: userId,
          system: 'Order & Payment Ledger',
          category: 'Financial & Tax Records',
          sourceFile: 'orders.csv',
          recordRef: `order_id:${ord.order_id}`,
          matchedIdentifierType: 'SHIPPING_PERSONAL_DATA',
          matchedIdentifierValue: ord.shipping_name,
          policyRequirement: 'RULE-FIN-01: Retain financial order records for 7 years, but redact customer shipping name and street address.',
          observedState: `Order retained with unredacted shipping_name="${ord.shipping_name}", address="${ord.shipping_address}"`,
          severity: 'MEDIUM',
          evidenceRef: 'orders.csv:L' + (idx + 2),
          isCompliant: false,
          details: 'Financial record is correctly retained for statutory audit, but contains unredacted physical shipping address.'
        });
      } else {
        findings.push({
          id: `find-ord-${idx}`,
          requestId,
          customerId: userId,
          system: 'Order & Payment Ledger',
          category: 'Financial & Tax Records',
          sourceFile: 'orders.csv',
          recordRef: `order_id:${ord.order_id}`,
          matchedIdentifierType: 'PERMITTED_LEGAL_RETENTION',
          matchedIdentifierValue: ord.order_id,
          policyRequirement: 'RULE-FIN-01: Permitted statutory tax retention under IRS 26 U.S.C. § 6001.',
          observedState: `Tax order preserved for 7-year audit with redacted shipping identifiers. Amount: $${ord.total_amount}`,
          severity: 'LOW',
          evidenceRef: 'orders.csv:L' + (idx + 2),
          isCompliant: true,
          details: 'Tax ledger entry properly preserved under legal retention exception with anonymized delivery details.'
        });
      }
    }
  });

  // 7. Payment Records
  const payments = files['payment_records.csv'] || [];
  payments.forEach((pay, idx) => {
    if (pay.user_id === userId) {
      const hasUnredactedBilling = pay.billing_address && !pay.billing_address.includes('[REDACTED');
      if (hasUnredactedBilling) {
        findings.push({
          id: `find-pay-${idx}`,
          requestId,
          customerId: userId,
          system: 'Order & Payment Ledger',
          category: 'Payment Records',
          sourceFile: 'payment_records.csv',
          recordRef: `payment_id:${pay.payment_id}`,
          matchedIdentifierType: 'BILLING_ADDRESS_PII',
          matchedIdentifierValue: pay.billing_address,
          policyRequirement: 'RULE-FIN-01: Anonymize billing address in retained transaction tokens.',
          observedState: `Payment record retains full street billing address: "${pay.billing_address}"`,
          severity: 'MEDIUM',
          evidenceRef: 'payment_records.csv:L' + (idx + 2),
          isCompliant: false,
          details: 'Payment record retained for financial reconciliation holds unmasked physical billing address.'
        });
      }
    }
  });

  // 8. Application Logs (DataDog)
  const appLogs = files['application_logs.csv'] || [];
  appLogs.forEach((log, idx) => {
    let emailInPayload = false;
    emails.forEach(e => {
      if (log.payload_excerpt && log.payload_excerpt.toLowerCase().includes(e)) emailInPayload = true;
    });

    if (log.user_id === userId && emailInPayload && log.event_type !== 'DELETION_SUBMITTED' && log.event_type !== 'REGISTRATION_COLLISION_ERROR') {
      findings.push({
        id: `find-log-${idx}`,
        requestId,
        customerId: userId,
        system: 'Application Logs DataDog',
        category: 'Application & Security Logs',
        sourceFile: 'application_logs.csv',
        recordRef: `log_id:${log.log_id} (${log.service})`,
        matchedIdentifierType: 'PLAIN_TEXT_LOG_PII',
        matchedIdentifierValue: log.user_id,
        policyRequirement: 'RULE-LOG-01: Mask or sanitize raw email payloads in operational logs.',
        observedState: `Log message contains raw email: "${log.payload_excerpt}"`,
        severity: 'LOW',
        evidenceRef: 'application_logs.csv:L' + (idx + 2),
        isCompliant: false,
        details: 'Operational logging pipeline recorded unmasked email in service payload.'
      });
    }
  });

  return findings;
}
