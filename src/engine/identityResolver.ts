import { IdentityLink, MatchConfidence } from '../types';
import { maskEmail, maskPhone, maskName } from '../utils/csvParser';

export interface ResolvedCustomerIdentity {
  userId: string;
  primaryEmail: string;
  emails: Set<string>;
  emailHashes: Set<string>;
  phones: Set<string>;
  names: Set<string>;
  aliases: Set<string>;
  orderIds: Set<string>;
  ticketIds: Set<string>;
  links: IdentityLink[];
}

export function resolveCustomerIdentity(
  targetUserId: string,
  files: Record<string, any[]>
): ResolvedCustomerIdentity {
  const normalizedTargetId = targetUserId.trim();
  const emails = new Set<string>();
  const emailHashes = new Set<string>();
  const phones = new Set<string>();
  const names = new Set<string>();
  const aliases = new Set<string>();
  const orderIds = new Set<string>();
  const ticketIds = new Set<string>();
  const links: IdentityLink[] = [];

  let primaryEmail = '';

  // 1. Inspect customer_accounts.csv
  const accounts = files['customer_accounts.csv'] || [];
  accounts.forEach((acc, idx) => {
    if (acc.user_id === normalizedTargetId) {
      if (acc.email && acc.email.trim()) {
        const normEmail = acc.email.trim().toLowerCase();
        emails.add(normEmail);
        primaryEmail = normEmail;
        links.push({
          id: `link-acc-email-${idx}`,
          userId: normalizedTargetId,
          identifierType: 'PRIMARY_EMAIL',
          rawIdentifierValue: acc.email,
          maskedIdentifierValue: maskEmail(acc.email),
          confidence: 'CONFIRMED_MATCH',
          sourceFile: 'customer_accounts.csv',
          sourceRecordId: acc.user_id,
          matchingMethod: 'DETERMINISTIC_ACCOUNT_MASTER',
          reason: 'Primary email address in account master database.'
        });
      }
      if (acc.phone && acc.phone.trim()) {
        const normPhone = acc.phone.trim();
        phones.add(normPhone);
        links.push({
          id: `link-acc-phone-${idx}`,
          userId: normalizedTargetId,
          identifierType: 'PHONE_NUMBER',
          rawIdentifierValue: acc.phone,
          maskedIdentifierValue: maskPhone(acc.phone),
          confidence: 'CONFIRMED_MATCH',
          sourceFile: 'customer_accounts.csv',
          sourceRecordId: acc.user_id,
          matchingMethod: 'DETERMINISTIC_ACCOUNT_MASTER',
          reason: 'Primary telephone number in account master database.'
        });
      }
      if (acc.full_name && acc.full_name.trim() && !acc.full_name.includes('[DELETED')) {
        names.add(acc.full_name.trim());
        links.push({
          id: `link-acc-name-${idx}`,
          userId: normalizedTargetId,
          identifierType: 'LEGAL_NAME',
          rawIdentifierValue: acc.full_name,
          maskedIdentifierValue: maskName(acc.full_name),
          confidence: 'CONFIRMED_MATCH',
          sourceFile: 'customer_accounts.csv',
          sourceRecordId: acc.user_id,
          matchingMethod: 'DETERMINISTIC_ACCOUNT_MASTER',
          reason: 'Legal customer name registered on primary account.'
        });
      }
    }
  });

  // 2. Inspect identity_history.csv
  const idHistory = files['identity_history.csv'] || [];
  idHistory.forEach((item, idx) => {
    if (item.user_id === normalizedTargetId) {
      const type = (item.identifier_type || '').toUpperCase();
      const val = item.identifier_value || '';
      if (!val) return;

      const isHist = item.is_active === 'false';

      if (type.includes('EMAIL') && !type.includes('HASH')) {
        const norm = val.toLowerCase().trim();
        emails.add(norm);
        links.push({
          id: `link-hist-email-${idx}`,
          userId: normalizedTargetId,
          identifierType: isHist ? 'HISTORICAL_EMAIL' : 'EMAIL_ALIAS',
          rawIdentifierValue: val,
          maskedIdentifierValue: maskEmail(val),
          confidence: 'CONFIRMED_MATCH',
          sourceFile: 'identity_history.csv',
          sourceRecordId: item.history_id || `IDH-${idx}`,
          matchingMethod: 'DETERMINISTIC_IDENTITY_LOG',
          reason: isHist ? 'Former email address previously attached to account.' : 'Current secondary email registered in identity history.',
          isHistorical: isHist
        });
      } else if (type.includes('HASH')) {
        emailHashes.add(val.trim());
        links.push({
          id: `link-hist-hash-${idx}`,
          userId: normalizedTargetId,
          identifierType: 'SHA256_EMAIL_HASH',
          rawIdentifierValue: val,
          maskedIdentifierValue: `${val.slice(0, 6)}...${val.slice(-6)}`,
          confidence: 'CONFIRMED_MATCH',
          sourceFile: 'identity_history.csv',
          sourceRecordId: item.history_id || `IDH-${idx}`,
          matchingMethod: 'CRYPTOGRAPHIC_HASH_RECORD',
          reason: 'SHA-256 identifier hash registered in historical catalog.'
        });
      } else if (type.includes('PHONE')) {
        phones.add(val.trim());
        links.push({
          id: `link-hist-phone-${idx}`,
          userId: normalizedTargetId,
          identifierType: isHist ? 'HISTORICAL_PHONE' : 'PHONE_NUMBER',
          rawIdentifierValue: val,
          maskedIdentifierValue: maskPhone(val),
          confidence: 'CONFIRMED_MATCH',
          sourceFile: 'identity_history.csv',
          sourceRecordId: item.history_id || `IDH-${idx}`,
          matchingMethod: 'DETERMINISTIC_IDENTITY_LOG',
          reason: 'Telephone number logged in identity lifecycle ledger.',
          isHistorical: isHist
        });
      } else if (type.includes('ALIAS') || type.includes('HANDLE')) {
        aliases.add(val.trim());
        links.push({
          id: `link-hist-alias-${idx}`,
          userId: normalizedTargetId,
          identifierType: 'USERNAME_ALIAS',
          rawIdentifierValue: val,
          maskedIdentifierValue: `${val.slice(0, 2)}***`,
          confidence: 'CONFIRMED_MATCH',
          sourceFile: 'identity_history.csv',
          sourceRecordId: item.history_id || `IDH-${idx}`,
          matchingMethod: 'DETERMINISTIC_IDENTITY_LOG',
          reason: 'Social/forum alias linked in historical identity catalog.'
        });
      }
    }
  });

  // 3. Inspect orders.csv
  const orders = files['orders.csv'] || [];
  orders.forEach((ord, idx) => {
    if (ord.user_id === normalizedTargetId) {
      if (ord.order_id) orderIds.add(ord.order_id);
      if (ord.shipping_name && !ord.shipping_name.includes('[REDACTED')) {
        names.add(ord.shipping_name.trim());
      }
    }
  });

  // 4. Inspect support_attachments.csv
  const attachments = files['support_attachments.csv'] || [];
  attachments.forEach((att) => {
    if (att.user_id === normalizedTargetId && att.ticket_id) {
      ticketIds.add(att.ticket_id);
    }
  });

  // 5. Inspect customer_profiles.csv (CRM)
  const crmProfiles = files['customer_profiles.csv'] || [];
  crmProfiles.forEach((prof, idx) => {
    if (prof.user_id === normalizedTargetId) {
      if (prof.crm_email && prof.crm_email.trim()) {
        const norm = prof.crm_email.trim().toLowerCase();
        emails.add(norm);
        if (!primaryEmail) primaryEmail = norm;
        links.push({
          id: `link-crm-${idx}`,
          userId: normalizedTargetId,
          identifierType: 'CRM_PROFILE_EMAIL',
          rawIdentifierValue: prof.crm_email,
          maskedIdentifierValue: maskEmail(prof.crm_email),
          confidence: 'CONFIRMED_MATCH',
          sourceFile: 'customer_profiles.csv',
          sourceRecordId: prof.profile_id || `CRM-${idx}`,
          matchingMethod: 'FOREIGN_KEY_USER_ID',
          reason: 'CRM customer profile actively referencing user_id.'
        });
      }
    }
  });

  return {
    userId: normalizedTargetId,
    primaryEmail,
    emails,
    emailHashes,
    phones,
    names,
    aliases,
    orderIds,
    ticketIds,
    links
  };
}
