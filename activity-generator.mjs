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
  const colors = dark ? ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'] : ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
  const text = dark ? '#c9d1d9' : '#57606a';
  const border = dark ? '#30363d' : '#d0d7de';
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
    cells += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${colors[level]}" stroke="${border}" stroke-opacity=".35"><title>${n} submissions on ${iso(date)}</title></rect>`;
    if (date.getUTCMonth() !== lastMonth && date.getUTCDate() < 8) {
      months += `<text x="${x}" y="43">${date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}</text>`;
      lastMonth = date.getUTCMonth();
    }
  }
  const legend = colors.map((c, i) => `<rect x="${647 + i * 13}" y="157" width="10" height="10" rx="2" fill="${c}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="192" viewBox="0 0 780 192" role="img"><title>${platform}: ${total} submissions in the last year</title><rect x=".5" y=".5" width="779" height="191" rx="6" fill="${dark ? '#0d1117' : '#ffffff'}" stroke="${border}"/><g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif" fill="${text}" font-size="11"><text x="16" y="23" font-size="14">${total.toLocaleString('en-US')} ${platform} submissions in the last year</text>${months}<text x="15" y="77">Mon</text><text x="15" y="103">Wed</text><text x="15" y="129">Fri</text>${cells}<text x="44" y="166">${active} active days · ${iso(start)} – ${iso(today)} · UTC</text><text x="615" y="166">Less</text>${legend}<text x="720" y="166">More</text></g></svg>`;
}
async function codeforces() {
  const counts = {};
  for (let from = 1; ; from += 10000) {
    const data = await json(`https://codeforces.com/api/user.status?handle=${handle}&from=${from}&count=10000`);
    if (data.status !== 'OK' || !Array.isArray(data.result)) throw new Error('Invalid Codeforces response');
    for (const s of data.result) {
      const date = iso(s.creationTimeSeconds * 1000);
      counts[date] = (counts[date] || 0) + 1;
    }
    if (data.result.length < 10000 || data.result.at(-1).creationTimeSeconds * 1000 < start) break;
    await new Promise(resolve => setTimeout(resolve, 2200));
  }
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
// Each provider preserves its own last successful chart if temporarily unavailable.
let successes = 0;
for (const [name, loader] of [['Codeforces', codeforces], ['LeetCode', leetcode]]) {
  try {
    const values = await loader();
    for (const theme of ['light', 'dark']) await writeFile(`activity-${name.toLowerCase()}-${theme}.svg`, chart(name, values, theme));
    console.log(`${name} calendar refreshed`); successes++;
  } catch (error) { console.error(`${name}: ${error.message}`); }
}
if (successes !== 2) process.exitCode = 1;

