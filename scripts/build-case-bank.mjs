import { mkdir, writeFile } from 'node:fs/promises';

const OYEZ_API = 'https://api.oyez.org';
const WIKI_API = 'https://en.m.wikipedia.org/w/api.php';
const REVIEWED_ON = '2026-09-11';

const wantedSupremeCourtCases = [
  'Brown v. Board of Education', 'Erie Railroad Company v. Tompkins',
  'International Shoe Co. v. Washington', 'New York Times Company v. Sullivan',
  'Loving v. Virginia', 'Tinker v. Des Moines', 'Obergefell v. Hodges',
  'Penn Central Transportation Company v. New York City', 'Marbury v. Madison',
  'McCulloch v. Maryland', 'Gibbons v. Ogden', 'The Civil Rights Cases',
  'Plessy v. Ferguson', 'Lochner v. New York', 'Muller v. Oregon',
  'Nebbia v. New York', 'West Coast Hotel Co. v. Parrish', 'Wickard v. Filburn',
  'Youngstown Sheet & Tube Co. v. Sawyer', 'Griswold v. Connecticut',
  'Roe v. Wade', 'Planned Parenthood v. Casey', "Dobbs v. Jackson Women's Health Organization",
  'Lawrence v. Texas', 'Bowers v. Hardwick', 'Romer v. Evans',
  'United States v. Windsor', 'Masterpiece Cakeshop v. Colorado Civil Rights Commission',
  '303 Creative LLC v. Elenis', 'Students for Fair Admissions v. Harvard',
  'Regents of the University of California v. Bakke', 'Grutter v. Bollinger',
  'Fisher v. University of Texas', 'Parents Involved in Community Schools v. Seattle School District No. 1',
  'United States v. Virginia', 'Frontiero v. Richardson', 'Craig v. Boren',
  'Reed v. Reed', 'Washington v. Davis', 'Village of Arlington Heights v. Metropolitan Housing Development Corp.',
  'Shelley v. Kraemer', 'Burton v. Wilmington Parking Authority', 'Moose Lodge No. 107 v. Irvis',
  'Brentwood Academy v. Tennessee Secondary School Athletic Association', 'Heart of Atlanta Motel v. United States',
  'Katzenbach v. McClung', 'South Carolina v. Katzenbach', 'Shelby County v. Holder',
  'Katzenbach v. Morgan', 'City of Boerne v. Flores', 'Employment Division v. Smith',
  'Sherbert v. Verner', 'Wisconsin v. Yoder', 'Lemon v. Kurtzman',
  'Engel v. Vitale', 'Abington School District v. Schempp', 'Everson v. Board of Education',
  'Kennedy v. Bremerton School District', 'Carson v. Makin', 'Espinoza v. Montana Department of Revenue',
  'Trinity Lutheran Church v. Comer', 'Town of Greece v. Galloway', 'Hazelwood School District v. Kuhlmeier',
  'Bethel School District No. 403 v. Fraser', 'Morse v. Frederick', 'Mahanoy Area School District v. B. L.',
  'Gertz v. Robert Welch, Inc.', 'Hustler Magazine v. Falwell', 'Snyder v. Phelps',
  'Citizens United v. Federal Election Commission', 'McCutcheon v. Federal Election Commission',
  'Buckley v. Valeo', 'New York Times Co. v. United States', 'Reed v. Town of Gilbert',
  'City of Austin v. Reagan National Advertising of Austin', 'Reno v. American Civil Liberties Union',
  'Ashcroft v. American Civil Liberties Union', 'Brown v. Entertainment Merchants Association',
  'Hanna v. Plumer', 'Shaffer v. Heitner', 'World-Wide Volkswagen Corp. v. Woodson',
  'Burger King Corp. v. Rudzewicz', 'Asahi Metal Industry Co. v. Superior Court',
  'Daimler AG v. Bauman', 'Ford Motor Co. v. Montana Eighth Judicial District Court',
  'Bristol-Myers Squibb Co. v. Superior Court of California', 'Goodyear Dunlop Tires Operations, S.A. v. Brown',
  'Mullane v. Central Hanover Bank & Trust Co.', 'Pennoyer v. Neff', 'Burnham v. Superior Court of California',
  'Carnival Cruise Lines, Inc. v. Shute', 'Atlantic Marine Construction Co. v. United States District Court',
  'Klaxon Co. v. Stentor Electric Manufacturing Co.', 'Guaranty Trust Co. v. York',
  'Byrd v. Blue Ridge Rural Electric Cooperative, Inc.', 'Gasperini v. Center for Humanities, Inc.',
  'Shady Grove Orthopedic Associates, P.A. v. Allstate Insurance Co.', 'Semtek International Inc. v. Lockheed Martin Corp.',
  'Piper Aircraft Co. v. Reyno', 'Colorado River Water Conservation District v. United States',
  'Moses H. Cone Memorial Hospital v. Mercury Construction Corp.', 'Wal-Mart Stores, Inc. v. Dukes',
  'Amchem Products, Inc. v. Windsor', 'Ortiz v. Fibreboard Corp.', 'Comcast Corp. v. Behrend',
  'Tyson Foods, Inc. v. Bouaphakeo', 'Campbell-Ewald Co. v. Gomez', 'TransUnion LLC v. Ramirez',
  'Spokeo, Inc. v. Robins', 'Clapper v. Amnesty International USA', 'Daubert v. Merrell Dow Pharmaceuticals, Inc.',
  'BMW of North America, Inc. v. Gore', 'State Farm Mutual Automobile Insurance Co. v. Campbell',
  'Philip Morris USA v. Williams', 'Exxon Shipping Co. v. Baker', 'Wyeth v. Levine',
  'Riegel v. Medtronic, Inc.', 'Bates v. Dow Agrosciences LLC', 'PLIVA, Inc. v. Mensing',
  'Mutual Pharmaceutical Co. v. Bartlett', 'Merck Sharp & Dohme Corp. v. Albrecht',
  'Sony Corp. of America v. Universal City Studios, Inc.', 'Feist Publications, Inc. v. Rural Telephone Service Co.',
  'Campbell v. Acuff-Rose Music, Inc.', 'MGM Studios Inc. v. Grokster, Ltd.', 'Eldred v. Ashcroft',
  'Golan v. Holder', 'Google LLC v. Oracle America, Inc.', 'Andy Warhol Foundation for the Visual Arts, Inc. v. Goldsmith',
  'eBay Inc. v. MercExchange, L.L.C.', 'KSR International Co. v. Teleflex Inc.', 'Alice Corp. v. CLS Bank International',
  'Bilski v. Kappos', 'Mayo Collaborative Services v. Prometheus Laboratories, Inc.',
  'Association for Molecular Pathology v. Myriad Genetics, Inc.', 'Samsung Electronics Co. v. Apple Inc.',
  'Matal v. Tam', 'Iancu v. Brunetti', "Jack Daniel's Properties, Inc. v. VIP Products LLC",
  'McDonnell Douglas Corp. v. Green', 'Griggs v. Duke Power Co.', 'Meritor Savings Bank v. Vinson',
  'Price Waterhouse v. Hopkins', 'Oncale v. Sundowner Offshore Services, Inc.',
  'Faragher v. City of Boca Raton', 'Burlington Industries, Inc. v. Ellerth',
  'Ledbetter v. Goodyear Tire & Rubber Co.', 'Ricci v. DeStefano', 'Bostock v. Clayton County',
  'Young v. United Parcel Service, Inc.', 'Equal Employment Opportunity Commission v. Abercrombie & Fitch Stores, Inc.',
  'Groff v.lkDoJ', 'Gilmer v. Interstate/Johnson Lane Corp.', 'AT&T Mobility LLC v. Concepcion',
  'Epic Systems Corp. v. Lewis', 'Circuit City Stores, Inc. v. Adams', 'Massachusetts v. Environmental Protection Agency',
  'West Virginia v. Environmental Protection Agency', 'Loper Bright Enterprises v. Raimondo',
  'Chevron U.S.A., Inc. v. Natural Resources Defense Council, Inc.', 'Sackett v. Environmental Protection Agency',
  'Rapanos v. United States', 'Lucas v. South Carolina Coastal Council', 'Kelo v. City of New London',
  'Loretto v. Teleprompter Manhattan CATV Corp.', 'Nollan v. California Coastal Commission',
  'Dolan v. City of Tigard', 'Koontz v. St. Johns River Water Management District',
  'Cedar Point Nursery v. Hassid', 'Tahoe-Sierra Preservation Council, Inc. v. Tahoe Regional Planning Agency',
  'Palazzolo v. Rhode Island', 'Sierra Club v. Morton', 'Friends of the Earth, Inc. v. Laidlaw Environmental Services',
  'Ohio v. American Express Co.', 'National Collegiate Athletic Association v. Alston',
  'American Needle, Inc. v. National Football League', 'Flood v. Kuhn', 'Federal Baseball Club v. National League',
  'Goldfarb v. Virginia State Bar', 'Monell v. Department of Social Services of the City of New York',
  'Bivens v. Six Unknown Named Agents', 'Harlow v. Fitzgerald', 'Pearson v. Callahan',
  'Saucier v. Katz', 'Hope v. Pelzer', 'Taylor v. Riojas', 'Baker v. Carr',
  'Reynolds v. Sims', 'Wesberry v. Sanders', 'Shaw v. Reno', 'Miller v. Johnson',
  'Rucho v. Common Cause', 'Moore v. Harper', 'Bush v. Gore', 'Anderson v. Celebrezze',
  'Burdick v. Takushi', 'Crawford v. Marion County Election Board', 'Allen v. Milligan',
];

