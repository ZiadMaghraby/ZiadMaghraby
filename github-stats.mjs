import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const handle = 'ZiadMaghraby';
const day = 86400000;
const today = new Date(); today.setUTCHours(0, 0, 0, 0);
const iso = date => new Date(date).toISOString().slice(0, 10);
const start = new Date(today.getTime() - 364 * day);

export function summarize(days, end = iso(today)) {
  const counts = new Map(days.map(d => [d.date, d.contributionCount]));
  let longest = 0, run = 0, current = 0;
  for (const d of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    if (!Number.isInteger(d.contributionCount) || d.contributionCount < 0) throw new Error('Invalid GitHub contribution count');
    run = d.contributionCount ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let cursor = new Date(end + 'T00:00:00Z');
  if (!counts.get(iso(cursor))) cursor = new Date(cursor.getTime() - day);
  while (counts.get(iso(cursor))) { current++; cursor = new Date(cursor.getTime() - day); }
  return { total: days.reduce((sum, d) => sum + d.contributionCount, 0), current, longest };
}

export function card(stats, dark) {
  const text = dark ? '#c9d1d9' : '#57606a';
  const strong = dark ? '#f0f6fc' : '#1f2328';
  const blue = dark ? '#79c0ff' : '#1f6feb';
  const border = dark ? '#30363d' : '#d0d7de';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="795" height="190" viewBox="0 0 795 190" role="img"><title>GitHub contributions: ${stats.total}, current streak: ${stats.current} days, longest streak: ${stats.longest} days. Last 12 months.</title><g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif" text-anchor="middle"><path d="M265 20v135M530 20v135" stroke="${border}"/><g fill="${blue}" font-size="29" font-weight="600"><text x="132" y="76">${stats.total.toLocaleString('en-US')}</text><text x="662" y="76">${stats.longest}</text></g><path d="M383 29 A39 39 0 1 0 411 29" fill="none" stroke="${blue}" stroke-width="4" stroke-linecap="round"/><g transform="translate(386 9)" fill="${blue}"><path d="M12 0C14 7 8 9 11 14C14 13 16 9 16 6C23 13 24 20 19 25C15 29 8 29 4 25C-1 20 0 15 4 10C4 15 6 17 8 18C5 10 12 7 12 0Z"/></g><text x="397" y="75" fill="${strong}" font-size="29" font-weight="600">${stats.current}</text><g fill="${text}" font-size="13"><text x="132" y="111">Total Contributions</text><text x="397" y="128" fill="${strong}" font-weight="600">Current Streak</text><text x="662" y="111">Longest Streak</text><text x="132" y="140" font-size="11">Last 12 months</text><text x="397" y="151" font-size="11">${stats.current === 1 ? '1 day' : stats.current + ' days'} · UTC</text><text x="662" y="140" font-size="11">Last 12 months</text><text x="397" y="179" font-size="10">Source: GitHub contribution calendar · ${iso(start)} – ${iso(today)}</text></g></g></svg>`;
}

async function main() {
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is required');
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST', signal: AbortSignal.timeout(60000),
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}', variables: { login: handle, from: start.toISOString(), to: new Date().toISOString() } })
  });
  if (!response.ok) throw new Error(`GitHub API returned HTTP ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(data.errors.map(e => e.message).join('; '));
  const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar || !Array.isArray(calendar.weeks)) throw new Error('Invalid GitHub calendar');
  const days = calendar.weeks.flatMap(w => w.contributionDays).filter(d => d.date >= iso(start) && d.date <= iso(today));
  const stats = summarize(days);
  if (stats.total !== calendar.totalContributions) throw new Error('GitHub calendar total does not match daily counts');
  const light = card(stats, false), dark = card(stats, true);
  const version = createHash('sha256').update(light + dark).digest('hex').slice(0, 12);
  await writeFile('activity-github-light.svg', light);
  await writeFile('activity-github-dark.svg', dark);
  const readme = await readFile('README.md', 'utf8');
  await writeFile('README.md', readme.replace(/activity-github-(light|dark)\.svg(?:\?v=[a-f0-9]+)?/g, (_, theme) => `activity-github-${theme}.svg?v=${version}`));
  console.log(`GitHub refreshed: ${stats.total} contributions, ${stats.current} current streak, ${stats.longest} longest streak`);
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/github-stats.mjs')) await main();
