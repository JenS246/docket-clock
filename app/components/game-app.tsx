'use client';

import { useState } from 'react';
import caseBank from '@/data/cases.json';
import {
  feedbackFor,
  formatDate,
  formatDuration,
  scoreGuess,
  selectCases,
  summarizeGame,
  type CaseRecord,
  type GameCategory,
  type RoundResult,
} from '@/lib/game-core';
import CaseLibrary from './case-library';
import CaseManager from './case-manager';
import HomeScreen from './home-screen';

const CASES = caseBank as CaseRecord[];
const COMPLAINT_FIRST_COUNT = CASES.filter((item) => item.initialFilingDate && item.startDate === item.initialFilingDate).length;
const ROUND_COLORS = ['#ff5d45', '#7367f0', '#009b77', '#ed3f82', '#147cc1', '#dc7d09'];
type Screen = 'home' | 'round' | 'results' | 'library' | 'manage';

export default function GameApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [category, setCategory] = useState<GameCategory>('Most Recognizable');
  const [gameLength, setGameLength] = useState(5);
  const [gameCases, setGameCases] = useState<CaseRecord[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [guess, setGuess] = useState(24);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [shareStatus, setShareStatus] = useState('');

  const startGame = () => {
    const recent = readRecent();
    setGameCases(selectCases(CASES, gameLength, category, recent));
    setRoundIndex(0);
    setGuess(24);
    setResult(null);
    setResults([]);
    setShareStatus('');
    setScreen('round');
  };

  const currentCase = gameCases[roundIndex];

  const submitGuess = () => {
    if (!currentCase || result) return;
    const nextResult = { caseRecord: currentCase, guessedMonths: guess, ...scoreGuess(currentCase.elapsedMonths, guess) };
    setResult(nextResult);
    setResults((items) => [...items, nextResult]);
  };

  const nextRound = () => {
    if (roundIndex + 1 >= gameCases.length) {
      localStorage.setItem('docket-clock-recent', JSON.stringify([...gameCases.map((item) => item.id), ...readRecent()].slice(0, 80)));
      setScreen('results');
      return;
    }
    setRoundIndex((index) => index + 1);
    setGuess(24);
    setResult(null);
  };

  const skipCase = () => {
    if (!currentCase || result) return;
    const replacement = selectCases(CASES, 1, category, [...gameCases.map((item) => item.id), ...readRecent()])[0];
    if (replacement) setGameCases((items) => items.map((item, index) => index === roundIndex ? replacement : item));
  };

  const shareResults = async () => {
    const summary = summarizeGame(results);
    if (!summary) return;
    const text = `I scored ${summary.totalScore.toLocaleString()} in Docket Clock with ${summary.averageAccuracy}% average accuracy. How well do you know the pace of civil litigation?`;
    const canShare = typeof navigator.share === 'function';
    try {
      if (canShare) await navigator.share({ title: 'Docket Clock results', text, url: window.location.href });
      else await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      setShareStatus(canShare ? 'Shared.' : 'Results copied.');
    } catch {
      setShareStatus('Sharing canceled.');
    }
  };

  if (screen === 'home') {
    return <HomeScreen caseCount={COMPLAINT_FIRST_COUNT} category={category} gameLength={gameLength} onCategory={setCategory} onExplore={() => setScreen('library')} onLength={setGameLength} onManage={() => setScreen('manage')} onStart={startGame} />;
  }
  if (screen === 'library') return <CaseLibrary onBack={() => setScreen('home')} />;
  if (screen === 'manage') return <CaseManager onBack={() => setScreen('home')} />;
  if (screen === 'results') return <ResultsScreen results={results} shareStatus={shareStatus} onExplore={() => setScreen('library')} onHome={() => setScreen('home')} onPlayAgain={startGame} onShare={shareResults} />;
  if (!currentCase) return null;

  return (
    <main className="round-shell" style={{ '--round-color': ROUND_COLORS[roundIndex % ROUND_COLORS.length] } as React.CSSProperties}>
      <header className="round-header">
        <button className="brand compact" type="button" onClick={() => setScreen('home')} aria-label="Return home"><span className="brand-mark" aria-hidden="true">12</span><span>DOCKET CLOCK</span></button>
        <p className="round-progress" aria-label={`Case ${roundIndex + 1} of ${gameCases.length}`}><strong>CASE {roundIndex + 1}</strong><span aria-hidden="true"> / {gameCases.length}</span></p>
        <p className="score">{results.reduce((sum, item) => sum + item.score, 0).toLocaleString()} pts</p>
      </header>
      <section className="case-layout" aria-labelledby="case-name">
        <article className="case-copy">
          <p className="case-category">{currentCase.subject}</p>
          <p className="interval-badge">Complaint to {currentCase.endpoint}</p>
          <h1 id="case-name">{currentCase.caseName}</h1>
          <p className="filing-date"><span>Complaint filed</span><time dateTime={currentCase.startDate}>{formatDate(currentCase.startDate)}</time></p>
          <p className="case-summary">{currentCase.summary}</p>
          <dl className="measure-card">
            <div><dt>Start</dt><dd>{currentCase.startEvent}<span>{formatDate(currentCase.startDate)}</span></dd></div>
            <div><dt>Finish</dt><dd>{currentCase.endpoint}<span>{result ? formatDate(currentCase.endpointDate) : 'Date hidden until reveal'}</span></dd></div>
          </dl>
        </article>
        {!result ? (
          <form className="guess-panel" onSubmit={(event) => { event.preventDefault(); submitGuess(); }}>
            <label htmlFor="duration">How long did justice take?</label>
            <output htmlFor="duration" className="guess-output" aria-live="polite"><strong>{Math.floor(guess / 12)}</strong> years <strong>{guess % 12}</strong> months</output>
            <input id="duration" type="range" min="0" max="360" step="1" value={guess} onChange={(event) => setGuess(Number(event.target.value))} aria-valuetext={formatDuration(guess)} style={{ '--guess-percent': `${guess / 3.6}%` } as React.CSSProperties} />
            <div className="range-labels" aria-hidden="true"><span>0</span><span>15 years</span><span>30 years</span></div>
            <button className="primary-button submit-button" type="submit">Submit guess</button>
            <button className="skip-button" type="button" onClick={skipCase}>I don&apos;t know this case</button>
          </form>
        ) : <RevealPanel result={result} onNext={nextRound} isLast={roundIndex + 1 === gameCases.length} />}
      </section>
    </main>
  );
}