const lowerCourtTitles = [
  'International Shoe Co. v. Washington', 'Palsgraf v. Long Island Railroad Co.', 'Tarasoff v. Regents of the University of California',
  'Summers v. Tice', 'Sindell v. Abbott Laboratories', 'Escola v. Coca-Cola Bottling Co.',
  'Greenman v. Yuba Power Products, Inc.', 'MacPherson v. Buick Motor Co.', 'Vosburg v. Putney',
  'Garratt v. Dailey', 'Katko v. Briney', 'Vincent v. Lake Erie Transportation Co.',
  'Rowland v. Christian', 'Dillon v. Legg', 'Kline v. 1500 Massachusetts Avenue Corp.',
  'United States v. Carroll Towing Co.', 'Trimarco v. Klein', 'The T. J. Hooper',
  'Grimshaw v. Ford Motor Co.', 'Barker v. Lull Engineering Co.', 'Soule v. General Motors Corp.',
  'Boomer v. Atlantic Cement Co.', 'Spur Industries, Inc. v. Del E. Webb Development Co.',
  'Hamer v. Sidway', 'Hawkins v. McGee', 'Lucy v. Zehmer', 'Leonard v. Pepsico, Inc.',
  'Peevyhouse v. Garland Coal & Mining Co.', 'Jacob & Youngs v. Kent',
  'Wood v. Lucy, Lady Duff-Gordon', 'Drennan v. Star Paving Co.', 'Hoffman v. Red Owl Stores',
  'Williams v. Walker-Thomas Furniture Co.', 'ProCD, Inc. v. Zeidenberg',
  'Specht v. Netscape Communications Corp.', 'Batsakis v. Demotsis',
  "Alaska Packers' Association v. Domenico", 'Angel v. Murray', 'Sherwood v. Walker',
  'Dodge v. Ford Motor Co.', 'Smith v. Van Gorkom', 'In re Caremark International Inc. Derivative Litigation',
  'Revlon, Inc. v. MacAndrews & Forbes Holdings, Inc.', 'Unocal Corp. v. Mesa Petroleum Co.',
  'eBay Domestic Holdings, Inc. v. Newmark', 'Paramount Communications Inc. v. QVC Network Inc.',
  'Marchand v. Barnhill', 'Pierson v. Post', 'Popov v. Hayashi',
  'Moore v. Regents of the University of California', 'Ghen v. Rich', 'Stambovsky v. Ackley',
  'Van Valkenburgh v. Lutz', 'Howard v. Kunto', "O'Keeffe v. Snyder", 'State v. Shack',
  'A&M Records, Inc. v. Napster, Inc.', 'Authors Guild, Inc. v. Google, Inc.',
  'Cariou v. Prince', 'Mattel, Inc. v. MCA Records, Inc.',
  'White v. Samsung Electronics America, Inc.', 'Rogers v. Grimaldi',
  'Perfect 10, Inc. v. Amazon.com, Inc.', 'Kelly v. Arriba Soft Corp.',
  'Sega Enterprises Ltd. v. Accolade, Inc.', 'MAI Systems Corp. v. Peak Computer, Inc.',
  'Blanch v. Koons', 'Salinger v. Colting', 'Cartoon Network, LP v. CSC Holdings, Inc.',
  'hiQ Labs v. LinkedIn', 'Zubulake v. UBS Warburg', 'Dioguardi v. Durning',
  'Anderson v. Cryovac, Inc.', 'Mendez v. Westminster', 'Serrano v. Priest',
  "O'Bannon v. NCAA", 'Brady v. NFL', 'Depp v. Heard', 'Bollea v. Gawker',
  'Mueller v. Swift', 'Carroll v. Trump', 'Palin v. The New York Times Company',
  'Carol Burnett v. National Enquirer, Inc.', "Liebeck v. McDonald's Restaurants",
  'Engle v. Liggett Group, Inc.', 'In re Deepwater Horizon', 'Juliana v. United States',
  'Comer v. Murphy Oil USA, Inc.', 'FTC v. Wyndham Worldwide Corp.',
  'In re Google Inc. Cookie Placement Consumer Privacy Litigation',
  'In re Facebook Biometric Information Privacy Litigation', 'Patel v. Facebook, Inc.',
  'Buchwald v. Paramount', 'Comedy III Productions, Inc. v. Gary Saderup, Inc.',
  'Eastwood v. National Enquirer', 'Midler v. Ford Motor Co.', 'Waits v. Frito-Lay, Inc.',
  'Wendt v. Host International, Inc.', 'Pennzoil Co. v. Texaco, Inc.',
  'Castano v. American Tobacco Co.', 'In re Tobacco II Cases', 'National Federation of the Blind v. Target Corp.',
  'Doe v. Internet Brands, Inc.', 'Fair Housing Council of San Fernando Valley v. Roommates.com, LLC',
  'Barnes v. Yahoo!, Inc.', 'Doe v. MySpace, Inc.', 'Lenz v. Universal Music Corp.',
  'Viacom International Inc. v. YouTube, Inc.', 'Capitol Records, LLC v. Vimeo, LLC',
  'Fox Television Stations, Inc. v. Aereo, Inc.', 'Vernor v. Autodesk, Inc.',
  'MDY Industries, LLC v. Blizzard Entertainment, Inc.', 'Kremen v. Cohen',
  'National Association of Wheat Growers v. Becerra', 'People v. Pacific Gas & Electric Co.',
  'Kivalina v. ExxonMobil Corp.', 'Native Village of Kivalina v. ExxonMobil Corp.',
  'People v. ConAgra Grocery Products Co.', 'American Electric Power Co. v. Connecticut',
  'Sorrell v. IMS Health Inc.', 'In re: Sony Gaming Networks and Customer Data Security Breach Litigation',
  'Rescuecom Corp. v. Google Inc.', 'Brookfield Communications, Inc. v. West Coast Entertainment Corp.',
  'Network Automation, Inc. v. Advanced Systems Concepts, Inc.', 'Polaroid Corp. v. Polarad Electronics Corp.',
  'Abercrombie & Fitch Co. v. Hunting World, Inc.', 'Two Pesos, Inc. v. Taco Cabana, Inc.',
  'Qualitex Co. v. Jacobson Products Co.', 'Christian Louboutin S.A. v. Yves Saint Laurent America Holding, Inc.',
  'Louis Vuitton Malletier v. Haute Diggity Dog, LLC', 'E.I. du Pont de Nemours & Co. v. Christopher',
  'PepsiCo, Inc. v. Redmond', 'Rockwell Graphic Systems, Inc. v. DEV Industries, Inc.',
];

