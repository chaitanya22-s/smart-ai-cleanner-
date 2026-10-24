import { ResurrectionRisk, ProcessState } from '../types';
import { ResolvedCustomerIdentity } from './identityResolver';

export function detectResurrectionRisks(
  identity: ResolvedCustomerIdentity,
  files: Record<string, any[]>
): ResurrectionRisk[] {
  const risks: ResurrectionRisk[] = [];
  const { userId, emails } = identity;

  // 1. Inspect sync_jobs.csv (CDC, Kafka, downstream replication)
  const syncJobs = files['sync_jobs.csv'] || [];
  syncJobs.forEach((job, idx) => {
    let matchesTarget = false;
    if (job.target_user_id === userId || job.target_user_id === 'ALL') matchesTarget = true;
    emails.forEach(e => {
      if (job.payload_sample && job.payload_sample.toLowerCase().includes(e)) matchesTarget = true;
    });

    if (matchesTarget) {
      const containsResurrected = job.contains_resurrected_identity === 'true';
      const isActive = job.status?.includes('ACTIVE');
      const state: ProcessState = isActive ? 'ACTIVE' : (job.status === 'FAILED' ? 'FAILED' : 'HISTORICAL');

      if (containsResurrected) {
        risks.push({
          id: `risk-sync-${idx}`,
          processId: job.job_id || `SYNC-${idx}`,
          processType: 'SYNC',
          sourceSystem: job.source_system || 'CRM_HubSpot',
          destSystem: job.destination_system || 'Primary_Postgres_Master',
          executionTimestamp: job.execution_timestamp || '2024-03-15T02:00:00Z',
          sourceRecordRef: `sync_jobs.csv:job_id=${job.job_id}`,
          evidenceSnippet: job.payload_sample || 'Payload contains personal identity parameters',
          status: state,
          confidence: 'CONFIRMED',
          requiredRemediation: 'Deploy Kafka tombstone compaction, purge source CRM profile, and inject idempotent deletion consumer guard.',
          affectedCustomerId: userId,
          recreationTrigger: 'Unredacted customer record in upstream CRM pushed through scheduled CDC sync job into primary database replica.'
        });
      }
    }
  });

  // 2. Inspect import_jobs.csv (Batch feeds, marketing CSV imports, partner referral feeds)
  const importJobs = files['import_jobs.csv'] || [];
  importJobs.forEach((job, idx) => {
    let matchesTarget = job.target_user_id === userId || job.target_user_id === 'ALL';
    if (matchesTarget && job.stale_profile_detected === 'true') {
      risks.push({
        id: `risk-imp-${idx}`,
        processId: job.import_id || `IMP-${idx}`,
        processType: 'IMPORT',
        sourceSystem: job.source_feed || 'Batch_Import_Feed',
        destSystem: job.target_table || 'customer_profiles',
        executionTimestamp: job.imported_at || '2024-03-14T22:00:00Z',
        sourceRecordRef: `import_jobs.csv:import_id=${job.import_id}`,
        evidenceSnippet: `Batch import (${job.source_feed}) processed ${job.records_count} records containing stale customer profile.`,
        status: job.status === 'COMPLETED' ? 'HISTORICAL' : 'ACTIVE',
        confidence: 'CONFIRMED',
        requiredRemediation: 'Sanitize historical batch import CSV manifests and establish pre-import deletion blacklist filter.',
        affectedCustomerId: userId,
        recreationTrigger: 'Legacy loyalty and partner export dumps imported stale customer profiles after user submitted deletion.'
      });
    }
  });

  // 3. Inspect restore_jobs.csv (Disaster Recovery & DB Snapshot Restorations)
  const restoreJobs = files['restore_jobs.csv'] || [];
  restoreJobs.forEach((job, idx) => {
    let matchesTarget = job.target_user_id === userId || job.target_user_id === 'ALL';
    if (matchesTarget) {
      const restoredPii = job.restored_unredacted_pii === 'true';
      const reconciled = job.reconciliation_applied === 'true';

      if (restoredPii && !reconciled) {
        risks.push({
          id: `risk-rst-${idx}`,
          processId: job.restore_id || `RESTORE-${idx}`,
          processType: 'RESTORE',
          sourceSystem: job.backup_id || 'Cold_EBS_Snapshot',
          destSystem: job.target_env || 'Staging_and_Read_Replicas',
          executionTimestamp: job.restored_at || '2024-03-14T23:30:00Z',
          sourceRecordRef: `restore_jobs.csv:restore_id=${job.restore_id}`,
          evidenceSnippet: `Snapshot ${job.backup_id} restored into ${job.target_env} without applying deletion reconciliation filter.`,
          status: 'HISTORICAL',
          confidence: 'CONFIRMED',
          requiredRemediation: 'Mandate automated Deletion Ledger Reconciliation Script as a required DR gate before unfreezing restored clusters.',
          affectedCustomerId: userId,
          recreationTrigger: 'Database recovery procedure restored pre-deletion snapshot into live replicas without reconciling deletion tombstones.'
        });
      }
    }
  });

  // 4. Inspect replication_jobs.csv (Bidirectional queues & split-brain replication)
  const replicationJobs = files['replication_jobs.csv'] || [];
  replicationJobs.forEach((job, idx) => {
    let matchesTarget = job.target_user_id === userId || job.target_user_id === 'ALL';
    if (matchesTarget && job.bidirectional === 'true' && parseInt(job.sync_queue_size || '0') > 0) {
      risks.push({
        id: `risk-rep-${idx}`,
        processId: job.replica_id || `REP-${idx}`,
        processType: 'REPLICATION',
        sourceSystem: job.replica_db || 'Read_Replica_Secondary',
        destSystem: job.primary_db || 'Primary_Master',
        executionTimestamp: job.last_sync_time || '2024-04-10T14:20:00Z',
        sourceRecordRef: `replication_jobs.csv:replica_id=${job.replica_id}`,
        evidenceSnippet: `Bidirectional replication lag of ${job.lag_seconds}s with ${job.sync_queue_size} pending events in queue.`,
        status: 'ACTIVE',
        confidence: 'CONFIRMED',
        requiredRemediation: 'Flush and purge outdated replica replication queues to avoid reverse sync re-insertions.',
        affectedCustomerId: userId,
        recreationTrigger: 'Bidirectional replica queue holds pending upsert mutations created prior to primary deletion.'
      });
    }
  });

  // 5. Inspect application_logs.csv for Write-After-Deletion collisions
  const appLogs = files['application_logs.csv'] || [];
  const deletionLog = appLogs.find(l => l.user_id === userId && l.event_type === 'DELETION_SUBMITTED');
  const recreationLog = appLogs.find(l => l.user_id === userId && (l.event_type === 'ACCOUNT_RECREATED_FROM_SYNC' || l.event_type === 'REGISTRATION_COLLISION_ERROR'));

  if (deletionLog && recreationLog) {
    risks.push({
      id: `risk-evt-collision`,
      processId: recreationLog.log_id || 'LOG-RECREATE',
      processType: 'EVENT_REPLAY',
      sourceSystem: recreationLog.service || 'sync-worker-cdc',
      destSystem: 'Customer Accounts DB / Registration Service',
      executionTimestamp: recreationLog.timestamp || '2024-03-15T02:00:05Z',
      sourceRecordRef: `application_logs.csv:log_id=${recreationLog.log_id}`,
      evidenceSnippet: recreationLog.payload_excerpt || 'Write collision detected in application service logs.',
      status: 'ACTIVE',
      confidence: 'CONFIRMED',
      requiredRemediation: 'Enforce registration service collision reconciliation and fix tombstone query in unique index check.',
      affectedCustomerId: userId,
      recreationTrigger: 'Write-after-deletion confirmed: system re-created customer row and blocked new customer registration.'
    });
  }

  return risks;
}
