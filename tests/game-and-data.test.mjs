import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  calendarMonths,
  durationParts,
  scoreGuess,
  selectCases,
} from '../lib/game-core.ts';

const cases = JSON.parse(readFileSync(new URL('../data/cases.json', import.meta.url), 'utf8'));

test('calendar month math handles partial months', () => {
  assert.equal(calendarMonths('2020-01-15', '2021-01-14'), 11);
  assert.equal(calendarMonths('2020-01-15', '2021-01-15'), 12);
  assert.deepEqual(durationParts(29), { years: 2, months: 5 });
});

test('scoring rewards closer proportional guesses', () => {
  assert.equal(scoreGuess(24, 24).score, 1000);
  assert.ok(scoreGuess(120, 108).score > scoreGuess(120, 48).score);
});

test('selection avoids duplicate cases and litigations', () => {
  const selected = selectCases(cases, 10, 'Surprise Me', [], () => 0.42);
  assert.equal(selected.length, 10);
  assert.equal(new Set(selected.map((item) => item.id)).size, 10);
  assert.equal(new Set(selected.map((item) => item.litigationId)).size, 10);
  assert.ok(selected.every((item) => item.initialFilingDate && item.startDate === item.initialFilingDate));
});

test('case bank contains 200-plus sourced verified intervals', () => {
  assert.ok(cases.length >= 200);
  assert.equal(new Set(cases.map((item) => item.id)).size, cases.length);
  assert.equal(new Set(cases.map((item) => `${item.litigationId}|${item.startDate}|${item.endpointDate}`)).size, cases.length);
  assert.ok(cases.every((item) => item.verificationStatus === 'Verified'));
  assert.ok(cases.every((item) => item.primarySources.length > 0));
  assert.ok(cases.every((item) => item.events.length >= 2));
  assert.ok(cases.every((item) => item.caseName.length < 160 && !item.caseName.includes('|')));
  assert.ok(cases.every((item) => calendarMonths(item.startDate, item.endpointDate) === item.elapsedMonths));
});

test('case bank has multi-court, multi-year, and subject variety', () => {
  const nonSupreme = cases.filter((item) => !item.categories.includes('Supreme Court Cases'));
  assert.ok(nonSupreme.length >= 60);
  assert.ok(cases.filter((item) => item.elapsedMonths >= 12).length >= 10);
  assert.ok(new Set(cases.map((item) => item.subject)).size >= 10);
  assert.ok(cases.every((item) => !item.startEvent.startsWith('Oral argument') || item.elapsedMonths <= 18));
});

test('active bank has a substantial complaint-first pool', () => {
  const complaintFirst = cases.filter((item) => item.initialFilingDate && item.startDate === item.initialFilingDate);
  assert.ok(complaintFirst.length >= 75);
  assert.ok(complaintFirst.filter((item) => item.familiarity === 'Household Name').length >= 30);
  assert.ok(complaintFirst.some((item) => item.elapsedMonths >= 84));
});

test('all specifically requested landmark cases are present', () => {
  const names = cases.map((item) => item.caseName);
  for (const landmark of ['Brown v. Board', 'Palsgraf v.', 'Erie Railroad', 'International Shoe', 'New York Times Company v. Sullivan', 'Loving v.', 'Tinker v.', 'Obergefell v.', 'Penn Central']) {
    assert.ok(names.some((name) => name.startsWith(landmark)), landmark);
  }
});

test('recognizable complaint-to-resolution cases are present', () => {
  const names = cases.map((item) => item.caseName);
  for (const familiar of [
    'Brown v. Board',
    'United States v. Microsoft',
    'Dominion Voting Systems v. Fox',
    'Deepwater Horizon',
    'Trump University',
    'Waymo LLC v. Uber',
    'Epic Games, Inc. v. Apple',
    'National Football League Players',
    'Volkswagen AG',
    'Apple Inc. v. Samsung',
    'Liebeck v. McDonald',
    'John C. Depp II v. Amber Laura Heard',
    'Sandy Hook',
    'George Floyd',
    'Breonna Taylor',
    'People of the State of New York v. Donald J. Trump',
    'Sines v. Kessler',
    'Equifax Inc.',
    'Facebook Biometric',
    'Flint Water',
    'Enron Corporation',
    'JUUL Labs',
    'Terry Gene Bollea v. Gawker',
    'David Mueller v. Taylor Swift',
    'Scarlett Johansson v. The Walt Disney Company',
    'Sharon Rufo et al. v. Orenthal James Simpson',
  ]) {
    assert.ok(names.some((name) => name.includes(familiar)), familiar);
  }
});

test('visible case copy contains no long dash characters', () => {
  assert.doesNotMatch(JSON.stringify(cases), /[—–]/);
});