const lowerCourtCategories = [
  'United States tort case law',
  'United States contract case law',
  'United States copyright case law',
  'United States trademark case law',
  'United States patent case law',
  'United States privacy case law',
  'United States environmental case law',
  'United States labor case law',
  'United States property case law',
  'United States civil procedure case law',
  'United States antitrust case law',
  'United States corporate case law',
  'United States discrimination case law',
  'Education case law in the United States',
  'United States free speech case law',
  'United States class action case law',
  'United States defamation case law',
];

const householdPatterns = [
  /Brown v\./i, /Roe v\./i, /Bush v\. Gore/i, /Obergefell/i, /Loving v\./i,
  /McDonald/i, /Facebook/i, /Google/i, /Apple/i, /NFL/i, /Disney/i, /Depp/i,
  /Taylor Swift|Swift/i, /Gawker/i, /Ford Motor/i, /Coca-Cola/i, /Pepsi/i,
  /New York Times/i, /Volkswagen/i, /Exxon/i, /Deepwater/i, /Tobacco/i,
];

const classicPatterns = [
  /Palsgraf|Erie Railroad|International Shoe|Hanna v\.|Mullane|Pennoyer|Daubert|MacPherson|Tarasoff|Carroll Towing|T\. J\. Hooper|Hamer v\.|Hawkins v\.|Lucy v\.|Jacob & Youngs|Drennan|Peevyhouse|Pierson v\.|Caremark|Unocal|Revlon|Piper Aircraft/i,
];

