import { writeFile } from 'node:fs/promises';
const handle = 'ZiadMaghraby';
const day = 86400000;
const today = new Date(); today.setUTCHours(0, 0, 0, 0);
const start = new Date(today.getTime() - 364 * day);
const gridStart = new Date(start.getTime() - start.getUTCDay() * day);
const iso = d => new Date(d).toISOString().slice(0, 10);
async function json(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${new URL(url).hostname}`);
  return response.json();
}
function chart(platform, values, theme) {
  const dark = theme === 'dark';
  const cf = platform === 'Codeforces';
  const start = cf ? new Date(gridStart.getTime() + 7 * day) : new Date(today.getTime() - 364 * day);
  const first = cf ? start : gridStart;
  const unit = cf ? 'problems solved' : platform === 'Monkeytype' ? 'typing tests' : 'submissions';
  const colors = dark ? ['#2d333b', '#1b4721', '#2b6a30', '#46954a', '#6bc46d'] : ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
  const text = dark ? '#adbac7' : '#57606a';
  const border = dark ? '#444c56' : '#d0d7de';
  let total = 0, active = 0, cells = '', months = '', lastMonth = -1;
  const weeks = Math.ceil(((today - first) / day + 1) / 7);
  const step = 13, cell = 10, left = 44;
  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(first.getTime() + i * day);
    if (date > today) continue;
    const key = iso(date);
    const n = date >= start ? Number((cf ? values.newSolves : values)[key] || 0) : 0;
    if (!Number.isInteger(n) || n < 0) throw new Error('Invalid daily activity count');
    total += n;
    const level = cf ? (date >= start ? (values.levels[key] ?? (n ? Math.min(4, n + 1) : 0)) : 0) : n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 10 ? 3 : 4;
    if (level) active++;
    const tooltip = cf && values.levels[key] !== undefined ? `${level ? 'Codeforces activity' : 'No Codeforces activity'} on ${key}` : `${n} ${unit} on ${key}`;
    const x = left + Math.floor(i / 7) * step, y = 53 + date.getUTCDay() * step;
    cells += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${colors[level]}" stroke="${border}" stroke-opacity=".35"><title>${tooltip}</title></rect>`;
    if (date.getUTCMonth() !== lastMonth && date.getUTCDate() < 8) {
      months += `<text x="${x}" y="43">${date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}</text>`;
      lastMonth = date.getUTCMonth();
    }
  }
  const summary = cf ? `${values.totalAllTime.toLocaleString('en-US')} Codeforces problems solved · All time` : `${total.toLocaleString('en-US')} ${platform} ${unit} in the last year`;
  const zone = cf ? 'UTC+3 · Public solves' : 'UTC';
  const legend = colors.map((c, i) => `<rect x="${647 + i * 13}" y="157" width="10" height="10" rx="2" fill="${c}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="192" viewBox="0 0 780 192" role="img"><title>${summary}</title><rect x=".5" y=".5" width="779" height="191" rx="6" fill="none" stroke="${border}"/><g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif" fill="${text}" font-size="11"><text x="16" y="23" font-size="14">${summary}</text>${months}<text x="15" y="77">Mon</text><text x="15" y="103">Wed</text><text x="15" y="129">Fri</text>${cells}<text x="44" y="166">${active} active days · ${iso(start)} – ${iso(today)} · ${zone}</text><text x="615" y="166">Less</text>${legend}<text x="720" y="166">More</text></g></svg>`;
}
// Historical levels are copied from the public Codeforces profile, including
// activity omitted by user.status. They are not reconstructed as daily counts.
// The API adds new, publicly accessible first accepted solves after capture.
async function codeforces() {
  const history = {"handle":"ZiadMaghraby","source":"https://codeforces.com/profile/ZiadMaghraby","capturedAt":"2026-10-07T12:14:23.808Z","totalAllTime":150,"levels":{"2025-10-12":4,"2025-10-13":4,"2025-10-14":4,"2025-10-15":4,"2025-10-16":4,"2025-10-17":4,"2025-10-18":4,"2025-10-19":4,"2025-10-20":4,"2025-10-21":4,"2025-10-22":4,"2025-10-23":4,"2025-10-24":4,"2025-10-25":4,"2025-10-26":2,"2025-10-27":4,"2025-10-28":4,"2025-10-29":0,"2025-10-30":3,"2025-10-31":4,"2025-11-01":2,"2025-11-02":2,"2025-11-03":0,"2025-11-04":2,"2025-11-05":0,"2025-11-06":0,"2025-11-07":3,"2025-11-08":0,"2025-11-09":0,"2025-11-10":0,"2025-11-11":3,"2025-11-12":2,"2025-11-13":0,"2025-11-14":2,"2025-11-15":4,"2025-11-16":4,"2025-11-17":0,"2025-11-18":2,"2025-11-19":0,"2025-11-20":0,"2025-11-21":0,"2025-11-22":4,"2025-11-23":4,"2025-11-24":3,"2025-11-25":3,"2025-11-26":0,"2025-11-27":0,"2025-11-28":4,"2025-11-29":4,"2025-11-30":0,"2025-12-01":2,"2025-12-02":0,"2025-12-03":0,"2025-12-04":0,"2025-12-05":4,"2025-12-06":2,"2025-12-07":0,"2025-12-08":0,"2025-12-09":0,"2025-12-10":2,"2025-12-11":0,"2025-12-12":0,"2025-12-13":0,"2025-12-14":4,"2025-12-15":0,"2025-12-16":0,"2025-12-17":0,"2025-12-18":0,"2025-12-19":0,"2025-12-20":0,"2025-12-21":0,"2025-12-22":0,"2025-12-23":0,"2025-12-24":0,"2025-12-25":0,"2025-12-26":0,"2025-12-27":0,"2025-12-28":0,"2025-12-29":0,"2025-12-30":0,"2025-12-31":0,"2026-01-01":0,"2026-01-02":0,"2026-01-03":0,"2026-01-04":0,"2026-01-05":0,"2026-01-06":0,"2026-01-07":0,"2026-01-08":0,"2026-01-09":0,"2026-01-10":0,"2026-01-11":0,"2026-01-12":0,"2026-01-13":0,"2026-01-14":0,"2026-01-15":0,"2026-01-16":0,"2026-01-17":0,"2026-01-18":0,"2026-01-19":0,"2026-01-20":0,"2026-01-21":0,"2026-01-22":0,"2026-01-23":0,"2026-01-24":0,"2026-01-25":0,"2026-01-26":0,"2026-01-27":0,"2026-01-28":0,"2026-01-29":0,"2026-01-30":0,"2026-01-31":0,"2026-02-01":0,"2026-02-02":0,"2026-02-03":0,"2026-02-04":0,"2026-02-05":0,"2026-02-06":0,"2026-02-07":0,"2026-02-08":0,"2026-02-09":0,"2026-02-10":0,"2026-02-11":0,"2026-02-12":0,"2026-02-13":0,"2026-02-14":0,"2026-02-15":2,"2026-02-16":4,"2026-02-17":0,"2026-02-18":0,"2026-02-19":0,"2026-02-20":0,"2026-02-21":0,"2026-02-22":0,"2026-02-23":0,"2026-02-24":0,"2026-02-25":0,"2026-02-26":0,"2026-02-27":0,"2026-02-28":0,"2026-03-01":0,"2026-03-02":0,"2026-03-03":0,"2026-03-04":0,"2026-03-05":0,"2026-03-06":0,"2026-03-07":0,"2026-03-08":0,"2026-03-09":0,"2026-03-10":0,"2026-03-11":0,"2026-03-12":0,"2026-03-13":0,"2026-03-14":0,"2026-03-15":0,"2026-03-16":0,"2026-03-17":0,"2026-03-18":0,"2026-03-19":0,"2026-03-20":0,"2026-03-21":0,"2026-03-22":0,"2026-03-23":0,"2026-03-24":0,"2026-03-25":0,"2026-03-26":0,"2026-03-27":0,"2026-03-28":0,"2026-03-29":0,"2026-03-30":0,"2026-03-31":0,"2026-04-01":0,"2026-04-02":0,"2026-04-03":0,"2026-04-04":0,"2026-04-05":0,"2026-04-06":0,"2026-04-07":0,"2026-04-08":0,"2026-04-09":3,"2026-04-10":4,"2026-04-11":0,"2026-04-12":0,"2026-04-13":0,"2026-04-14":0,"2026-04-15":0,"2026-04-16":0,"2026-04-17":0,"2026-04-18":0,"2026-04-19":0,"2026-04-20":0,"2026-04-21":0,"2026-04-22":0,"2026-04-23":0,"2026-04-24":0,"2026-04-25":0,"2026-04-26":0,"2026-04-27":0,"2026-04-28":0,"2026-04-29":0,"2026-04-30":0,"2026-05-01":0,"2026-05-02":0,"2026-05-03":0,"2026-05-04":0,"2026-05-05":0,"2026-05-06":0,"2026-05-07":0,"2026-05-08":0,"2026-05-09":0,"2026-05-10":0,"2026-05-11":0,"2026-05-12":0,"2026-05-13":0,"2026-05-14":0,"2026-05-15":0,"2026-05-16":0,"2026-05-17":0,"2026-05-18":0,"2026-05-19":0,"2026-05-20":0,"2026-05-21":0,"2026-05-22":0,"2026-05-23":0,"2026-05-24":0,"2026-05-25":0,"2026-05-26":0,"2026-05-27":0,"2026-05-28":0,"2026-05-29":0,"2026-05-30":0,"2026-05-31":0,"2026-06-01":0,"2026-06-02":0,"2026-06-03":0,"2026-06-04":0,"2026-06-05":0,"2026-06-06":0,"2026-06-07":0,"2026-06-08":0,"2026-06-09":0,"2026-06-10":0,"2026-06-11":0,"2026-06-12":0,"2026-06-13":0,"2026-06-14":0,"2026-06-15":0,"2026-06-16":0,"2026-06-17":0,"2026-06-18":0,"2026-06-19":0,"2026-06-20":0,"2026-06-21":0,"2026-06-22":0,"2026-06-23":0,"2026-06-24":0,"2026-06-25":0,"2026-06-26":0,"2026-06-27":0,"2026-06-28":0,"2026-06-29":0,"2026-06-30":0,"2026-07-01":0,"2026-07-02":0,"2026-07-03":0,"2026-07-04":0,"2026-07-05":0,"2026-07-06":0,"2026-07-07":0,"2026-07-08":0,"2026-07-09":0,"2026-07-10":0,"2026-07-11":0,"2026-07-12":0,"2026-07-13":0,"2026-07-14":0,"2026-07-15":0,"2026-07-16":0,"2026-07-17":0,"2026-07-18":0,"2026-07-19":0,"2026-07-20":0,"2026-07-21":0,"2026-07-22":0,"2026-07-23":0,"2026-07-24":0,"2026-07-25":0,"2026-07-26":0,"2026-07-27":0,"2026-07-28":0,"2026-07-29":0,"2026-07-30":0,"2026-07-31":0,"2026-08-01":0,"2026-08-02":0,"2026-08-03":0,"2026-08-04":0,"2026-08-05":0,"2026-08-06":0,"2026-08-07":0,"2026-08-08":0,"2026-08-09":0,"2026-08-10":0,"2026-08-11":0,"2026-08-12":0,"2026-08-13":0,"2026-08-14":0,"2026-08-15":0,"2026-08-16":0,"2026-08-17":0,"2026-08-18":0,"2026-08-19":0,"2026-08-20":0,"2026-08-21":0,"2026-08-22":0,"2026-08-23":0,"2026-08-24":0,"2026-08-25":0,"2026-08-26":0,"2026-08-27":0,"2026-08-28":0,"2026-08-29":0,"2026-08-30":0,"2026-08-31":0,"2026-09-01":0,"2026-09-02":0,"2026-09-03":0,"2026-09-04":0,"2026-09-05":0,"2026-09-06":0,"2026-09-07":0,"2026-09-08":0,"2026-09-09":0,"2026-09-10":0,"2026-09-11":0,"2026-09-12":0,"2026-09-13":0,"2026-09-14":0,"2026-09-15":0,"2026-09-16":0,"2026-09-17":0,"2026-09-18":0,"2026-09-19":0,"2026-09-20":0,"2026-09-21":0,"2026-09-22":0,"2026-09-23":0,"2026-09-24":0,"2026-09-25":0,"2026-09-26":0,"2026-09-27":0,"2026-09-28":0,"2026-09-29":0,"2026-09-30":0,"2026-10-01":0,"2026-10-02":0,"2026-10-03":0,"2026-10-04":0,"2026-10-05":0,"2026-10-06":0,"2026-10-07":0}};
  if (history.handle !== handle || !Number.isInteger(history.totalAllTime)
      || !Number.isFinite(Date.parse(history.capturedAt))) throw new Error('Invalid Codeforces history');
  const submissions = [];
  for (let from = 1; ; from += 10000) {
    const data = await json(`https://codeforces.com/api/user.status?handle=${handle}&from=${from}&count=10000`);
    if (data.status !== 'OK' || !Array.isArray(data.result)) throw new Error('Invalid Codeforces response');
    submissions.push(...data.result);
    if (data.result.length < 10000) break;
    await new Promise(resolve => setTimeout(resolve, 2200));
  }
  const seen = new Set(), newSolves = {};
  for (const s of submissions.sort((a,b) => a.creationTimeSeconds - b.creationTimeSeconds || a.id - b.id)) {
    if (s.verdict !== 'OK') continue;
    const contest = s.problem.contestId ?? s.contestId ?? s.problem.problemsetName;
    const key = contest === undefined ? 'named:' + s.problem.name : contest + ':' + s.problem.index;
    if (seen.has(key)) continue;
    seen.add(key);
    if (s.creationTimeSeconds * 1000 <= Date.parse(history.capturedAt)) continue;
    const date = iso((s.creationTimeSeconds + 3 * 3600) * 1000);
    newSolves[date] = (newSolves[date] || 0) + 1;
  }
  const levels = { ...history.levels };
  for (const [date, count] of Object.entries(newSolves)) levels[date] = Math.min(4, count + 1);
  const totalAllTime = history.totalAllTime + Object.values(newSolves).reduce((sum,n) => sum+n, 0);
  console.log(`Codeforces: ${totalAllTime} solved; public profile history + new public API solves`);
  return { levels, newSolves, totalAllTime };
}
async function leetcode() {
  const counts = {};
  for (const year of new Set([start.getUTCFullYear(), today.getUTCFullYear()])) {
    const data = await json('https://leetcode.com/graphql/', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Referer: `https://leetcode.com/u/${handle}/`, 'User-Agent': 'Profile activity calendar' },
      body: JSON.stringify({ query: 'query($username:String!,$year:Int!){matchedUser(username:$username){userCalendar(year:$year){submissionCalendar}}}', variables: { username: handle, year } })
    });
    const calendar = data.data?.matchedUser?.userCalendar?.submissionCalendar;
    if (typeof calendar !== 'string') throw new Error('Invalid LeetCode calendar response');
    for (const [timestamp, count] of Object.entries(JSON.parse(calendar))) counts[iso(Number(timestamp) * 1000)] = Number(count);
  }
  return counts;
}
async function monkeytype() {
  const response = await json('https://api.monkeytype.com/users/' + handle + '/profile');
  const activity = response.data?.testActivity;
  if (!activity || !Array.isArray(activity.testsByDays) || !Number.isFinite(activity.lastDay)) return null;
  const last = new Date(activity.lastDay); last.setUTCHours(0, 0, 0, 0);
  if (!Number.isFinite(last.getTime())) throw new Error('Invalid Monkeytype calendar date');
  const counts = {};
  activity.testsByDays.forEach((value, index) => {
    const count = value == null ? 0 : Number(value);
    if (!Number.isInteger(count) || count < 0) throw new Error('Invalid Monkeytype test count');
    counts[iso(last.getTime() - (activity.testsByDays.length - 1 - index) * day)] = count;
  });
  return counts;
}
// Each provider preserves its own last successful chart if temporarily unavailable.
let successes = 0;
for (const [name, loader] of [['Codeforces', codeforces], ['LeetCode', leetcode], ['Monkeytype', monkeytype]]) {
  try {
    const values = await loader();
    if (values === null) { console.log(`${name} activity is hidden; waiting for public profile activity`); successes++; continue; }
    for (const theme of ['light', 'dark']) await writeFile(`activity-${name.toLowerCase()}-${theme}.svg`, chart(name, values, theme));
    console.log(`${name} calendar refreshed`); successes++;
  } catch (error) { console.error(`${name}: ${error.message}`); }
}
if (successes !== 3) process.exitCode = 1;

// Monkeytype uses completed typing tests from the public profile calendar.
