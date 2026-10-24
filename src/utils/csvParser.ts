// CSV Parsing, Normalization, and Exporting Utilities

export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  duplicateCount: number;
  hasErrors: boolean;
  errors: string[];
}

export function parseCsv(csvText: string): ParsedCsvResult {
  const errors: string[] = [];
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      headers: [],
      rows: [],
      rowCount: 0,
      duplicateCount: 0,
      hasErrors: true,
      errors: ['File is empty']
    };
  }

  // Parse header line safely handling quotes
  const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];
  const seenKeys = new Set<string>();
  let duplicateCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const values = parseCsvLine(rawLine);
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index].trim() : '';
    });

    const signature = JSON.stringify(row);
    if (seenKeys.has(signature)) {
      duplicateCount++;
    } else {
      seenKeys.add(signature);
    }

    rows.push(row);
  }

  return {
    headers,
    rows,
    rowCount: rows.length,
    duplicateCount,
    hasErrors: errors.length > 0,
    errors
  };
}

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export function exportToCsv(rows: Record<string, any>[]): string {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');

  const bodyLines = rows.map(row => {
    return headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${strVal.replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headerLine, ...bodyLines].join('\n');
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || '';
  const parts = email.split('@');
  const user = parts[0];
  const domain = parts[1];
  const maskedUser = user.length > 2 
    ? `${user[0]}***${user[user.length - 1]}`
    : `${user[0]}***`;
  const domainParts = domain.split('.');
  const domainName = domainParts[0];
  const tld = domainParts.slice(1).join('.');
  const maskedDomain = domainName.length > 2
    ? `${domainName[0]}***${domainName[domainName.length - 1]}`
    : `${domainName[0]}***`;
  return `${maskedUser}@${maskedDomain}.${tld}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.length <= 4) return '***';
  return `${digits.slice(0, 4)}***${digits.slice(-4)}`;
}

export function maskName(name: string): string {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.map(p => p.length > 1 ? `${p[0]}***` : p).join(' ');
}