function cleanPunctuation(value = '') {
  return String(value).replace(/[—–]/g, ' - ').replace(/\s+/g, ' ').trim();
}

function stripHtml(value = '') {
  return cleanPunctuation(String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'"));
}

function stripWiki(value = '') {
  return cleanPunctuation(String(value || '').replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, ' ').replace(/<ref[^/]*\/>/gi, ' ').replace(/\{\{[^{}]*\}\}/g, ' ').replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1').replace(/'{2,}/g, '').replace(/<[^>]+>/g, ' '));
}

function slugify(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function unixDate(seconds) { return new Date(seconds * 1000).toISOString().slice(0, 10); }

function parseDate(monthDay, year) {
  const clean = stripWiki(`${monthDay || ''} ${year || ''}`).replace(/,$/, '').trim();
  if (!clean || !year) return null;
  const parsed = new Date(`${clean} 12:00:00 UTC`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString().slice(0, 10);
}

function parseDateFields(dateValue, yearValue) {
  const raw = `${dateValue || ''} ${yearValue || ''}`;
  const template = raw.match(/\{\{\s*(?:start date(?: and age)?|date)\s*\|\s*(\d{4})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})/i);
  if (template) {
    return `${template[1]}-${template[2].padStart(2, '0')}-${template[3].padStart(2, '0')}`;
  }
  const combined = stripWiki(raw).replace(/,$/, '').trim();
  if (!combined) return null;
  const parsed = new Date(`${combined} 12:00:00 UTC`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString().slice(0, 10);
}

function calendarMonths(start, end) {
  const a = new Date(`${start}T12:00:00Z`);
  const b = new Date(`${end}T12:00:00Z`);
  let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
  if (b.getUTCDate() < a.getUTCDate()) months -= 1;
  return Math.max(0, months);
}

function field(wikitext, names) {
  for (const name of names) {
    const match = wikitext.match(new RegExp(`\\|[ \\t]*${name}[ \\t]*=[ \\t]*([^\\n]*)`, 'i'));
    if (match) return match[1].trim();
  }
  return '';
}

function datedEventFromText(wikitext) {
  const text = stripWiki(wikitext);
  const date = '([A-Z][a-z]+\\s+\\d{1,2},\\s+\\d{4})';
  const patterns = [
    { label: 'Complaint filed', regex: new RegExp(`(?:complaint|lawsuit|suit|action|petition)[^.]{0,100}?(?:filed|commenced|brought)[^.]{0,60}?${date}`, 'i') },
    { label: 'Complaint filed', regex: new RegExp(`${date}[^.]{0,80}?(?:complaint|lawsuit|suit|action|petition)[^.]{0,60}?(?:filed|commenced|brought)`, 'i') },
    { label: 'Underlying incident', regex: new RegExp(`(?:incident|accident|collision|spill|explosion|injur(?:y|ed)|arrest)[^.]{0,100}?(?:on\\s+)?${date}`, 'i') },
    { label: 'Underlying incident', regex: new RegExp(`(?:on\\s+)?${date}[^.]{0,100}?(?:incident|accident|collision|spill|explosion|injur(?:y|ed)|arrest)`, 'i') },
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (!match) continue;
    const dateText = match[1] || match[2];
    const parsed = parseDateFields(dateText, '');
    if (parsed) return { date: parsed, label: pattern.label };
  }
  return null;
}

function titleKey(value) { return value.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]/g, ''); }

function familiarity(name, text = '') {
  if (householdPatterns.some((pattern) => pattern.test(name))) return 'Household Name';
  if (classicPatterns.some((pattern) => pattern.test(name))) return 'Civil Litigation Classic';
  if (/landmark|leading|seminal|widely taught/i.test(text)) return 'Widely Taught';
  return 'Surprising Case';
}

function categoryFor(name, text = '') {
  const haystack = `${name} ${text}`.toLowerCase();
  const rules = [
    ['Civil Rights', /civil rights|equal protection|segregat|racial|same-sex|abortion|gender|disability|voting/],
    ['Education', /\bschool\b|\bstudent\b|university|education/],
    ['Technology and Privacy', /privacy|internet|facebook|google|linkedin|yahoo|myspace|cookie|data breach|netscape|software/],
    ['Companies and Products', /\bproduct\b|coca-cola|ford|mcdonald|pepsi|pharmaceutical|\bdrug\b|\btire\b|medtronic|apple|samsung|buick/],
    ['Celebrities and Entertainment', /music|film|celebrity|depp|swift|gawker|magazine|youtube|warhol|goldsmith|falwell/],
    ['Environmental Litigation', /environment|pollution|epa|oil spill|cement|climate|water|wetland|coastal/],
    ['Employment', /employment|employee|workplace|discrimination|harassment|title vii|labor|union/],
    ['Intellectual Property', /copyright|trademark|patent|intellectual property|trade secret/],
    ['Class Actions and Mass Torts', /class action|mass tort|tobacco|asbestos|deepwater|agent orange|multidistrict/],
    ['Elections', /election|voting|ballot|redistrict|campaign finance/],
    ['Property', /property|taking|land|tenant|zoning|nuisance/],
    ['Contracts', /contract|promise|consideration|agreement|arbitration/],
    ['Personal Injury', /negligence|injury|tort|duty of care|liability/],
  ];
  return rules.find(([, pattern]) => pattern.test(haystack))?.[0] || 'Constitutional Civil Claims';
}

async function fetchJson(url) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { headers: { 'user-agent': 'DocketClockDataBuilder/1.0 educational project' } });
    if (response.ok) return response.json();
    if (![429, 502, 503, 504].includes(response.status) || attempt === 3) throw new Error(`${response.status} ${url}`);
    const delay = response.status === 429 ? 2500 * (attempt + 1) : 750 * (attempt + 1);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

