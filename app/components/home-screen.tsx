'use client';

import { useRef } from 'react';
import { GAME_CATEGORIES, type GameCategory } from '@/lib/game-core';

type Props = {
  category: GameCategory;
  gameLength: number;
  onCategory: (category: GameCategory) => void;
  onExplore: () => void;
  onLength: (length: number) => void;
  onManage: () => void;
  onStart: () => void;
};

export default function HomeScreen(props: Props) {
  const howDialog = useRef<HTMLDialogElement>(null);
  return (
    <main className="home-shell">
      <div className="background-notes" aria-hidden="true">
        <span className="note-citation">347 U.S. 483</span>
        <span className="note-calendar">FILED</span>
        <span className="note-section">§</span>
      </div>
      <header className="brand-row">
        <a className="brand" href="#top" aria-label="Docket Clock home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Docket Clock</span>
        </a>
        <button className="text-button" type="button" onClick={() => howDialog.current?.showModal()}>How to play</button>
      </header>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">A civil litigation guessing game</p>
          <h1>How long did justice take?</h1>
          <p className="hero-subtitle">Guess the time from the first complaint to a major decision or final resolution, then see the full path.</p>
          <fieldset className="length-picker">
            <legend>Choose a game</legend>
            {[5, 10].map((length) => (
              <button key={length} className={props.gameLength === length ? 'choice active' : 'choice'} type="button" aria-pressed={props.gameLength === length} onClick={() => props.onLength(length)}>
                <strong>{length}</strong>
                <span>{length === 5 ? 'Quick Round' : 'Full Docket'}</span>
              </button>
            ))}
          </fieldset>
          <label className="category-picker" htmlFor="category">Choose cases
            <select id="category" value={props.category} onChange={(event) => props.onCategory(event.target.value as GameCategory)}>
              {GAME_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <button className="primary-button home-start" type="button" onClick={props.onStart}>Start game</button>
        </div>
        <div className="clock-preview" aria-hidden="true">
          <div className="clock-note"><span>?</span></div>
          <div className="clock-face">
            <span className="clock-number clock-zero">12</span>
            <span className="clock-number clock-six">3</span>
            <span className="clock-number clock-twelve">6</span>
            <span className="clock-number clock-eighteen">9</span>
            <div className="clock-hand clock-hand-hour" />
            <div className="clock-hand clock-hand-minute" />
            <div className="clock-pin" />
          </div>
        </div>
      </section>
      <div className="home-footnote">
        <span className="home-prompt">Pick a docket. Make the call.</span>
        <button className="text-button" type="button" onClick={props.onExplore}>Explore the cases</button>
        <button className="text-button" type="button" onClick={props.onManage}>Manage case data</button>
      </div>
      <dialog className="how-dialog" ref={howDialog} aria-labelledby="how-title">
        <button className="dialog-close" type="button" onClick={() => howDialog.current?.close()}>Close</button>
        <h2 id="how-title">How to play</h2>
        <ol>
          <li>See when the first complaint was filed.</li>
          <li>Estimate the time to the hidden decision or resolution.</li>
          <li>Reveal the real timeline and learn what happened.</li>
        </ol>
        <p>Move the slider with touch, mouse, or arrow keys. Skipping an unfamiliar case never changes your score.</p>
      </dialog>
    </main>
  );
}
