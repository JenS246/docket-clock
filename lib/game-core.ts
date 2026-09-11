export const FAMILIARITY = [
  'Household Name',
  'Widely Taught',
  'Civil Litigation Classic',
  'Surprising Case',
] as const;

export const GAME_CATEGORIES = [
  'Most Recognizable',
  'Civil Litigation Classics',
  'Supreme Court Cases',
  'Companies and Products',
  'Celebrities and Entertainment',
  'Civil Rights',
  'Technology and Privacy',
  'Environmental Litigation',
  'Class Actions and Mass Torts',
  'Longest Cases',
  'Quickest Cases',
  'Surprise Me',
] as const;

export type Familiarity = (typeof FAMILIARITY)[number];
export type GameCategory = (typeof GAME_CATEGORIES)[number];

export type TimelineEvent = {
  date: string;
  label: string;
  court: string;
};

export type CaseRecord = {
  id: string;
  litigationId: string;
  caseName: string;
  shortName: string;
  citation: string;
  summary: string;
  subject: string;
  categories: string[];
  familiarity: Familiarity;
  startEvent: string;
  startDate: string;
  initialFilingDate: string | null;
  initialFilingDateNote?: string;
  endpoint: string;
  endpointDate: string;
  elapsedMonths: number;
  events: TimelineEvent[];
  courts: string[];
  outcome: string;
  durationExplanation: string;
  teachingNote: string;
  primarySources: string[];
  secondarySources: string[];
  verificationStatus: 'Verified' | 'Needs Review' | 'Incomplete';
  lastReviewed: string;
};

export type RoundResult = {
  caseRecord: CaseRecord;
  guessedMonths: number;
  score: number;
  accuracy: number;
};

export function calendarMonths(start: string, end: string) {
  const first = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);
  let months = (last.getUTCFullYear() - first.getUTCFullYear()) * 12 + last.getUTCMonth() - first.getUTCMonth();
  if (last.getUTCDate() < first.getUTCDate()) months -= 1;
  return Math.max(0, months);
}

export function durationParts(totalMonths: number) {
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 };
}

export function formatDuration(totalMonths: number, compact = false) {
  const { years, months } = durationParts(Math.max(0, Math.round(totalMonths)));
  if (years === 0 && months === 0) return 'less than 1 month';
  const yearText = `${years} ${years === 1 ? 'year' : 'years'}`;
  const monthText = `${months} ${months === 1 ? 'month' : 'months'}`;
  if (compact) {
    if (!years) return monthText;
    if (!months) return yearText;
  }
  return `${yearText}, ${monthText}`;
}

export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

export function scoreGuess(actualMonths: number, guessedMonths: number) {
  const difference = Math.abs(actualMonths - guessedMonths);
  const forgivingWindow = Math.max(12, actualMonths * 1.25);
  const accuracy = Math.max(0, 1 - difference / forgivingWindow);
  const score = difference === 0 ? 1000 : Math.round(1000 * accuracy ** 1.35);
  return { difference, accuracy, score };
}

export function feedbackFor(actualMonths: number, guessedMonths: number) {
  const difference = Math.abs(actualMonths - guessedMonths);
  if (difference === 0) return 'Exactly right';
  if (difference <= 1) return 'Almost exact';
  if (difference <= 3) return `Only ${difference} months off`;
  const relation = guessedMonths < actualMonths ? 'underestimated' : 'overestimated';
  if (actualMonths > 0 && guessedMonths > 0 && actualMonths >= guessedMonths * 1.8) {
    return 'This case lasted nearly twice as long as your guess';
  }
  return `You ${relation} it by ${formatDuration(difference, true)}`;
}

function shuffle<T>(items: T[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function poolForCategory(cases: CaseRecord[], category: GameCategory) {
  if (category === 'Most Recognizable') {
    return cases.filter((item) => ['Household Name', 'Widely Taught', 'Civil Litigation Classic'].includes(item.familiarity));
  }
  if (category === 'Civil Litigation Classics') {
    return cases.filter((item) => item.familiarity === 'Civil Litigation Classic' || item.categories.includes(category));
  }
  if (category === 'Longest Cases' || category === 'Quickest Cases') {
    const sorted = [...cases].sort((a, b) => a.elapsedMonths - b.elapsedMonths);
    const size = Math.max(20, Math.ceil(sorted.length * 0.3));
    return category === 'Quickest Cases' ? sorted.slice(0, size) : sorted.slice(-size);
  }
  if (category === 'Surprise Me') return cases;
  return cases.filter((item) => item.categories.includes(category) || item.subject === category);
}

export function selectCases(
  cases: CaseRecord[],
  gameLength: number,
  category: GameCategory,
  recentlyShown: string[] = [],
  random: () => number = Math.random,
) {
  const filingToEndpoint = cases.filter((item) =>
    item.verificationStatus === 'Verified'
    && Boolean(item.initialFilingDate)
    && item.startDate === item.initialFilingDate,
  );
  let pool = poolForCategory(filingToEndpoint, category);
  if (pool.length < gameLength) pool = filingToEndpoint;
  const recent = new Set(recentlyShown);
  const fresh = pool.filter((item) => !recent.has(item.id));
  const candidates = shuffle(fresh.length >= gameLength ? fresh : pool, random);
  const selected: CaseRecord[] = [];
  const litigations = new Set<string>();

  while (selected.length < gameLength && candidates.length) {
    const previous = selected.at(-1);
    const preferredIndex = candidates.findIndex((item) =>
      !litigations.has(item.litigationId)
      && (!previous || item.subject !== previous.subject)
      && (!previous || item.courts.join('|') !== previous.courts.join('|')),
    );
    const fallbackIndex = candidates.findIndex((item) => !litigations.has(item.litigationId));
    const index = preferredIndex >= 0 ? preferredIndex : fallbackIndex;
    if (index < 0) break;
    const [next] = candidates.splice(index, 1);
    selected.push(next);
    litigations.add(next.litigationId);
  }
  return selected;
}

export function summarizeGame(results: RoundResult[]) {
  if (!results.length) return null;
  const byDifference = [...results].sort((a, b) => Math.abs(a.guessedMonths - a.caseRecord.elapsedMonths) - Math.abs(b.guessedMonths - b.caseRecord.elapsedMonths));
  const underestimated = [...results].filter((item) => item.guessedMonths < item.caseRecord.elapsedMonths).sort((a, b) => (b.caseRecord.elapsedMonths - b.guessedMonths) - (a.caseRecord.elapsedMonths - a.guessedMonths));
  const overestimated = [...results].filter((item) => item.guessedMonths > item.caseRecord.elapsedMonths).sort((a, b) => (b.guessedMonths - b.caseRecord.elapsedMonths) - (a.guessedMonths - a.caseRecord.elapsedMonths));
  const byLength = [...results].sort((a, b) => a.caseRecord.elapsedMonths - b.caseRecord.elapsedMonths);
  return {
    totalScore: results.reduce((sum, item) => sum + item.score, 0),
    averageAccuracy: Math.round(results.reduce((sum, item) => sum + item.accuracy, 0) / results.length * 100),
    closest: byDifference[0],
    underestimatedMost: underestimated[0] || null,
    overestimatedMost: overestimated[0] || null,
    shortest: byLength[0],
    longest: byLength.at(-1)!,
  };
}
