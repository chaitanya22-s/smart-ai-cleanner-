import { DatasetPackage } from '../types';
import { NORTHSTAR_INCIDENT_DATASET } from './defaultDataset';

export function createSanitizedPostRemediationDataset(): DatasetPackage {
  // Deep clone incident dataset
  const baseFiles = JSON.parse(JSON.stringify(NORTHSTAR_INCIDENT_DATASET.files));

  // 1. Sanitize customer_accounts.csv: convert CUST-84920 to clean tombstone
  baseFiles['customer_accounts.csv'] = baseFiles['customer_accounts.csv'].map((acc: any) => {
    if (acc.user_id === 'CUST-84920') {
      return {
        ...acc,
        email: '',
        phone: '',
        full_name: '[DELETED_TOMBSTONE]',
        status: 'TOMBSTONE',
        is_tombstone: 'true',
        updated_at: '2024-04-10T15:00:00Z'
      };
    }
    return acc;
  });

  // 2. Sanitize customer_profiles.csv: purge CUST-84920
  baseFiles['customer_profiles.csv'] = baseFiles['customer_profiles.csv'].map((prof: any) => {
    if (prof.user_id === 'CUST-84920') {
      return {
        ...prof,
        crm_email: '',
        phone: '',
        marketing_opt_in: 'false',
        loyalty_tier: 'PURGED',
        last_synced_at: '2024-04-10T15:00:00Z'
      };
    }
    return prof;
  });

  // 3. Sanitize search_indexes.csv: remove ES-DOC-84920
  baseFiles['search_indexes.csv'] = baseFiles['search_indexes.csv'].filter(
    (doc: any) => doc.user_id !== 'CUST-84920'
  );

  // 4. Sanitize analytics_exports.csv: scrub CUST-84920
  baseFiles['analytics_exports.csv'] = baseFiles['analytics_exports.csv'].map((exp: any) => {
    if (exp.user_id === 'CUST-84920') {
      return {
        ...exp,
        user_id: '[ANONYMIZED_USER]',
        raw_email: '',
        email_hash: ''
      };
    }
    return exp;
  });

  // 5. Sanitize support_attachments.csv: shred driver license
  baseFiles['support_attachments.csv'] = baseFiles['support_attachments.csv'].map((att: any) => {
    if (att.user_id === 'CUST-84920') {
      return {
        ...att,
        file_name: '[PURGED_PER_TICKET_DELETION]',
        file_path: 's3://northstar-support-vault/tombstones/TICK-44102.tombstone',
        contains_pii: 'false',
        pii_types_detected: 'NONE',
        is_redacted: 'true'
      };
    }
    return att;
  });

  // 6. Sanitize orders.csv: redact shipping identifiers while preserving 7-year tax financial ledger
  baseFiles['orders.csv'] = baseFiles['orders.csv'].map((ord: any) => {
    if (ord.user_id === 'CUST-84920') {
      return {
        ...ord,
        shipping_name: '[REDACTED_FINANCIAL_RETENTION]',
        shipping_address: '[REDACTED_FINANCIAL_RETENTION]'
      };
    }
    return ord;
  });

  // 7. Sanitize payment_records.csv: redact billing address
  baseFiles['payment_records.csv'] = baseFiles['payment_records.csv'].map((pay: any) => {
    if (pay.user_id === 'CUST-84920') {
      return {
        ...pay,
        billing_address: '[REDACTED_IRS_CODE_6001]'
      };
    }
    return pay;
  });

  // 8. Sanitize sync_jobs.csv: Kafka compaction applied, no resurrection
  baseFiles['sync_jobs.csv'] = baseFiles['sync_jobs.csv'].map((job: any) => {
    if (job.target_user_id === 'CUST-84920') {
      return {
        ...job,
        status: 'COMPLETED_TOMBSTONE_COMPACTED',
        contains_resurrected_identity: 'false',
        payload_sample: '{"user_id": "CUST-84920", "status": "TOMBSTONE", "email": null}'
      };
    }
    return job;
  });

  // 9. Sanitize restore_jobs.csv
  baseFiles['restore_jobs.csv'] = baseFiles['restore_jobs.csv'].map((rst: any) => {
    if (rst.target_user_id === 'CUST-84920') {
      return {
        ...rst,
        restored_unredacted_pii: 'false',
        reconciliation_applied: 'true'
      };
    }
    return rst;
  });

  return {
    metadata: {
      packageName: 'Post-Remediation Verification Package (Sanitized Benchmark)',
      fileCount: 19,
      totalRows: Object.values(baseFiles).reduce((acc: number, rows: any) => acc + rows.length, 0),
      uploadedAt: new Date().toISOString(),
      schemaHealth: NORTHSTAR_INCIDENT_DATASET.metadata.schemaHealth
    },
    files: baseFiles
  };
}
