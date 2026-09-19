'use client';

import { useState } from 'react';
import caseBank from '@/data/cases.json';
import { parseCaseFile, validateCaseRecords, type ValidationIssue } from '@/lib/case-import';
import type { CaseRecord } from '@/lib/game-core';

const CASES = caseBank as CaseRecord[];

export default function CaseManager({ onBack }: { onBack: () => void }) {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [recordCount, setRecordCount] = useState(0);
  const [message, setMessage] = useState('Choose a JSON or CSV file to run the same checks used for the production case bank.');

  const inspect = async (file: File | undefined) => {
    if (!file) return;
    try {
      const records = parseCaseFile(file.name, await file.text());
      const report = validateCaseRecords(records);
      setRecordCount(records.length);
      setIssues(report);
      setMessage(report.some((item) => item.severity === 'error') ? 'Fix the errors before merging these records.' : 'No blocking errors found. Review warnings before publishing.');
    } catch (error) {
      setRecordCount(0);
      setIssues([{ row: 0, id: 'file', severity: 'error', message: error instanceof Error ? error.message : 'The file could not be read.' }]);
      setMessage('The import could not be parsed.');
    }
  };

  return (
    <main className="utility-shell">
      <UtilityHeader title="Case data manager" onBack={onBack} />
      <section className="manager-card">
        <p className="eyebrow">Editor check</p><h2>Validate before a case enters play.</h2>
        <p>The public bank currently contains <strong>{CASES.length} verified intervals</strong>. Imports are checked for dates, chronology, sources, duplicates, timelines, familiarity, and verification status.</p>
        <label className="file-drop" htmlFor="case-file"><span>Choose case data</span><small>Accepts .json or .csv</small><input id="case-file" type="file" accept=".json,.csv,text/csv,application/json" onChange={(event) => inspect(event.target.files?.[0])} /></label>
        <p className="validation-message" aria-live="polite">{message}</p>
        {recordCount > 0 && <p className="validation-count">{recordCount} records checked, {issues.filter((item) => item.severity === 'error').length} errors, {issues.filter((item) => item.severity === 'warning').length} warnings.</p>}
        {issues.length > 0 && <ul className="issue-list">{issues.slice(0, 100).map((item, index) => <li className={item.severity} key={`${item.id}-${item.message}-${index}`}><strong>{item.severity}</strong><span>Row {item.row || 'file'}: {item.message}</span></li>)}</ul>}
      </section>
    </main>
  );
}

function UtilityHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return <header className="utility-header"><button className="brand compact" type="button" onClick={onBack}><span className="brand-mark" aria-hidden="true" /><span>Docket Clock</span></button><h1>{title}</h1><button className="text-button" type="button" onClick={onBack}>Back to game</button></header>;
}
