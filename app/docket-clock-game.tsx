'use client';

import { useState } from 'react';

const previewCase = {
  name: 'Brown v. Board of Education',
  summary: 'Families challenged laws that separated public-school students by race.',
  start: 'First Supreme Court argument',
  startDate: 'December 9, 1952',
  endpoint: 'the Supreme Court decision',
};

function formatGuess(totalMonths: number) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'}`;
}

export default function DocketClockGame() {
  const [screen, setScreen] = useState<'home' | 'round'>('home');
  const [months, setMonths] = useState(24);

  if (screen === 'home') {
    return (
      <main className="home-shell">
        <div className="background-notes" aria-hidden="true">
          <span className="note-citation">347 U.S. 483</span>
          <span className="note-calendar">MAY 17</span>
          <span className="note-section">§</span>
        </div>
        <header className="brand-row">
          <a className="brand" href="#top" aria-label="Docket Clock home">
            <span className="brand-mark" aria-hidden="true">12</span>
            <span>DOCKET CLOCK</span>
          </a>
          <button className="text-button" type="button">How to play</button>
        </header>
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">A civil litigation guessing game</p>
            <h1>How long did justice take?</h1>
            <p className="hero-subtitle">Guess the time between two real events, then see how the case moved.</p>
            <div className="start-actions">
              <button className="primary-button" type="button" onClick={() => setScreen('round')}>Play 5 cases</button>
              <button className="secondary-button" type="button" onClick={() => setScreen('round')}>Play 10</button>
            </div>
          </div>
          <div className="clock-preview" aria-label="Example time-guessing control">
            <div className="preview-case">BROWN</div>
            <div className="clock-face">
              <span className="clock-number clock-zero">0</span>
              <span className="clock-number clock-six">6</span>
              <span className="clock-number clock-twelve">12</span>
              <span className="clock-number clock-eighteen">18</span>
              <div className="clock-hand" />
              <div className="clock-pin" />
            </div>
            <p><strong>2 years</strong><span>your guess</span></p>
          </div>
        </section>
        <div className="home-footnote">
          <span>200 sourced cases</span>
          <span>Built for touch, mouse, and keyboard</span>
        </div>
      </main>
    );
  }

  return (
    <main className="round-shell">
      <header className="round-header">
        <button className="brand compact" type="button" onClick={() => setScreen('home')}>
          <span className="brand-mark" aria-hidden="true">12</span>
          <span>DOCKET CLOCK</span>
        </button>
        <p><strong>Case 1</strong> of 5</p>
        <p className="score">0 pts</p>
      </header>
      <section className="case-layout" aria-labelledby="case-name">
        <article className="case-copy">
          <p className="case-category">Civil Rights</p>
          <h1 id="case-name">{previewCase.name}</h1>
          <p className="case-summary">{previewCase.summary}</p>
          <dl className="measure-card">
            <div>
              <dt>Start</dt>
              <dd>{previewCase.start}<span>{previewCase.startDate}</span></dd>
            </div>
            <div>
              <dt>Finish</dt>
              <dd>{previewCase.endpoint}<span>Date hidden until reveal</span></dd>
            </div>
          </dl>
        </article>
        <form className="guess-panel" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="duration">How long did it take?</label>
          <output htmlFor="duration" className="guess-output" aria-live="polite">
            <strong>{Math.floor(months / 12)}</strong> years
            <strong>{months % 12}</strong> months
          </output>
          <input id="duration" type="range" min="0" max="240" step="1" value={months} onChange={(event) => setMonths(Number(event.target.value))} aria-valuetext={formatGuess(months)} />
          <div className="range-labels" aria-hidden="true"><span>0</span><span>10 years</span><span>20+</span></div>
          <button className="primary-button submit-button" type="submit">Submit guess</button>
          <button className="skip-button" type="button">I don&apos;t know this case</button>
        </form>
      </section>
    </main>
  );
}
