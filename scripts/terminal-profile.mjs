import { readFile, writeFile, mkdir } from 'node:fs/promises';
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const out = 'assets/terminal';
await mkdir(out, { recursive:true });
const palette = ['#18232b','#164b40','#21765d','#38b987','#7ce3b1'];
function svg(w,h,title,body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${esc(title)}</title><style>text{font-family:ui-monospace,SFMono-Regular,Consolas,Liberation Mono,monospace}.reveal{animation:reveal .65s both;animation-delay:var(--delay,0s)}@keyframes reveal{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.reveal{animation:none}}</style><rect x=".5" y=".5" width="${w-1}" height="${h-1}" rx="16" fill="#0d141b" stroke="#29353f"/>${body}</svg>`;
}
const text = (x,y,s,size=13,color='#c8d3df',extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(s)}</text>`;
const dots = `<circle cx="24" cy="23" r="4" fill="#f07879"/><circle cx="40" cy="23" r="4" fill="#e6bd6b"/><circle cx="56" cy="23" r="4" fill="#7ce3b1"/>`;
const portrait = JSON.parse(await readFile('data/portrait.json','utf8'));
let body = dots + text(78,27,'ziad@github: ~ / identity',11,'#8c9baa') + `<path d="M1 45H959M353 66V329" stroke="#29353f"/>`;
portrait.forEach((line,i)=>body+=text(25,76+i*6.8,line,7,'#b6c9c8',`xml:space="preserve" class="reveal" style="--delay:${(i*.035).toFixed(3)}s"`));
body+=text(25,338,'ASCII / ZiadMaghraby',10,'#7ce3b1');
body+=text(385,91,'Ziad Elmaghraby',29,'#edf4fa');
body+=text(385,120,'SOFTWARE ENGINEER / BACKEND .NET',12,'#7ce3b1');
const rows=[['focus','C# · ASP.NET Core · REST APIs'],['data','EF Core · SQL · Dapper'],['building','StockPilot / NoteForge'],['approach','Clear structure. Maintainable code.'],['also','Laravel · React · Android']];
rows.forEach(([k,v],i)=>body+=`<g class="reveal" style="--delay:${.25+i*.14}s">${text(385,166+i*30,k,12,'#7ce3b1')}${text(478,166+i*30,v,12)}</g>`);
body+=text(385,333,'$ build · learn · iterate',12,'#8c9baa');
await writeFile(`${out}/identity.svg`,svg(960,360,'Ziad Elmaghraby — software engineer focused on backend .NET',body));
if(process.env.GITHUB_TOKEN && !process.argv.includes('--offline')) {
  const r=await fetch('https://api.github.com/graphql',{method:'POST',signal:AbortSignal.timeout(45000),headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query:'query{user(login:"ZiadMaghraby"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount color}}}}}}'})});
  if(!r.ok)throw Error(`GitHub HTTP ${r.status}`);
  const data=await r.json();
  if(data.errors)throw Error(JSON.stringify(data.errors));
  await writeFile('data/contributions.json',JSON.stringify(data.data.user.contributionsCollection.contributionCalendar,null,2)+'\n');
}
const calendar=JSON.parse(await readFile('data/contributions.json','utf8'));
const days=calendar.weeks.flatMap(w=>w.contributionDays);
if(days.length<360 || days.some(d=>!Number.isInteger(d.contributionCount)||d.contributionCount<0))throw Error('Invalid contribution calendar');
const total=days.reduce((s,d)=>s+d.contributionCount,0);
if(total!==calendar.totalContributions)throw Error('Contribution total mismatch');
let active=0, best=0, streak=0, longest=0;
for(const d of days){if(d.contributionCount){active++;streak++;}else streak=0;longest=Math.max(longest,streak);best=Math.max(best,d.contributionCount);}
body=dots+text(78,27,'ziad@github: ~ / contributions',11,'#8c9baa')+text(30,80,total.toLocaleString('en-US'),29,'#edf4fa')+text(180,79,'contributions in the last year',13,'#8c9baa');
let lastMonth='';
calendar.weeks.forEach((week,col)=>{
  const month=week.contributionDays[0].date.slice(0,7);
  if(month!==lastMonth && col<calendar.weeks.length-2){body+=text(53+col*16,111,new Date(week.contributionDays[0].date+'T12:00:00Z').toLocaleString('en-US',{month:'short',timeZone:'UTC'}),10,'#8c9baa');lastMonth=month;}
  week.contributionDays.forEach(d=>{
    const row=new Date(d.date+'T12:00:00Z').getUTCDay();
    const level=d.contributionCount===0?0:d.contributionCount<3?1:d.contributionCount<6?2:d.contributionCount<10?3:4;
    body+=`<rect x="${53+col*16}" y="${125+row*16}" width="12" height="12" rx="3" fill="${palette[level]}" class="reveal" style="--delay:${(col*.018+row*.04).toFixed(3)}s"><title>${d.date}: ${d.contributionCount} contributions</title></rect>`;
  });
});
body+=text(17,151,'M',10,'#8c9baa')+text(17,183,'W',10,'#8c9baa')+text(17,215,'F',10,'#8c9baa');
body+=`<path d="M30 255H930" stroke="#29353f"/>`+text(30,284,`${active} active days   /   ${longest}-day longest streak   /   ${best} best day`,12,'#b6c9c8');
body+=text(30,313,`${days[0].date} — ${days.at(-1).date} · GitHub contribution calendar · refreshed daily`,10,'#8c9baa');
body+=text(785,283,'Less',10,'#8c9baa');
palette.forEach((c,i)=>body+=`<rect x="${820+i*16}" y="273" width="12" height="12" rx="3" fill="${c}"/>`);
body+=text(905,283,'More',10,'#8c9baa');
await writeFile(`${out}/contributions.svg`,svg(960,337,`${total} GitHub contributions from ${days[0].date} to ${days.at(-1).date}`,body));
console.log(`Generated terminal identity and heatmap: ${total} contributions across ${days.length} days.`);
