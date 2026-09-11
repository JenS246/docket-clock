'use client';

import { useMemo, useState } from 'react';
import caseBank from '@/data/cases.json';
import { formatDate, formatDuration, type CaseRecord } from '@/lib/game-core';

const CASES = caseBank as CaseRecord[];

export default function CaseLibrary({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('All subjects');
  const subjects = useMemo(() => ['All subjects', ...new Set(CASES.map((item) => item.subject))].sort(), []);
  const matches = useMemo(() => CASES.filter((item) => {
    const includesText = `${item.caseName} ${item.subject} ${item.summary}`.toLowerCase().includes(query.toLowerCase());
    return includesText && (subject === 'All subjects' || item.subject === subject);
  }).slice(0, 80), [query, subject]);

  return (
    <main className="utility-shell">
      <UtilityHeader title="Case explorer" onBack={onBack} />
      <section className="library-intro"><p className="eyebrow">Source-first browsing</p><h2>Every playable interval, in one place.</h2><p>Search the verified records, inspect the dates used in the game, and open the underlying sources.</p></section>
      <div className="library-controls">
        <label htmlFor="case-search">Search<input id="case-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Case, topic, company, court" /></label>
        <label htmlFor="subject-filter">Subject<select id="subject-filter" value={subject} onChange={(event) => setSubject(event.target.value)}>{subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <p className="match-count" aria-live="polite">Showing {matches.length} of {CASES.length} records</p>
      <div className="case-grid">
        {matches.map((item) => (
          <article key={item.id}>
            <p>{item.subject}</p><h3>{item.caseName}</h3><span>{item.familiarity}</span><strong>{formatDuration(item.elapsedMonths, true)}</strong>
            <details><summary>View measured interval</summary><p>{item.startEvent}: {formatDate(item.startDate)}</p><p>{item.endpoint}: {formatDate(item.endpointDate)}</p><a href={item.primarySources[0]} target="_blank" rel="noreferrer">Open supporting source</a></details>
          </article>
        ))}
      </div>
    </main>
  );
}

function UtilityHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return <header className="utility-header"><button className="brand compact" type="button" onClick={onBack}><span className="brand-mark" aria-hidden="true">12</span><span>DOCKET CLOCK</span></button><h1>{title}</h1><button className="text-button" type="button" onClick={onBack}>Back to game</button></header>;
}