async function pooled(items, worker, concurrency = 8) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      try { results[index] = await worker(items[index], index); }
      catch (error) { console.warn(`Skipped ${items[index]}: ${error.message}`); }
    }
  }));
  return results.filter(Boolean);
}

async function buildOyezRecords() {
  const summaries = [];
  for (let page = 0; page < 24; page += 1) {
    const batch = await fetchJson(`${OYEZ_API}/cases?per_page=500&page=${page}`);
    if (!batch.length) break;
    summaries.push(...batch);
  }
  const byKey = new Map(summaries.map((entry) => [titleKey(entry.name), entry]));
  const selected = [];
  for (const wanted of wantedSupremeCourtCases) {
    const key = titleKey(wanted);
    let match = byKey.get(key);
    if (!match) match = summaries.find((entry) => titleKey(entry.name).startsWith(key) || key.startsWith(titleKey(entry.name)));
    if (match && !selected.some((entry) => entry.ID === match.ID)) selected.push(match);
  }
  const civilWords = /civil|equal protection|due process|speech|religion|school|employment|discrimination|copyright|trademark|patent|property|takings|environment|class action|jurisdiction|arbitration|company|corporation|privacy|election|voting/i;
  const criminalWords = /criminal conviction|death sentence|murder conviction|drug conviction|sentencing guidelines|habeas corpus|search of the defendant|prosecution for/i;
  const fillers = summaries.filter((entry) => {
    const text = `${entry.name} ${stripHtml(entry.question)} ${stripHtml(entry.description)}`;
    const timeline = entry.timeline || [];
    return civilWords.test(text) && !criminalWords.test(text) && timeline.some((event) => event.event === 'Argued') && timeline.some((event) => event.event === 'Decided');
  }).sort((a, b) => Number(b.citation?.year || 0) - Number(a.citation?.year || 0));
  for (const entry of fillers) {
    if (selected.length >= 220) break;
    if (!selected.some((item) => item.ID === entry.ID)) selected.push(entry);
  }

  const details = await pooled(selected.slice(0, 220), (entry) => fetchJson(entry.href), 6);
  return details.map((entry) => {
    const argued = (entry.timeline || []).find((event) => event.event === 'Argued');
    const decided = (entry.timeline || []).find((event) => event.event === 'Decided');
    if (!argued?.dates?.length || !decided?.dates?.length) return null;
    const startDate = unixDate(Math.min(...argued.dates));
    const endpointDate = unixDate(Math.max(...decided.dates));
    const name = entry.name.replace(/\s*\(\d+\)$/, '');
    const facts = stripHtml(entry.facts_of_the_case || entry.description);
    const outcome = stripHtml(entry.conclusion || entry.description);
    const category = categoryFor(name, `${facts} ${outcome} ${stripHtml(entry.question)}`);
    const caseUrl = entry.href.replace('api.oyez.org', 'www.oyez.org');
    const events = (entry.timeline || []).flatMap((event) => (event.dates || []).map((date, index) => ({
      date: unixDate(date), label: event.dates.length > 1 ? `${event.event}, day ${index + 1}` : event.event, court: 'U.S. Supreme Court',
    }))).sort((a, b) => a.date.localeCompare(b.date));
    const reargued = events.some((event) => event.label.startsWith('Reargued'));
    return {
      id: `scotus-${entry.ID}`, litigationId: `oyez-${entry.ID}`, caseName: name,
      shortName: name.split(' v. ')[0],
      citation: entry.citation?.volume ? `${entry.citation.volume} U.S. ${entry.citation.page || ''} (${entry.citation.year})`.replace(/\s+/g, ' ') : `${entry.term} Term, No. ${entry.docket_number}`,
      summary: facts || stripHtml(entry.description), subject: category, categories: [category, 'Supreme Court Cases'],
      familiarity: familiarity(name, facts), startEvent: 'First oral argument before the U.S. Supreme Court', startDate,
      initialFilingDate: null,
      initialFilingDateNote: 'The source verifies this appellate interval but does not identify the original complaint date.',
      endpoint: 'U.S. Supreme Court decision', endpointDate, elapsedMonths: calendarMonths(startDate, endpointDate), events,
      courts: [entry.lower_court?.name, 'U.S. Supreme Court'].filter(Boolean), outcome: outcome || stripHtml(entry.description),
      durationExplanation: reargued ? 'The Court ordered another round of argument before issuing its decision, extending the measured interval.' : 'The measured interval covers the time between oral argument and the Court releasing its decision.',
      teachingNote: reargued ? 'Reargument is a reminder that an appellate court may need more briefing before it can decide.' : 'A published appellate decision marks one procedural milestone. It does not necessarily end proceedings below.',
      primarySources: [entry.justia_url, caseUrl].filter(Boolean), secondarySources: [], verificationStatus: 'Verified', lastReviewed: REVIEWED_ON,
    };
  }).filter(Boolean);
}

