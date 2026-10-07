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
  const unit = platform === 'Monkeytype' ? 'typing tests' : 'submissions';
  const colors = dark ? ['#2d333b', '#1b4721', '#2b6a30', '#46954a', '#6bc46d'] : ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
  const text = dark ? '#adbac7' : '#57606a';
  const border = dark ? '#444c56' : '#d0d7de';
  let total = 0, active = 0, cells = '', months = '', lastMonth = -1;
  const weeks = Math.ceil(((today - gridStart) / day + 1) / 7);
  const step = 13, cell = 10, left = 44;
  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(gridStart.getTime() + i * day);
    if (date > today) continue;
    const n = date >= start ? Number(values[iso(date)] || 0) : 0;
    if (!Number.isInteger(n) || n < 0) throw new Error('Invalid daily activity count');
    total += n; if (n) active++;
    const level = n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 10 ? 3 : 4;
    const x = left + Math.floor(i / 7) * step, y = 53 + date.getUTCDay() * step;
    cells += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${colors[level]}" stroke="${border}" stroke-opacity=".35"><title>${n} ${unit} on ${iso(date)}</title></rect>`;
    if (date.getUTCMonth() !== lastMonth && date.getUTCDate() < 8) {
      months += `<text x="${x}" y="43">${date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}</text>`;
      lastMonth = date.getUTCMonth();
    }
  }
  const legend = colors.map((c, i) => `<rect x="${647 + i * 13}" y="157" width="10" height="10" rx="2" fill="${c}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="192" viewBox="0 0 780 192" role="img"><title>${platform}: ${total} ${unit} in the last year</title><rect x=".5" y=".5" width="779" height="191" rx="6" fill="none" stroke="${border}"/><g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif" fill="${text}" font-size="11"><text x="16" y="23" font-size="14">${total.toLocaleString('en-US')} ${platform} ${unit} in the last year</text>${months}<text x="15" y="77">Mon</text><text x="15" y="103">Wed</text><text x="15" y="129">Fri</text>${cells}<text x="44" y="166">${active} active days · ${iso(start)} – ${iso(today)} · UTC</text><text x="615" y="166">Less</text>${legend}<text x="720" y="166">More</text></g></svg>`;
}
async function codeforces() {
  const counts = {};
  const submissions = [];
  for (let from = 1; ; from += 10000) {
    const data = await json(`https://codeforces.com/api/user.status?handle=${handle}&from=${from}&count=10000`);
    if (data.status !== 'OK' || !Array.isArray(data.result)) throw new Error('Invalid Codeforces response');
    submissions.push(...data.result);
    for (const s of data.result) {
      const date = iso(s.creationTimeSeconds * 1000);
      counts[date] = (counts[date] || 0) + 1;
    }
    if (data.result.length < 10000 || data.result.at(-1).creationTimeSeconds * 1000 < start) break;
    await new Promise(resolve => setTimeout(resolve, 2200));
  }

  const reference = {"2025-10-12":4,"2025-10-13":4,"2025-10-14":4,"2025-10-15":4,"2025-10-16":4,"2025-10-17":4,"2025-10-18":4,"2025-10-19":4,"2025-10-20":4,"2025-10-21":4,"2025-10-22":4,"2025-10-23":4,"2025-10-24":4,"2025-10-25":4,"2025-10-26":2,"2025-10-27":4,"2025-10-28":4,"2025-10-29":0,"2025-10-30":3,"2025-10-31":4,"2025-11-01":2,"2025-11-02":2,"2025-11-03":0,"2025-11-04":2,"2025-11-05":0,"2025-11-06":0,"2025-11-07":3,"2025-11-08":0,"2025-11-09":0,"2025-11-10":0,"2025-11-11":3,"2025-11-12":2,"2025-11-13":0,"2025-11-14":2,"2025-11-15":4,"2025-11-16":4,"2025-11-17":0,"2025-11-18":2,"2025-11-19":0,"2025-11-20":0,"2025-11-21":0,"2025-11-22":4,"2025-11-23":4,"2025-11-24":3,"2025-11-25":3,"2025-11-26":0,"2025-11-27":0,"2025-11-28":4,"2025-11-29":4,"2025-11-30":0,"2025-12-01":2,"2025-12-02":0,"2025-12-03":0,"2025-12-04":0,"2025-12-05":4,"2025-12-06":2,"2025-12-07":0,"2025-12-08":0,"2025-12-09":0,"2025-12-10":2,"2025-12-11":0,"2025-12-12":0,"2025-12-13":0,"2025-12-14":4,"2025-12-15":0,"2025-12-16":0,"2025-12-17":0,"2025-12-18":0,"2025-12-19":0,"2025-12-20":0,"2025-12-21":0,"2025-12-22":0,"2025-12-23":0,"2025-12-24":0,"2025-12-25":0,"2025-12-26":0,"2025-12-27":0,"2025-12-28":0,"2025-12-29":0,"2025-12-30":0,"2025-12-31":0,"2026-01-01":0,"2026-01-02":0,"2026-01-03":0,"2026-01-04":0,"2026-01-05":0,"2026-01-06":0,"2026-01-07":0,"2026-01-08":0,"2026-01-09":0,"2026-01-10":0,"2026-01-11":0,"2026-01-12":0,"2026-01-13":0,"2026-01-14":0,"2026-01-15":0,"2026-01-16":0,"2026-01-17":0,"2026-01-18":0,"2026-01-19":0,"2026-01-20":0,"2026-01-21":0,"2026-01-22":0,"2026-01-23":0,"2026-01-24":0,"2026-01-25":0,"2026-01-26":0,"2026-01-27":0,"2026-01-28":0,"2026-01-29":0,"2026-01-30":0,"2026-01-31":0,"2026-02-01":0,"2026-02-02":0,"2026-02-03":0,"2026-02-04":0,"2026-02-05":0,"2026-02-06":0,"2026-02-07":0,"2026-02-08":0,"2026-02-09":0,"2026-02-10":0,"2026-02-11":0,"2026-02-12":0,"2026-02-13":0,"2026-02-14":0,"2026-02-15":2,"2026-02-16":4,"2026-02-17":0,"2026-02-18":0,"2026-02-19":0,"2026-02-20":0,"2026-02-21":0,"2026-02-22":0,"2026-02-23":0,"2026-02-24":0,"2026-02-25":0,"2026-02-26":0,"2026-02-27":0,"2026-02-28":0,"2026-03-01":0,"2026-03-02":0,"2026-03-03":0,"2026-03-04":0,"2026-03-05":0,"2026-03-06":0,"2026-03-07":0,"2026-03-08":0,"2026-03-09":0,"2026-03-10":0,"2026-03-11":0,"2026-03-12":0,"2026-03-13":0,"2026-03-14":0,"2026-03-15":0,"2026-03-16":0,"2026-03-17":0,"2026-03-18":0,"2026-03-19":0,"2026-03-20":0,"2026-03-21":0,"2026-03-22":0,"2026-03-23":0,"2026-03-24":0,"2026-03-25":0,"2026-03-26":0,"2026-03-27":0,"2026-03-28":0,"2026-03-29":0,"2026-03-30":0,"2026-03-31":0,"2026-04-01":0,"2026-04-02":0,"2026-04-03":0,"2026-04-04":0,"2026-04-05":0,"2026-04-06":0,"2026-04-07":0,"2026-04-08":0,"2026-04-09":3,"2026-04-10":4,"2026-04-11":0,"2026-04-12":0,"2026-04-13":0,"2026-04-14":0,"2026-04-15":0,"2026-04-16":0,"2026-04-17":0,"2026-04-18":0,"2026-04-19":0,"2026-04-20":0,"2026-04-21":0,"2026-04-22":0,"2026-04-23":0,"2026-04-24":0,"2026-04-25":0,"2026-04-26":0,"2026-04-27":0,"2026-04-28":0,"2026-04-29":0};
  for (const offset of [0,3]) for (const mode of ['all','accepted','first-solve']) {
    const daily = {}, seen = new Set();
    for (const s of [...submissions].sort((a,b)=>a.creationTimeSeconds-b.creationTimeSeconds)) {
      if (mode !== 'all' && s.verdict !== 'OK') continue;
      const key = String(s.problem.contestId ?? s.problem.problemsetName)+':'+s.problem.index;
      if (mode === 'first-solve' && seen.has(key)) continue;
      seen.add(key);
      const date=iso((s.creationTimeSeconds+offset*3600)*1000);
      daily[date]=(daily[date]||0)+1;
    }
    const mismatches=Object.entries(reference).filter(([d,n])=>((daily[d]||0)===0?0:Math.min(4,daily[d]+1))!==n);
    console.log(JSON.stringify({mode,offset,total:Object.values(daily).reduce((a,b)=>a+b,0),active:Object.keys(daily).length,mismatches:mismatches.length,examples:mismatches.slice(0,8)}));
  }
  console.log('DAILY_ALL='+JSON.stringify(counts));
  try {
    const res=await fetch('https://codeforces.com/profile/'+handle,{signal:AbortSignal.timeout(30000)});
    const html=await res.text();
    console.log('PROFILE_HTML',res.status,html.length);
    console.log(html.split('\n').filter(line=>/activity|calendar|Activity|Calendar/.test(line)).join('\n').slice(0,14000));
  } catch(error) { console.log(error.message); }
  return counts;
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
