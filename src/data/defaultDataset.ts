import { DatasetPackage } from '../types';

export const NORTHSTAR_INCIDENT_DATASET: DatasetPackage = {
  metadata: {
    packageName: "Northstar Shop $2.4M Incident Package (Actual Historical Evidence)",
    fileCount: 19,
    totalRows: 88,
    uploadedAt: "2024-04-10T14:22:00Z",
    schemaHealth: [
      { fileName: "deletion_requests.csv", detectedColumns: ["request_id", "customer_id", "submitted_at", "channel", "request_status", "reason", "verified_identity_evidence"], rowCount: 4, hasErrors: false, issues: [] },
      { fileName: "deletion_rules.csv", detectedColumns: ["rule_id", "system_name", "data_category", "required_action", "permitted_identifiers", "prohibited_identifiers", "retention_period_years", "legal_basis", "evidence_required", "notes"], rowCount: 9, hasErrors: false, issues: [] },
      { fileName: "customer_accounts.csv", detectedColumns: ["user_id", "email", "phone", "full_name", "status", "created_at", "updated_at", "is_tombstone"], rowCount: 6, hasErrors: false, issues: [] },
      { fileName: "identity_history.csv", detectedColumns: ["history_id", "user_id", "identifier_type", "identifier_value", "is_active", "valid_from", "valid_to"], rowCount: 9, hasErrors: false, issues: [] },
      { fileName: "customer_profiles.csv", detectedColumns: ["profile_id", "user_id", "crm_email", "phone", "marketing_opt_in", "loyalty_tier", "last_synced_at"], rowCount: 4, hasErrors: false, issues: [] },
      { fileName: "orders.csv", detectedColumns: ["order_id", "user_id", "order_date", "total_amount", "currency", "shipping_name", "shipping_address", "status"], rowCount: 6, hasErrors: false, issues: [] },
      { fileName: "payment_records.csv", detectedColumns: ["payment_id", "order_id", "user_id", "payment_method", "token_ref", "card_last4", "billing_address", "amount", "status", "retained_for_tax"], rowCount: 5, hasErrors: false, issues: [] },
      { fileName: "support_attachments.csv", detectedColumns: ["attachment_id", "ticket_id", "user_id", "file_name", "file_type", "file_path", "contains_pii", "pii_types_detected", "is_redacted"], rowCount: 4, hasErrors: false, issues: [] },
      { fileName: "search_indexes.csv", detectedColumns: ["doc_id", "index_name", "user_id", "indexed_text", "cached_email", "cached_name", "last_indexed_at"], rowCount: 4, hasErrors: false, issues: [] },
      { fileName: "analytics_exports.csv", detectedColumns: ["export_id", "table_name", "user_id", "email_hash", "raw_email", "session_count", "revenue_usd", "export_timestamp"], rowCount: 4, hasErrors: false, issues: [] },
      { fileName: "application_logs.csv", detectedColumns: ["log_id", "timestamp", "service", "event_type", "user_id", "ip_address", "payload_excerpt"], rowCount: 6, hasErrors: false, issues: [] },
      { fileName: "audit_logs.csv", detectedColumns: ["audit_id", "timestamp", "actor", "action", "target_user_id", "result", "notes"], rowCount: 5, hasErrors: false, issues: [] },
      { fileName: "sync_jobs.csv", detectedColumns: ["job_id", "source_system", "destination_system", "execution_timestamp", "status", "records_processed", "payload_sample", "contains_resurrected_identity", "target_user_id"], rowCount: 5, hasErrors: false, issues: [] },
      { fileName: "import_jobs.csv", detectedColumns: ["import_id", "source_feed", "target_table", "imported_at", "status", "records_count", "stale_profile_detected", "target_user_id"], rowCount: 3, hasErrors: false, issues: [] },
      { fileName: "replication_jobs.csv", detectedColumns: ["replica_id", "primary_db", "replica_db", "lag_seconds", "last_sync_time", "bidirectional", "sync_queue_size", "target_user_id"], rowCount: 3, hasErrors: false, issues: [] },
      { fileName: "backup_inventory.csv", detectedColumns: ["backup_id", "system_name", "snapshot_time", "retention_expires_at", "contains_unredacted_pii", "target_user_id", "snapshot_type"], rowCount: 4, hasErrors: false, issues: [] },
      { fileName: "restore_jobs.csv", detectedColumns: ["restore_id", "backup_id", "target_env", "restored_at", "status", "restored_unredacted_pii", "reconciliation_applied", "target_user_id"], rowCount: 3, hasErrors: false, issues: [] },
      { fileName: "system_inventory.csv", detectedColumns: ["system_id", "system_name", "system_type", "data_categories", "owner_team", "has_deletion_api", "supports_tombstone"], rowCount: 9, hasErrors: false, issues: [] },
      { fileName: "deletion_events.csv", detectedColumns: ["event_id", "request_id", "user_id", "system_name", "event_timestamp", "operator_status", "identifiers_claimed_deleted"], rowCount: 5, hasErrors: false, issues: [] },
      { fileName: "retention_records.csv", detectedColumns: ["retention_id", "user_id", "category", "legal_statute", "mandatory_until", "permitted_fields", "is_preserved"], rowCount: 4, hasErrors: false, issues: [] }
    ]
  },
  files: {
    "deletion_requests.csv": [
      {
        request_id: "DEL-REQ-2024-0891",
        customer_id: "CUST-84920",
        submitted_at: "2024-03-12T09:14:00Z",
        channel: "GDPR_PRIVACY_PORTAL",
        request_status: "OPERATOR_CLOSED_COMPLETE",
        reason: "Customer requested permanent account erasure and right to be forgotten.",
        verified_identity_evidence: "ID_VERIFY_PASS: SMS_OTP + Signed Erasure Form"
      },
      {
        request_id: "DEL-REQ-2024-0892",
        customer_id: "CUST-77104",
        submitted_at: "2024-03-18T11:02:00Z",
        channel: "CUSTOMER_SUPPORT_TICKET",
        request_status: "OPERATOR_CLOSED_COMPLETE",
        reason: "Customer opted out of all services, requested full deletion.",
        verified_identity_evidence: "ID_VERIFY_PASS: OAuth Auth0 Token Verification"
      },
      {
        request_id: "DEL-REQ-2024-0893",
        customer_id: "CUST-91024",
        submitted_at: "2024-03-25T14:45:00Z",
        channel: "LEGAL_NOTICE_EMAIL",
        request_status: "OPERATOR_CLOSED_COMPLETE",
        reason: "Formal CCPA erasure request from consumer attorney.",
        verified_identity_evidence: "ID_VERIFY_PASS: Notarized Identity Declaration"
      },
      {
        request_id: "DEL-REQ-2024-0894",
        customer_id: "CUST-65239",
        submitted_at: "2024-03-29T16:20:00Z",
        channel: "GDPR_PRIVACY_PORTAL",
        request_status: "IN_PROGRESS",
        reason: "Right to be forgotten request pending verification.",
        verified_identity_evidence: "ID_VERIFY_PENDING: Email confirmation link clicked"
      }
    ],

    "deletion_rules.csv": [
      {
        rule_id: "RULE-ACC-01",
        system_name: "Customer Accounts DB",
        data_category: "Account Master",
        required_action: "DELETE_REDACT_TOMBSTONE",
        permitted_identifiers: "user_id",
        prohibited_identifiers: "full_name,email,phone,hashed_email,password_hash",
        retention_period_years: "0",
        legal_basis: "GDPR Art. 17 / CCPA § 1798.105",
        evidence_required: "DB_TOMBSTONE_VERIFICATION",
        notes: "Internal user_id may remain if is_tombstone=true so financial records preserve foreign keys."
      },
      {
        rule_id: "RULE-CRM-01",
        system_name: "CRM HubSpot",
        data_category: "Marketing & Profile",
        required_action: "DELETE_PURGE",
        permitted_identifiers: "NONE",
        prohibited_identifiers: "crm_email,phone,full_name,loyalty_tier",
        retention_period_years: "0",
        legal_basis: "GDPR Art. 17 / ePrivacy Directive",
        evidence_required: "CRM_API_DELETE_204",
        notes: "Must completely purge customer profile. Downstream sync must not retain dirty cache."
      },
      {
        rule_id: "RULE-IDX-01",
        system_name: "Search Index Elasticsearch",
        data_category: "Search & Caching",
        required_action: "DELETE_PURGE",
        permitted_identifiers: "NONE",
        prohibited_identifiers: "cached_email,cached_name,indexed_text,user_id",
        retention_period_years: "0",
        legal_basis: "GDPR Art. 17",
        evidence_required: "ELASTICSEARCH_DOC_404",
        notes: "Elasticsearch customer index must hard-delete doc within 24h of request."
      },
      {
        rule_id: "RULE-ANL-01",
        system_name: "Analytics Snowflake",
        data_category: "BI & Export Logs",
        required_action: "ANONYMIZE_HASH_PURGE",
        permitted_identifiers: "session_count,revenue_usd",
        prohibited_identifiers: "raw_email,email_hash,user_id",
        retention_period_years: "0",
        legal_basis: "GDPR Recital 26",
        evidence_required: "ETL_SCRUB_LOG",
        notes: "Prohibits reversible SHA256 email hashes in analytics exports."
      },
      {
        rule_id: "RULE-SUP-01",
        system_name: "Support Zendesk S3",
        data_category: "Customer Support & Attachments",
        required_action: "PURGE_OR_REDACT",
        permitted_identifiers: "ticket_id",
        prohibited_identifiers: "personal_documents,driver_license,passport,home_address",
        retention_period_years: "0",
        legal_basis: "GDPR Art. 17",
        evidence_required: "S3_OBJECT_DELETE_LOG",
        notes: "Any identity documents submitted for verification or warranty must be permanently unlinked and purged."
      },
      {
        rule_id: "RULE-FIN-01",
        system_name: "Order & Payment Ledger",
        data_category: "Financial & Tax Records",
        required_action: "RETAIN_LEGAL",
        permitted_identifiers: "order_id,user_id,amount,currency,order_date,retained_for_tax",
        prohibited_identifiers: "shipping_name,shipping_address,raw_card_details",
        retention_period_years: "7",
        legal_basis: "IRS 26 U.S.C. § 6001 / Commercial Code Statutory Retention",
        evidence_required: "AUDIT_RETENTION_FLAG",
        notes: "MANDATORY RETENTION: Orders and payments must NOT be erased within 7 years. Personal shipping name/address must be redacted to user_id reference."
      },
      {
        rule_id: "RULE-SYNC-01",
        system_name: "Kafka Sync Pipeline",
        data_category: "Data Streaming & Queues",
        required_action: "HALT_OR_TOMBSTONE_COMPACT",
        permitted_identifiers: "tombstone_marker",
        prohibited_identifiers: "recreated_email,recreated_phone,recreated_profile",
        retention_period_years: "0",
        legal_basis: "System Integrity / GDPR Art. 5(1)(d)",
        evidence_required: "CDC_TOMBSTONE_VERIFICATION",
        notes: "All replication and sync queues must enforce tombstone compaction to prevent resurrection."
      },
      {
        rule_id: "RULE-BAK-01",
        system_name: "Backup & Restore Systems",
        data_category: "Snapshots & DR",
        required_action: "RECONCILE_ON_RESTORE",
        permitted_identifiers: "cold_snapshot_id",
        prohibited_identifiers: "unreconciled_restore_payload",
        retention_period_years: "0.25",
        legal_basis: "EDPB Guidelines 05/2020",
        evidence_required: "RESTORE_RECONCILIATION_AUDIT",
        notes: "Backup restoration must run deletion ledger filter before exposing records to live environment."
      },
      {
        rule_id: "RULE-LOG-01",
        system_name: "Application Logs DataDog",
        data_category: "Application & Security Logs",
        required_action: "REDACT_MASK",
        permitted_identifiers: "ip_address_masked,timestamp,service",
        prohibited_identifiers: "plain_email,plain_phone,jwt_pii_payload",
        retention_period_years: "0.08",
        legal_basis: "Security Exception Art. 17(3)(e)",
        evidence_required: "LOG_MASKING_CERTIFICATION",
        notes: "Operational logs may be retained 30 days for incident defense, but raw PII must be masked."
      }
    ],

    "customer_accounts.csv": [
      {
        user_id: "CUST-84920",
        email: "sarah.jenkins@example.com",
        phone: "+1-555-019-2834",
        full_name: "Sarah Jenkins",
        status: "ACTIVE",
        created_at: "2021-04-10T12:00:00Z",
        updated_at: "2024-03-15T02:00:04Z",
        is_tombstone: "false"
      },
      {
        user_id: "CUST-77104",
        email: "",
        phone: "",
        full_name: "[DELETED_TOMBSTONE]",
        status: "TOMBSTONE",
        created_at: "2022-01-15T08:30:00Z",
        updated_at: "2024-03-18T11:05:00Z",
        is_tombstone: "true"
      },
      {
        user_id: "CUST-91024",
        email: "elena.cruz@lawfirm-partner.org",
        phone: "+1-555-082-1944",
        full_name: "Elena Cruz",
        status: "CLOSED",
        created_at: "2023-08-19T10:15:00Z",
        updated_at: "2024-03-25T14:46:00Z",
        is_tombstone: "false"
      },
      {
        user_id: "CUST-65239",
        email: "m.brody@technology-hub.net",
        phone: "+1-555-033-9112",
        full_name: "Marcus Brody",
        status: "ACTIVE",
        created_at: "2022-09-11T17:40:00Z",
        updated_at: "2024-03-29T16:21:00Z",
        is_tombstone: "false"
      },
      {
        user_id: "CUST-10042",
        email: "alex.rivera@global-logistics.com",
        phone: "+1-555-044-8831",
        full_name: "Alex Rivera",
        status: "ACTIVE",
        created_at: "2020-03-14T09:00:00Z",
        updated_at: "2024-04-01T11:20:00Z",
        is_tombstone: "false"
      }
    ],

    "identity_history.csv": [
      {
        history_id: "IDH-001",
        user_id: "CUST-84920",
        identifier_type: "EMAIL_PRIMARY",
        identifier_value: "sarah.jenkins@example.com",
        is_active: "true",
        valid_from: "2022-06-01T00:00:00Z",
        valid_to: ""
      },
      {
        history_id: "IDH-002",
        user_id: "CUST-84920",
        identifier_type: "EMAIL_HISTORICAL",
        identifier_value: "sarah.j@outlook.com",
        is_active: "false",
        valid_from: "2021-04-10T12:00:00Z",
        valid_to: "2022-06-01T00:00:00Z"
      },
      {
        history_id: "IDH-003",
        user_id: "CUST-84920",
        identifier_type: "EMAIL_HASH_SHA256",
        identifier_value: "9f83c1264c89a74ec96791e0a2902641ec92c30f40ce7cf9894a861623ff2a7e",
        is_active: "true",
        valid_from: "2021-04-10T12:00:00Z",
        valid_to: ""
      },
      {
        history_id: "IDH-004",
        user_id: "CUST-84920",
        identifier_type: "PHONE_NUMBER",
        identifier_value: "+1-555-019-2834",
        is_active: "true",
        valid_from: "2021-04-10T12:00:00Z",
        valid_to: ""
      },
      {
        history_id: "IDH-005",
        user_id: "CUST-84920",
        identifier_type: "ALIAS_HANDLE",
        identifier_value: "s_jenkins_99",
        is_active: "true",
        valid_from: "2021-04-10T12:00:00Z",
        valid_to: ""
      },
      {
        history_id: "IDH-006",
        user_id: "CUST-77104",
        identifier_type: "EMAIL_PRIMARY",
        identifier_value: "david.vance@vancetech.io",
        is_active: "false",
        valid_from: "2022-01-15T08:30:00Z",
        valid_to: "2024-03-18T11:05:00Z"
      },
      {
        history_id: "IDH-007",
        user_id: "CUST-91024",
        identifier_type: "EMAIL_PRIMARY",
        identifier_value: "elena.cruz@lawfirm-partner.org",
        is_active: "true",
        valid_from: "2023-08-19T10:15:00Z",
        valid_to: ""
      },
      {
        history_id: "IDH-008",
        user_id: "CUST-65239",
        identifier_type: "EMAIL_PRIMARY",
        identifier_value: "m.brody@technology-hub.net",
        is_active: "true",
        valid_from: "2022-09-11T17:40:00Z",
        valid_to: ""
      },
      {
        history_id: "IDH-009",
        user_id: "CUST-10042",
        identifier_type: "EMAIL_PRIMARY",
        identifier_value: "alex.rivera@global-logistics.com",
        is_active: "true",
        valid_from: "2020-03-14T09:00:00Z",
        valid_to: ""
      }
    ],

    "customer_profiles.csv": [
      {
        profile_id: "CRM-84920",
        user_id: "CUST-84920",
        crm_email: "sarah.jenkins@example.com",
        phone: "+1-555-019-2834",
        marketing_opt_in: "true",
        loyalty_tier: "Platinum",
        last_synced_at: "2024-03-15T01:58:00Z"
      },
      {
        profile_id: "CRM-77104",
        user_id: "CUST-77104",
        crm_email: "",
        phone: "",
        marketing_opt_in: "false",
        loyalty_tier: "PURGED",
        last_synced_at: "2024-03-18T11:04:00Z"
      },
      {
        profile_id: "CRM-91024",
        user_id: "CUST-91024",
        crm_email: "elena.cruz@lawfirm-partner.org",
        phone: "+1-555-082-1944",
        marketing_opt_in: "true",
        loyalty_tier: "Silver",
        last_synced_at: "2024-03-24T08:00:00Z"
      },
      {
        profile_id: "CRM-10042",
        user_id: "CUST-10042",
        crm_email: "alex.rivera@global-logistics.com",
        phone: "+1-555-044-8831",
        marketing_opt_in: "true",
        loyalty_tier: "Diamond",
        last_synced_at: "2024-04-01T04:00:00Z"
      }
    ],

    "orders.csv": [
      {
        order_id: "ORD-99104",
        user_id: "CUST-84920",
        order_date: "2023-11-24T18:12:00Z",
        total_amount: "489.50",
        currency: "USD",
        shipping_name: "Sarah Jenkins",
        shipping_address: "442 Pine Valley Dr, Seattle, WA 98101",
        status: "DELIVERED"
      },
      {
        order_id: "ORD-88219",
        user_id: "CUST-84920",
        order_date: "2022-08-15T14:02:00Z",
        total_amount: "129.00",
        currency: "USD",
        shipping_name: "Sarah Jenkins",
        shipping_address: "442 Pine Valley Dr, Seattle, WA 98101",
        status: "DELIVERED"
      },
      {
        order_id: "ORD-77101",
        user_id: "CUST-77104",
        order_date: "2023-05-10T12:00:00Z",
        total_amount: "850.00",
        currency: "USD",
        shipping_name: "[REDACTED_FINANCIAL_RETENTION]",
        shipping_address: "[REDACTED_FINANCIAL_RETENTION]",
        status: "DELIVERED"
      },
      {
        order_id: "ORD-91001",
        user_id: "CUST-91024",
        order_date: "2024-02-14T19:30:00Z",
        total_amount: "1420.00",
        currency: "USD",
        shipping_name: "Elena Cruz",
        shipping_address: "1200 Brickell Ave, Miami, FL 33131",
        status: "DISPUTED_CHARGEBACK"
      },
      {
        order_id: "ORD-10022",
        user_id: "CUST-10042",
        order_date: "2024-01-20T10:00:00Z",
        total_amount: "310.00",
        currency: "USD",
        shipping_name: "Alex Rivera",
        shipping_address: "755 Mission St, San Francisco, CA 94103",
        status: "DELIVERED"
      }
    ],

    "payment_records.csv": [
      {
        payment_id: "PAY-84920-A",
        order_id: "ORD-99104",
        user_id: "CUST-84920",
        payment_method: "VISA_TOKEN",
        token_ref: "tok_visa_98418240",
        card_last4: "4242",
        billing_address: "442 Pine Valley Dr, Seattle, WA 98101",
        amount: "489.50",
        status: "SETTLED",
        retained_for_tax: "true"
      },
      {
        payment_id: "PAY-77104-A",
        order_id: "ORD-77101",
        user_id: "CUST-77104",
        payment_method: "MASTERCARD_TOKEN",
        token_ref: "tok_mc_11029384",
        card_last4: "8812",
        billing_address: "[REDACTED_IRS_CODE_6001]",
        amount: "850.00",
        status: "SETTLED",
        retained_for_tax: "true"
      },
      {
        payment_id: "PAY-91024-A",
        order_id: "ORD-91001",
        user_id: "CUST-91024",
        payment_method: "AMEX_TOKEN",
        token_ref: "tok_amex_9941029",
        card_last4: "1004",
        billing_address: "1200 Brickell Ave, Miami, FL 33131",
        amount: "1420.00",
        status: "DISPUTE_OPEN",
        retained_for_tax: "true"
      },
      {
        payment_id: "PAY-10042-A",
        order_id: "ORD-10022",
        user_id: "CUST-10042",
        payment_method: "APPLE_PAY",
        token_ref: "tok_ap_7781923",
        card_last4: "3021",
        billing_address: "755 Mission St, San Francisco, CA 94103",
        amount: "310.00",
        status: "SETTLED",
        retained_for_tax: "true"
      }
    ],

    "support_attachments.csv": [
      {
        attachment_id: "ATT-84920-1",
        ticket_id: "TICK-44102",
        user_id: "CUST-84920",
        file_name: "DL_Sarah_Jenkins_Verification.pdf",
        file_type: "application/pdf",
        file_path: "s3://northstar-support-vault/tickets/44102/DL_Sarah_Jenkins.pdf",
        contains_pii: "true",
        pii_types_detected: "DRIVER_LICENSE, PHOTO, HOME_ADDRESS, DOB",
        is_redacted: "false"
      },
      {
        attachment_id: "ATT-77104-1",
        ticket_id: "TICK-33100",
        user_id: "CUST-77104",
        file_name: "[PURGED_PER_TICKET_DELETION]",
        file_type: "application/pdf",
        file_path: "s3://northstar-support-vault/tombstones/TICK-33100.tombstone",
        contains_pii: "false",
        pii_types_detected: "NONE",
        is_redacted: "true"
      },
      {
        attachment_id: "ATT-91024-1",
        ticket_id: "TICK-55291",
        user_id: "CUST-91024",
        file_name: "Passport_Scan_ElenaCruz.jpg",
        file_type: "image/jpeg",
        file_path: "s3://northstar-support-vault/tickets/55291/Passport_Scan.jpg",
        contains_pii: "true",
        pii_types_detected: "PASSPORT_NUMBER, FULL_NAME, NATIONALITY",
        is_redacted: "false"
      }
    ],

    "search_indexes.csv": [
      {
        doc_id: "ES-DOC-84920",
        index_name: "customers_v3",
        user_id: "CUST-84920",
        indexed_text: "Sarah Jenkins sarah.jenkins@example.com Seattle WA VIP Gold buyer",
        cached_email: "sarah.jenkins@example.com",
        cached_name: "Sarah Jenkins",
        last_indexed_at: "2024-03-15T02:05:00Z"
      },
      {
        doc_id: "ES-DOC-91024",
        index_name: "customers_v3",
        user_id: "CUST-91024",
        indexed_text: "Elena Cruz elena.cruz@lawfirm-partner.org Miami FL",
        cached_email: "elena.cruz@lawfirm-partner.org",
        cached_name: "Elena Cruz",
        last_indexed_at: "2024-03-24T18:00:00Z"
      },
      {
        doc_id: "ES-DOC-10042",
        index_name: "customers_v3",
        user_id: "CUST-10042",
        indexed_text: "Alex Rivera alex.rivera@global-logistics.com San Francisco CA",
        cached_email: "alex.rivera@global-logistics.com",
        cached_name: "Alex Rivera",
        last_indexed_at: "2024-04-01T04:30:00Z"
      }
    ],

    "analytics_exports.csv": [
      {
        export_id: "EXP-2024-W11",
        table_name: "weekly_cohort_activity",
        user_id: "CUST-84920",
        email_hash: "9f83c1264c89a74ec96791e0a2902641ec92c30f40ce7cf9894a861623ff2a7e",
        raw_email: "sarah.jenkins@example.com",
        session_count: "48",
        revenue_usd: "618.50",
        export_timestamp: "2024-03-17T00:00:00Z"
      },
      {
        export_id: "EXP-2024-W12",
        table_name: "weekly_cohort_activity",
        user_id: "[ANONYMIZED_USER]",
        email_hash: "",
        raw_email: "",
        session_count: "12",
        revenue_usd: "850.00",
        export_timestamp: "2024-03-24T00:00:00Z"
      },
      {
        export_id: "EXP-2024-W13",
        table_name: "weekly_cohort_activity",
        user_id: "CUST-91024",
        email_hash: "a490fbc981248...",
        raw_email: "elena.cruz@lawfirm-partner.org",
        session_count: "8",
        revenue_usd: "1420.00",
        export_timestamp: "2024-03-31T00:00:00Z"
      }
    ],

    "application_logs.csv": [
      {
        log_id: "LOG-9941",
        timestamp: "2024-03-12T09:14:02Z",
        service: "auth-gateway",
        event_type: "DELETION_SUBMITTED",
        user_id: "CUST-84920",
        ip_address: "198.51.100.44",
        payload_excerpt: "User initiated Right to Erasure portal request"
      },
      {
        log_id: "LOG-9952",
        timestamp: "2024-03-15T02:00:05Z",
        service: "sync-worker-cdc",
        event_type: "ACCOUNT_RECREATED_FROM_SYNC",
        user_id: "CUST-84920",
        ip_address: "10.0.4.12",
        payload_excerpt: "Upserted customer account record for sarah.jenkins@example.com from HubSpot CDC feed"
      },
      {
        log_id: "LOG-9960",
        timestamp: "2024-04-02T10:14:22Z",
        service: "registration-service",
        event_type: "REGISTRATION_COLLISION_ERROR",
        user_id: "CUST-84920",
        ip_address: "198.51.100.44",
        payload_excerpt: "HTTP 409 Conflict: User with email sarah.jenkins@example.com already exists in master db"
      },
      {
        log_id: "LOG-9971",
        timestamp: "2024-03-18T11:05:00Z",
        service: "auth-gateway",
        event_type: "TOMBSTONE_CREATED",
        user_id: "CUST-77104",
        ip_address: "10.0.1.5",
        payload_excerpt: "Account marked TOMBSTONE, direct fields nullified"
      }
    ],

    "audit_logs.csv": [
      {
        audit_id: "AUD-001",
        timestamp: "2024-03-14T10:00:00Z",
        actor: "admin_operator_jdoe",
        action: "MARK_DELETION_COMPLETE",
        target_user_id: "CUST-84920",
        result: "SUCCESS_OPERATOR_OVERRIDE",
        notes: "Operator marked request DEL-REQ-2024-0891 complete on dashboard WITHOUT running cross-system evidence verification!"
      },
      {
        audit_id: "AUD-002",
        timestamp: "2024-03-18T11:06:00Z",
        actor: "automated_privacy_pipeline",
        action: "EXECUTE_SYSTEM_TOMBSTONE",
        target_user_id: "CUST-77104",
        result: "SUCCESS",
        notes: "Verified deletion rules passed for CUST-77104 across all 8 systems."
      },
      {
        audit_id: "AUD-003",
        timestamp: "2024-03-25T14:48:00Z",
        actor: "admin_operator_jdoe",
        action: "MARK_DELETION_COMPLETE",
        target_user_id: "CUST-91024",
        result: "SUCCESS_OPERATOR_OVERRIDE",
        notes: "Premature signoff without resolving active chargeback dispute."
      }
    ],

    "sync_jobs.csv": [
      {
        job_id: "JOB-SYNC-9921",
        source_system: "CRM_HubSpot",
        destination_system: "Primary_Postgres_Master",
        execution_timestamp: "2024-03-15T02:00:00Z",
        status: "ACTIVE_SCHEDULED",
        records_processed: "1480",
        payload_sample: '{"user_id": "CUST-84920", "email": "sarah.jenkins@example.com", "phone": "+1-555-019-2834", "action": "UPSERT"}',
        contains_resurrected_identity: "true",
        target_user_id: "CUST-84920"
      },
      {
        job_id: "JOB-SYNC-7701",
        source_system: "Primary_Postgres_Master",
        destination_system: "Warehouse_Replica",
        execution_timestamp: "2024-03-18T12:00:00Z",
        status: "COMPLETED",
        records_processed: "340",
        payload_sample: '{"user_id": "CUST-77104", "status": "TOMBSTONE", "email": null}',
        contains_resurrected_identity: "false",
        target_user_id: "CUST-77104"
      },
      {
        job_id: "JOB-SYNC-8812",
        source_system: "CRM_HubSpot",
        destination_system: "Elasticsearch_Cluster",
        execution_timestamp: "2024-03-15T02:05:00Z",
        status: "ACTIVE_SCHEDULED",
        records_processed: "1480",
        payload_sample: '{"doc_id": "ES-DOC-84920", "email": "sarah.jenkins@example.com"}',
        contains_resurrected_identity: "true",
        target_user_id: "CUST-84920"
      }
    ],

    "import_jobs.csv": [
      {
        import_id: "IMP-2024-03-01",
        source_feed: "Legacy_Loyalty_CSV_Export",
        target_table: "customer_profiles",
        imported_at: "2024-03-14T22:00:00Z",
        status: "COMPLETED",
        records_count: "8500",
        stale_profile_detected: "true",
        target_user_id: "CUST-84920"
      },
      {
        import_id: "IMP-2024-03-15",
        source_feed: "Partner_Referral_Feed",
        target_table: "customer_accounts",
        imported_at: "2024-03-19T04:00:00Z",
        status: "COMPLETED",
        records_count: "120",
        stale_profile_detected: "false",
        target_user_id: "CUST-77104"
      }
    ],

    "replication_jobs.csv": [
      {
        replica_id: "REP-US-EAST",
        primary_db: "postgres_primary_us_east",
        replica_db: "postgres_readonly_us_east",
        lag_seconds: "1.2",
        last_sync_time: "2024-04-10T14:20:00Z",
        bidirectional: "false",
        sync_queue_size: "0",
        target_user_id: "ALL"
      },
      {
        replica_id: "REP-EU-CENTRAL",
        primary_db: "postgres_primary_us_east",
        replica_db: "postgres_readonly_eu_frankfurt",
        lag_seconds: "450.0",
        last_sync_time: "2024-03-29T16:00:00Z",
        bidirectional: "true",
        sync_queue_size: "4200",
        target_user_id: "CUST-65239"
      }
    ],

    "backup_inventory.csv": [
      {
        backup_id: "BAK-2024-03-01-FULL",
        system_name: "PostgreSQL_Master_RDS",
        snapshot_time: "2024-03-01T01:00:00Z",
        retention_expires_at: "2024-06-01T01:00:00Z",
        contains_unredacted_pii: "true",
        target_user_id: "CUST-84920",
        snapshot_type: "EBS_FULL_SNAPSHOT"
      },
      {
        backup_id: "BAK-2024-03-10-INC",
        system_name: "CRM_HubSpot_Daily_Dump",
        snapshot_time: "2024-03-10T02:00:00Z",
        retention_expires_at: "2024-04-10T02:00:00Z",
        contains_unredacted_pii: "true",
        target_user_id: "CUST-84920",
        snapshot_type: "S3_GLACIER"
      },
      {
        backup_id: "BAK-2024-03-20-FULL",
        system_name: "PostgreSQL_Master_RDS",
        snapshot_time: "2024-03-20T01:00:00Z",
        retention_expires_at: "2024-06-20T01:00:00Z",
        contains_unredacted_pii: "false",
        target_user_id: "CUST-77104",
        snapshot_type: "EBS_FULL_SNAPSHOT"
      }
    ],

    "restore_jobs.csv": [
      {
        restore_id: "JOB-RESTORE-104",
        backup_id: "BAK-2024-03-01-FULL",
        target_env: "Staging_and_Read_Replicas",
        restored_at: "2024-03-14T23:30:00Z",
        status: "SUCCESS_COMPLETED",
        restored_unredacted_pii: "true",
        reconciliation_applied: "false",
        target_user_id: "CUST-84920"
      },
      {
        restore_id: "JOB-RESTORE-105",
        backup_id: "BAK-2024-03-20-FULL",
        target_env: "DR_Test_Instance",
        restored_at: "2024-03-22T08:00:00Z",
        status: "SUCCESS_COMPLETED",
        restored_unredacted_pii: "false",
        reconciliation_applied: "true",
        target_user_id: "CUST-77104"
      }
    ],

    "system_inventory.csv": [
      {
        system_id: "SYS-001",
        system_name: "Customer Accounts DB",
        system_type: "Relational_PostgreSQL",
        data_categories: "Account Master, Credentials, Contact",
        owner_team: "Core Identity Engineering",
        has_deletion_api: "true",
        supports_tombstone: "true"
      },
      {
        system_id: "SYS-002",
        system_name: "CRM HubSpot",
        system_type: "SaaS_CRM",
        data_categories: "Marketing, Profiles, Leads",
        owner_team: "Growth & Marketing Tech",
        has_deletion_api: "true",
        supports_tombstone: "false"
      },
      {
        system_id: "SYS-003",
        system_name: "Search Index Elasticsearch",
        system_type: "Search_Engine",
        data_categories: "Cached Customer Documents",
        owner_team: "Search & Discovery",
        has_deletion_api: "true",
        supports_tombstone: "false"
      },
      {
        system_id: "SYS-004",
        system_name: "Analytics Snowflake",
        system_type: "Data_Warehouse",
        data_categories: "Aggregated Metrics, Exports, BI",
        owner_team: "Data Platform",
        has_deletion_api: "false",
        supports_tombstone: "false"
      },
      {
        system_id: "SYS-005",
        system_name: "Support Zendesk S3",
        system_type: "Object_Storage",
        data_categories: "Ticket Attachments, Identity Scans",
        owner_team: "Customer Experience Operations",
        has_deletion_api: "true",
        supports_tombstone: "true"
      },
      {
        system_id: "SYS-006",
        system_name: "Order & Payment Ledger",
        system_type: "Financial_Ledger",
        data_categories: "Orders, Taxes, Payment Tokens",
        owner_team: "Finance & Accounting Engineering",
        has_deletion_api: "false",
        supports_tombstone: "true"
      },
      {
        system_id: "SYS-007",
        system_name: "Kafka Sync Pipeline",
        system_type: "Streaming_Queue",
        data_categories: "CDC Events, Event Replay",
        owner_team: "Data Platform & Infrastructure",
        has_deletion_api: "true",
        supports_tombstone: "true"
      },
      {
        system_id: "SYS-008",
        system_name: "Backup & Restore Systems",
        system_type: "Infrastructure_Snapshots",
        data_categories: "EBS Volumes, S3 Snapshots",
        owner_team: "DevOps & SRE",
        has_deletion_api: "false",
        supports_tombstone: "false"
      },
      {
        system_id: "SYS-009",
        system_name: "Application Logs DataDog",
        system_type: "Log_Aggregator",
        data_categories: "HTTP Request Logs, Audit Trails",
        owner_team: "Security Operations Center",
        has_deletion_api: "false",
        supports_tombstone: "false"
      }
    ],

    "deletion_events.csv": [
      {
        event_id: "EVT-84920-01",
        request_id: "DEL-REQ-2024-0891",
        user_id: "CUST-84920",
        system_name: "Customer Accounts DB",
        event_timestamp: "2024-03-14T09:50:00Z",
        operator_status: "SUCCESS_DELETED",
        identifiers_claimed_deleted: "sarah.jenkins@example.com, Sarah Jenkins"
      },
      {
        event_id: "EVT-84920-02",
        request_id: "DEL-REQ-2024-0891",
        user_id: "CUST-84920",
        system_name: "CRM HubSpot",
        event_timestamp: "2024-03-14T09:55:00Z",
        operator_status: "SKIPPED_API_TIMEOUT",
        identifiers_claimed_deleted: "NONE (Failed silently)"
      },
      {
        event_id: "EVT-77104-01",
        request_id: "DEL-REQ-2024-0892",
        user_id: "CUST-77104",
        system_name: "Customer Accounts DB",
        event_timestamp: "2024-03-18T11:05:00Z",
        operator_status: "TOMBSTONE_CREATED",
        identifiers_claimed_deleted: "david.vance@vancetech.io, David Vance"
      },
      {
        event_id: "EVT-77104-02",
        request_id: "DEL-REQ-2024-0892",
        user_id: "CUST-77104",
        system_name: "CRM HubSpot",
        event_timestamp: "2024-03-18T11:08:00Z",
        operator_status: "PURGED",
        identifiers_claimed_deleted: "david.vance@vancetech.io"
      },
      {
        event_id: "EVT-91024-01",
        request_id: "DEL-REQ-2024-0893",
        user_id: "CUST-91024",
        system_name: "Customer Accounts DB",
        event_timestamp: "2024-03-25T14:47:00Z",
        operator_status: "CLOSED",
        identifiers_claimed_deleted: "elena.cruz@lawfirm-partner.org"
      }
    ],

    "retention_records.csv": [
      {
        retention_id: "RET-ORD-99104",
        user_id: "CUST-84920",
        category: "TAX_AND_ACCOUNTING",
        legal_statute: "IRS 26 U.S.C. § 6001 (7 Year Rule)",
        mandatory_until: "2030-11-24T00:00:00Z",
        permitted_fields: "order_id, user_id, amount, tax_code, order_date",
        is_preserved: "true"
      },
      {
        retention_id: "RET-ORD-77101",
        user_id: "CUST-77104",
        category: "TAX_AND_ACCOUNTING",
        legal_statute: "IRS 26 U.S.C. § 6001 (7 Year Rule)",
        mandatory_until: "2030-05-10T00:00:00Z",
        permitted_fields: "order_id, user_id, amount, tax_code, order_date",
        is_preserved: "true"
      },
      {
        retention_id: "RET-DISP-91001",
        user_id: "CUST-91024",
        category: "LITIGATION_HOLD_CHARGEBACK",
        legal_statute: "Card Brand Dispute Rules & Civil Litigation Defense",
        mandatory_until: "2025-02-14T00:00:00Z",
        permitted_fields: "order_id, user_id, amount, billing_address, chargeback_id",
        is_preserved: "true"
      },
      {
        retention_id: "RET-ORD-10022",
        user_id: "CUST-10042",
        category: "TAX_AND_ACCOUNTING",
        legal_statute: "IRS 26 U.S.C. § 6001",
        mandatory_until: "2031-01-20T00:00:00Z",
        permitted_fields: "order_id, user_id, amount, tax_code, order_date",
        is_preserved: "true"
      }
    ]
  }
};
