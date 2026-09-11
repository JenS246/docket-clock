import { calendarMonths, FAMILIARITY, type CaseRecord } from './game-core';

export type ValidationIssue = {
  row: number;
  id: string;
  severity: 'error' | 'warning';
  message: string;
};

const requiredText = [
  'id', 'litigationId', 'caseName', 'shortName', 'citation', 'summary', 'subject',
  'startEvent', 'startDate', 'endpoint', 'endpointDate', 'outcome',
  'durationExplanation', 'teachingNote', 'verificationStatus', 'lastReviewed',
] as const;

function isDate(value: unknown) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
}

export function validateCaseRecords(records: unknown[], existing: CaseRecord[] = []) {
  const issues: ValidationIssue[] = [];
  const seenIds = new Set(existing.map((item) => item.id));
  const seenIntervals = new Set(existing.map((item) => `${item.litigationId}|${item.startDate}|${item.endpointDate}`));
  records.forEach((candidate, index) => {
    const item = candidate as Partial<CaseRecord>;
    const row = index + 1;
    const id = String(item.id || `row-${row}`);
    requiredText.forEach((key) => {
      if (typeof item[key] !== 'string' || !item[key]?.trim()) issues.push({ row, id, severity: 'error', message: `Missing ${key}.` });
    });
    if (seenIds.has(id)) issues.push({ row, id, severity: 'error', message: 'Duplicate case ID.' });
    seenIds.add(id);
    if (!isDate(item.startDate) || !isDate(item.endpointDate)) {
      issues.push({ row, id, severity: 'error', message: 'Start and endpoint dates must use YYYY-MM-DD.' });
    } else {
      if (item.endpointDate! <= item.startDate!) issues.push({ row, id, severity: 'error', message: 'Endpoint must come after the starting event.' });
      const calculated = calendarMonths(item.startDate!, item.endpointDate!);
      if (item.elapsedMonths !== calculated) issues.push({ row, id, severity: 'error', message: `Elapsed time should be ${calculated} months.` });
      const interval = `${item.litigationId}|${item.startDate}|${item.endpointDate}`;
      if (seenIntervals.has(interval)) issues.push({ row, id, severity: 'error', message: 'Duplicate playable interval.' });
      seenIntervals.add(interval);
    }
    if (!FAMILIARITY.includes(item.familiarity as never)) issues.push({ row, id, severity: 'error', message: 'Missing or invalid familiarity rating.' });
    if (!Array.isArray(item.primarySources) || !item.primarySources.length) issues.push({ row, id, severity: 'error', message: 'At least one source link is required.' });
    if (!Array.isArray(item.events) || item.events.length < 2) issues.push({ row, id, severity: 'error', message: 'Procedural timeline needs at least two dated events.' });
    if (!Array.isArray(item.courts) || !item.courts.length) issues.push({ row, id, severity: 'error', message: 'At least one court is required.' });
    if (!item.initialFilingDate) issues.push({ row, id, severity: 'warning', message: 'Initial complaint date is not established for this appellate interval.' });
    if (item.verificationStatus !== 'Verified') issues.push({ row, id, severity: 'warning', message: 'Only Verified records appear in gameplay.' });
  });
  return issues;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { cells.push(value.trim()); value = ''; }
    else value += character;
  }
  cells.push(value.trim());
  return cells;
}

export function parseCaseFile(name: string, source: string): unknown[] {
  if (name.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(source);
    return Array.isArray(parsed) ? parsed : [parsed];
  }
  const lines = source.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error('CSV needs a header and at least one record.');
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => {
      const raw = values[index] || '';
      if (['categories', 'events', 'courts', 'primarySources', 'secondarySources'].includes(header)) {
        try { return [header, JSON.parse(raw)]; } catch { return [header, raw.split('|').filter(Boolean)]; }
      }
      if (header === 'elapsedMonths') return [header, Number(raw)];
      if (header === 'initialFilingDate' && !raw) return [header, null];
      return [header, raw];
    }));
  });
}
