import { readFile, writeFile, mkdir } from 'node:fs/promises';
const out='assets/terminal';
await mkdir(out,{recursive:true});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const portrait=JSON.parse(await readFile('data/portrait-vector.json','utf8'));
const themes={dark:{ink:'#e6edf3',muted:'#9daab8',line:'#30363d',accent:'#72d6bb',soft:'#161b22',grid:['#21262d','#174c43','#267d67','#41b896','#7ce3bd']},light:{ink:'#1f2328',muted:'#596775',line:'#d8dee4',accent:'#167761',soft:'#f6f8fa',grid:['#ebedf0','#b9e6d5','#75c8aa','#369f7c','#176c53']}};
function svg(w,h,title,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${esc(title)}</title><style>text{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif}.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.draw{animation:draw .24s both;animation-delay:var(--delay)}.appear{animation:appear .5s both;animation-delay:var(--delay)}@keyframes draw{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}@keyframes appear{from{opacity:0}to{opacity:1}}@media(prefers-reduced-motion:reduce){.draw,.appear{animation:none}}</style>${body}</svg>`;}
const text=(x,y,s,size,color,attrs='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${attrs}>${esc(s)}</text>`;
const rows=Array.from({length:portrait.size},()=>new Map());
for(const [x,y,width,color] of portrait.runs)rows[y].set(color,(rows[y].get(color)||'')+`M${x} ${y}h${width}v1h-${width}z`);
const vector=rows.map((r,y)=>`<g class="draw" style="--delay:${(y*.016).toFixed(3)}s">${[...r].map(([color,d])=>`<path d="${d}" fill="${color}"/>`).join('')}</g>`).join('');
for(const [theme,c] of Object.entries(themes)){
 let body=`<path d="M0 309H960" stroke="${c.line}"/>`;
 body+=text(24,49,'SOFTWARE ENGINEER',12,c.accent,'letter-spacing="2.5" font-weight="600"');
 body+=text(24,111,'Ziad Elmaghraby',45,c.ink,'font-weight="700" letter-spacing="-1.8"');
 body+=text(24,151,'Backend .NET · APIs · Data-driven applications',19,c.muted);
 body+=text(24,205,'I turn practical problems into well-structured software.',17,c.ink);
 body+=text(24,232,'Clear boundaries. Reliable data. Maintainable code.',17,c.muted);
 body+=`<circle cx="29" cy="271" r="4" fill="${c.accent}"/>`+text(42,276,'BUILD / LEARN / ITERATE',11,c.muted,'class="mono" letter-spacing="1"');
 body+=`<circle cx="795" cy="155" r="133" fill="${c.soft}"/><g transform="translate(663 18) scale(2.3)" shape-rendering="crispEdges">${vector}</g>`;
 await writeFile(`${out}/identity-${theme}.svg`,svg(960,310,'Ziad Elmaghraby — Backend .NET software engineer. Animated portrait based on his GitHub avatar.',body));
}
if(process.env.GITHUB_TOKEN&&!process.argv.includes('--offline')){
 const response=await fetch('https://api.github.com/graphql',{method:'POST',signal:AbortSignal.timeout(45000),headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query:'query{user(login:"ZiadMaghraby"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount color}}}}}}'})});
 if(!response.ok)throw Error(`GitHub HTTP ${response.status}`);
 const data=await response.json();if(data.errors)throw Error(JSON.stringify(data.errors));
 await writeFile('data/contributions.json',JSON.stringify(data.data.user.contributionsCollection.contributionCalendar,null,2)+'\n');
}
const calendar=JSON.parse(await readFile('data/contributions.json','utf8'));
const days=calendar.weeks.flatMap(w=>w.contributionDays);
if(days.length<360||days.some(d=>!Number.isInteger(d.contributionCount)||d.contributionCount<0))throw Error('Invalid contribution calendar');
const total=days.reduce((s,d)=>s+d.contributionCount,0);
if(total!==calendar.totalContributions)throw Error('Contribution total mismatch');
let active=0,run=0,longest=0;
for(const d of days){if(d.contributionCount){active++;run++;}else run=0;longest=Math.max(longest,run);}
const countMap=new Map(days.map(d=>[d.date,d.contributionCount]));
let cursor=new Date(days.at(-1).date+'T12:00:00Z'),current=0;
if(!countMap.get(cursor.toISOString().slice(0,10)))cursor.setUTCDate(cursor.getUTCDate()-1);
while(countMap.get(cursor.toISOString().slice(0,10))){current++;cursor.setUTCDate(cursor.getUTCDate()-1);}
for(const [theme,c] of Object.entries(themes)){
 let body=`<rect x=".5" y=".5" width="959" height="293" rx="12" fill="none" stroke="${c.line}"/>`;
 const stats=[[30,total.toLocaleString('en-US'),'CONTRIBUTIONS'],[272,active,'ACTIVE DAYS'],[514,`${current} ${current===1?'day':'days'}`,'CURRENT STREAK'],[756,`${longest} ${longest===1?'day':'days'}`,'LONGEST STREAK']];
 for(const [x,value,label] of stats)body+=text(x,43,value,27,c.ink,'font-weight="600"')+text(x,66,label,10,c.muted,'letter-spacing="1.1"');
 let lastMonth='';
 calendar.weeks.forEach((week,col)=>{
  const month=week.contributionDays[0].date.slice(0,7);
  if(month!==lastMonth&&col<calendar.weeks.length-2){body+=text(53+col*16,105,new Date(week.contributionDays[0].date+'T12:00:00Z').toLocaleString('en-US',{month:'short',timeZone:'UTC'}),11,c.muted);lastMonth=month;}
  week.contributionDays.forEach(d=>{
   const row=new Date(d.date+'T12:00:00Z').getUTCDay();
   const level=!d.contributionCount?0:d.contributionCount<3?1:d.contributionCount<6?2:d.contributionCount<10?3:4;
   body+=`<rect x="${53+col*16}" y="${119+row*16}" width="12" height="12" rx="2" fill="${c.grid[level]}" class="appear" style="--delay:${(col*.012+row*.025).toFixed(3)}s"><title>${d.date}: ${d.contributionCount} contributions</title></rect>`;
  });
 });
 body+=text(19,145,'M',10,c.muted)+text(19,177,'W',10,c.muted)+text(19,209,'F',10,c.muted);
 body+=text(30,265,`${days[0].date} — ${days.at(-1).date} · UTC · Updated daily`,11,c.muted);
 body+=text(766,265,'Less',10,c.muted);c.grid.forEach((fill,i)=>body+=`<rect x="${797+i*16}" y="255" width="12" height="12" rx="2" fill="${fill}"/>`);body+=text(885,265,'More',10,c.muted);
 await writeFile(`${out}/contributions-${theme}.svg`,svg(960,294,`${total} GitHub contributions; ${active} active days; current streak ${current} days; longest streak ${longest} days.`,body));
}
console.log(`Rendered light/dark identity and activity: ${total} contributions, ${days.length} days.`);