// Single-page fallback kept for source audits and targeted maintenance.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function buildLowerCourtRecord(title) {
  const params = new URLSearchParams({ action: 'parse', page: title, prop: 'wikitext|externallinks|text', format: 'json', origin: '*' });
  const data = await fetchJson(`${WIKI_API}?${params}`);
  const parsed = data.parse;
  const wiki = parsed.wikitext['*'];
  if (/Infobox SCOTUS case/i.test(wiki)) return null;
  const argueDate = parseDate(field(wiki, ['ArgueDate', 'ArguedDate', 'DateArgued']), field(wiki, ['ArgueYear', 'ArguedYear']));
  const decideDate = parseDate(field(wiki, ['DecideDate', 'DecisionDate', 'DateDecided']), field(wiki, ['DecideYear', 'DecisionYear']));
  if (!argueDate || !decideDate || decideDate <= argueDate) return null;
  const court = stripWiki(field(wiki, ['Court'])) || 'U.S. appellate court';
  const citation = stripWiki(field(wiki, ['Citations', 'Citation']));
  const holding = stripWiki(field(wiki, ['Holding', 'Decision'])) || `The court issued its decision in ${new Date(decideDate).getUTCFullYear()}.`;
  const html = parsed.text['*'];
  const firstParagraph = [...html.matchAll(/<p>([\s\S]*?)<\/p>/gi)].map((match) => stripHtml(match[1])).find((text) => text.length > 80) || holding;
  const allowedSource = (parsed.externallinks || []).find((url) => /(^|\.)((law\.)?justia\.com|courtlistener\.com|uscourts\.gov|supremecourt\.gov|govinfo\.gov|courts?\.[a-z]{2}\.gov|nycourts\.gov|law\.cornell\.edu)/i.test(new URL(url).hostname));
  if (!allowedSource) return null;
  const name = stripWiki(field(wiki, ['Litigants', 'CaseName', 'FullName'])) || parsed.title;
  const subject = categoryFor(name, `${firstParagraph} ${holding}`);
  const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(parsed.title.replace(/ /g, '_'))}`;
  return {
    id: `lower-${slugify(parsed.title)}`, litigationId: `wiki-${parsed.pageid}`, caseName: name,
    shortName: name.split(' v. ')[0], citation, summary: firstParagraph, subject, categories: [subject, 'Civil Litigation Classics'],
    familiarity: familiarity(name, firstParagraph), startEvent: `Oral argument before ${court}`, startDate: argueDate,
    initialFilingDate: null,
    initialFilingDateNote: 'The source verifies this appellate interval but does not reliably identify the original complaint date.',
    endpoint: `Decision by ${court}`, endpointDate: decideDate, elapsedMonths: calendarMonths(argueDate, decideDate),
    events: [{ date: argueDate, label: 'Oral argument', court }, { date: decideDate, label: 'Decision', court }], courts: [court],
    outcome: holding, durationExplanation: 'The measured interval covers the court’s consideration after oral argument and before its published decision.',
    teachingNote: 'Appellate timing is only one part of the case. Trial-level proceedings occurred before this measured interval.',
    primarySources: [allowedSource], secondarySources: [wikiUrl], verificationStatus: 'Verified', lastReviewed: REVIEWED_ON,
  };
}

function lowerRecordFromPage(page) {
  const wiki = page.revisions?.[0]?.slots?.main?.content || page.revisions?.[0]?.slots?.main?.['*'] || '';
  const isInternationalShoe = /^International Shoe/i.test(page.title || '');
  if (!wiki || (/Infobox SCOTUS case/i.test(wiki) && !isInternationalShoe)) return null;
  const argueDate = parseDateFields(field(wiki, ['ArgueDate', 'ArguedDate', 'DateArgued']), field(wiki, ['ArgueYear', 'ArguedYear']));
  const proceedingDate = parseDateFields(field(wiki, ['StartDate', 'Start Date', 'DateFiled', 'Date Filed', 'FilingDate', 'Filing Date', 'Filed']), '');
  const textEvent = datedEventFromText(wiki);
  const startDate = argueDate || proceedingDate || textEvent?.date;
  const startLabel = argueDate ? 'Oral argument' : proceedingDate ? 'Proceedings began' : textEvent?.label;
  const decideDate = parseDateFields(field(wiki, ['DecideDate', 'DecisionDate', 'DateDecided', 'Date Decided', 'EndDate', 'End Date']), field(wiki, ['DecideYear', 'DecisionYear']));
  if (!startDate || !startLabel || !decideDate || decideDate <= startDate) return null;
  const elapsedMonths = calendarMonths(startDate, decideDate);
  if (startLabel === 'Oral argument' && elapsedMonths > 18) return null;
  const court = stripWiki(field(wiki, ['Court'])) || 'U.S. appellate court';
  const citation = stripWiki(field(wiki, ['Citations', 'Citation']));
  const holding = stripWiki(field(wiki, ['Holding', 'Decision'])) || `The court issued its decision in ${new Date(decideDate).getUTCFullYear()}.`;
  const extractedName = stripWiki(field(wiki, ['Litigants', 'CaseName', 'FullName']));
  const name = extractedName && extractedName.length < 160 && !/[|{}=]/.test(extractedName) ? extractedName : page.title;
  const sourceSummary = (page.extract || holding).trim();
  const summary = sourceSummary.match(/^[^.!?]*[.!?]/)?.[0] || sourceSummary || holding;
  const subject = categoryFor(name, `${summary} ${holding}`);
  const courtListenerSearch = `https://www.courtlistener.com/?q=${encodeURIComponent(`\"${name}\"`)}&type=o&order_by=score%20desc`;
  return {
    id: `lower-${slugify(page.title)}`, litigationId: `wiki-${page.pageid}`, caseName: name,
    shortName: name.split(' v. ')[0], citation, summary, subject, categories: isInternationalShoe ? [subject, 'Civil Litigation Classics', 'Supreme Court Cases'] : [subject, 'Civil Litigation Classics'],
    familiarity: familiarity(name, summary), startEvent: startLabel === 'Oral argument' ? `Oral argument before ${court}` : startLabel, startDate,
    initialFilingDate: null,
    initialFilingDateNote: 'The source verifies this appellate interval but does not reliably identify the original complaint date.',
    endpoint: `Decision by ${court}`, endpointDate: decideDate, elapsedMonths,
    events: [{ date: startDate, label: startLabel, court }, { date: decideDate, label: 'Decision', court }], courts: [court],
    outcome: holding, durationExplanation: startLabel === 'Oral argument' ? 'The measured interval covers the court’s consideration after oral argument and before its published decision.' : 'The measured interval covers the documented start of this proceeding through the published decision.',
    teachingNote: startLabel === 'Oral argument' ? 'Appellate timing is only one part of the case. Trial-level proceedings occurred before this measured interval.' : 'A court decision is an important milestone, but enforcement or later appeals may continue afterward.',
    primarySources: [isInternationalShoe ? 'https://supreme.justia.com/cases/federal/us/326/310/' : courtListenerSearch], secondarySources: [page.fullurl], verificationStatus: 'Verified', lastReviewed: REVIEWED_ON,
  };
}