function readRecent() {
  try { return JSON.parse(localStorage.getItem('docket-clock-recent') || '[]') as string[]; }
  catch { return []; }
}

function RevealPanel({ result, onNext, isLast }: { result: RoundResult; onNext: () => void; isLast: boolean }) {
  const item = result.caseRecord;
  const difference = Math.abs(item.elapsedMonths - result.guessedMonths);
  return (
    <section className="reveal-panel" aria-live="polite">
      <p className="reveal-kicker">{feedbackFor(item.elapsedMonths, result.guessedMonths)}</p>
      <div className="answer-grid">
        <div className="guess-answer"><span>Your guess</span><strong>{formatDuration(result.guessedMonths, true)}</strong></div>
        <div className="actual-answer"><span>Actual time</span><strong>{formatDuration(item.elapsedMonths, true)}</strong></div>
      </div>
      <div className="reveal-summary"><strong>{difference === 0 ? 'Exact match' : `Off by ${formatDuration(difference, true)}`}</strong><span>+{result.score.toLocaleString()} points</span></div>
      <p className="measurement">This round starts with the filing on {formatDate(item.startDate)} and runs to {item.endpoint.toLowerCase()} on {formatDate(item.endpointDate)}.</p>
      <ol className="timeline" aria-label="Procedural timeline">{item.events.map((event, index) => {
        const isFirst = index === 0;
        const isFinal = index === item.events.length - 1;
        return <li className={isFirst ? 'timeline-start' : isFinal ? 'timeline-final' : 'timeline-event'} key={`${event.date}-${index}`}><time dateTime={event.date}>{formatDate(event.date)}</time><div><span className="timeline-role">{isFirst ? 'Complaint filed' : isFinal ? 'Decision or resolution' : 'Case event'}</span><strong>{event.label}</strong><span className="timeline-court">{event.court}</span></div></li>;
      })}</ol>
      <details><summary>Outcome and timing</summary><p>{item.outcome}</p><p>{item.durationExplanation}</p></details>
      <aside className="teaching-note"><strong>Litigation note</strong><p>{item.teachingNote}</p></aside>
      <div className="source-list"><strong>Sources</strong>{[...item.primarySources, ...item.secondarySources].map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer">Source {index + 1}</a>)}</div>
      <button className="primary-button next-button" type="button" onClick={onNext}>{isLast ? 'See results →' : 'Next case →'}</button>
    </section>
  );
}

function ResultsScreen({ results, shareStatus, onExplore, onHome, onPlayAgain, onShare }: { results: RoundResult[]; shareStatus: string; onExplore: () => void; onHome: () => void; onPlayAgain: () => void; onShare: () => void }) {
  const summary = summarizeGame(results);
  if (!summary) return null;
  return (
    <main className="results-shell"><button className="brand compact" type="button" onClick={onHome}><span className="brand-mark" aria-hidden="true">12</span><span>DOCKET CLOCK</span></button><section className="results-card"><p className="eyebrow">Docket closed</p><h1>{summary.totalScore.toLocaleString()} points</h1><p className="results-lede">Your average accuracy was <strong>{summary.averageAccuracy}%</strong>.</p><div className="stats-grid"><ResultStat label="Closest guess" value={summary.closest.caseRecord.shortName} /><ResultStat label="Underestimated most" value={summary.underestimatedMost?.caseRecord.shortName || 'None'} /><ResultStat label="Overestimated most" value={summary.overestimatedMost?.caseRecord.shortName || 'None'} /><ResultStat label="Longest encountered" value={formatDuration(summary.longest.caseRecord.elapsedMonths, true)} /><ResultStat label="Shortest encountered" value={formatDuration(summary.shortest.caseRecord.elapsedMonths, true)} /></div><div className="result-actions"><button className="primary-button" type="button" onClick={onPlayAgain}>Play again</button><button className="secondary-button" type="button" onClick={onHome}>Try different cases</button><button className="secondary-button" type="button" onClick={onShare}>Share results</button><button className="text-button" type="button" onClick={onExplore}>Explore the cases</button></div><p className="share-status" aria-live="polite">{shareStatus}</p></section></main>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