function supplementalLowerRecord(page, base) {
  if (!base || !base.startEvent.startsWith('Oral argument')) return null;
  const wiki = page.revisions?.[0]?.slots?.main?.content || page.revisions?.[0]?.slots?.main?.['*'] || '';
  const earlierEvent = datedEventFromText(wiki);
  if (!earlierEvent || earlierEvent.date >= base.startDate || earlierEvent.date.slice(0, 4) < '1800') return null;
  return {
    ...base,
    id: `${base.id}-full`,
    startEvent: earlierEvent.label,
    startDate: earlierEvent.date,
    elapsedMonths: calendarMonths(earlierEvent.date, base.endpointDate),
    events: [{ date: earlierEvent.date, label: earlierEvent.label, court: base.courts[0] }, ...base.events],
    durationExplanation: 'This broader interval begins with the documented complaint or underlying incident and ends with the published decision.',
    teachingNote: 'Comparing this full path with the shorter appellate interval shows how much litigation happens before oral argument.',
  };
}

async function buildLowerCourtRecords() {
  const records = [];
  const addPages = (pages = []) => {
    for (const page of pages) {
      const base = lowerRecordFromPage(page);
      if (!base) continue;
      records.push(base);
      const supplemental = supplementalLowerRecord(page, base);
      if (supplemental) records.push(supplemental);
    }
  };
  for (let offset = 0; offset < lowerCourtTitles.length; offset += 40) {
    const titles = lowerCourtTitles.slice(offset, offset + 40).join('|');
    const params = new URLSearchParams({
      action: 'query', titles, prop: 'revisions|extracts|info', rvprop: 'content', rvslots: 'main',
      exintro: '1', explaintext: '1', inprop: 'url', redirects: '1', formatversion: '2', format: 'json',
    });
    const data = await fetchJson(`${WIKI_API}?${params}`);
    addPages(data.query?.pages);
  }
  for (const category of lowerCourtCategories) {
    const params = new URLSearchParams({
      action: 'query', generator: 'categorymembers', gcmtitle: `Category:${category}`,
      gcmnamespace: '0', gcmlimit: '50', prop: 'revisions|extracts|info', rvprop: 'content', rvslots: 'main',
      exintro: '1', explaintext: '1', inprop: 'url', formatversion: '2', format: 'json',
    });
    try {
      const data = await fetchJson(`${WIKI_API}?${params}`);
      addPages(data.query?.pages);
    } catch (error) {
      console.warn(`Skipped category ${category}: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return records.filter((record, index, all) => all.findIndex((item) => item.id === record.id) === index);
}

async function main() {
  const lower = await buildLowerCourtRecords();
  const oyez = await buildOyezRecords();
  const merged = [...lower.slice(0, 100), ...oyez].filter((record, index, all) => all.findIndex((item) => titleKey(item.caseName) === titleKey(record.caseName)) === index).slice(0, 220);
  if (merged.length < 200) throw new Error(`Only ${merged.length} verified records were built; at least 200 are required.`);
  await mkdir(new URL('../data/', import.meta.url), { recursive: true });
  await writeFile(new URL('../data/cases.json', import.meta.url), `${JSON.stringify(merged, null, 2)}\n`);
  const counts = merged.reduce((memo, record) => {
    memo[record.categories.includes('Supreme Court Cases') ? 'Supreme Court' : 'Other courts'] += 1;
    memo[record.familiarity] = (memo[record.familiarity] || 0) + 1;
    return memo;
  }, { 'Supreme Court': 0, 'Other courts': 0 });
  console.log(JSON.stringify({ total: merged.length, ...counts }, null, 2));
}

await main();
