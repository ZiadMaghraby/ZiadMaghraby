import { readFile, writeFile, mkdir } from 'node:fs/promises';
const out='assets/terminal';
await mkdir(out,{recursive:true});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const portrait=JSON.parse(await readFile('data/portrait-vector.json','utf8'));
const themes={dark:{ink:'#e6edf3',muted:'#9daab8',line:'#30363d',accent:'#72d6bb',soft:'#161b22',grid:['#21262d','#174c43','#267d67','#41b896','#7ce3bd']},light:{ink:'#1f2328',muted:'#596775',line:'#d8dee4',accent:'#167761',soft:'#f6f8fa',grid:['#ebedf0','#b9e6d5','#75c8aa','#369f7c','#176c53']}};
function svg(w,h,title,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${esc(title)}</title><style>text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.tile{animation:enter .45s ease-out both}@keyframes enter{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}.cell{transform-box:fill-box;transform-origin:center;animation:pop .55s ease-out both}.active{animation:pop .55s ease-out both,flash .7s ease-out both}@keyframes pop{0%{opacity:0;transform:scale(.2)}60%{opacity:1;transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}@keyframes flash{0%,45%{filter:brightness(2.4)}100%{filter:brightness(1)}}.bar{transform-box:fill-box;transform-origin:bottom;animation:grow .6s ease-out both}@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}.still{display:none}@media(prefers-reduced-motion:reduce){.tile,.cell,.bar{animation:none!important;opacity:1!important;transform:none!important;filter:none!important}.moving{display:none}.still{display:inline}}</style>${body}</svg>`;}
const text=(x,y,s,size,color,attrs='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${attrs}>${esc(s)}</text>`;
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

// High-density monochrome portrait derived from the user's own avatar cutout.
const pixels=new Map(portrait.runs.map(([x,y,w,color])=>[y*portrait.size+x,color]));
const ramp=' .`:-=+*cs#%@';
const ascii=[];
for(let row=0;row<96;row++){
 let line='';
 for(let col=0;col<180;col++){
  const x=Math.min(114,Math.floor(col/180*115)),y=Math.min(114,Math.floor(row/96*115));
  const color=pixels.get(y*portrait.size+x);
  if(!color){line+=' ';continue;}
  const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
  const lum=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
  const density=Math.pow(Math.max(0,Math.min(1,(238-lum)/220)),.85);
  line+=ramp[Math.round(density*(ramp.length-1))];
 }
 ascii.push(line);
}
function terminal(c,command){return '<rect x=".5" y=".5" width="839" height="879" rx="10" fill="none" stroke="'+c.line+'"/><path d="M0 36H840" stroke="'+c.line+'"/><circle cx="20" cy="18" r="5" fill="#f07879"/><circle cx="37" cy="18" r="5" fill="#e6bd6b"/><circle cx="54" cy="18" r="5" fill="#52b788"/>'+text(420,23,command,12,c.muted,'text-anchor="middle"');}
for(const [theme,c] of Object.entries(themes)){
 let body=terminal(c,'ziad@github: ~ $ ./portrait.sh');
 ascii.forEach((line,i)=>{
  const delay=i*(5.8/96),duration=5.8/96,y=56+i*8.1;
  const rowText=text(20,y,line,7.2,c.ink,'xml:space="preserve" textLength="800" lengthAdjust="spacing"');
  body+='<g class="moving"><clipPath id="row'+i+'"><rect x="20" y="'+(y-7)+'" height="8.1" width="0"><animate attributeName="width" from="0" to="800" begin="'+delay.toFixed(3)+'s" dur="'+duration+'s" fill="freeze"/></rect></clipPath><g clip-path="url(#row'+i+')">'+rowText+'</g><rect y="'+(y-6)+'" width="4.444" height="6" fill="'+c.ink+'" opacity="0"><animate attributeName="x" from="20" to="820" begin="'+delay.toFixed(3)+'s" dur="'+duration+'s" fill="freeze"/><set attributeName="opacity" to=".85" begin="'+delay.toFixed(3)+'s"/><set attributeName="opacity" to="0" begin="'+(delay+duration).toFixed(3)+'s"/></rect></g><g class="still">'+rowText+'</g>';
 });
 body+='<path d="M0 837H840" stroke="'+c.line+'"/>'+text(20,860,'ziad@github:~$ whoami  Ziad Elmaghraby',13,c.muted)+'<rect class="moving" x="311" y="848" width="8" height="14" fill="'+c.ink+'"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.51;1" dur="1s" repeatCount="indefinite"/></rect>';
 await writeFile(out+'/portrait-'+theme+'.svg',svg(840,880,'Ziad Elmaghraby — monochrome ASCII portrait, typed row by row from his GitHub avatar.',body));
 body=terminal(c,'ziad@github: ~ $ ./about.sh');
 body+=text(38,105,'Ziad Elmaghraby',36,c.ink,'font-weight="700"');
 body+=text(38,149,'Software Engineer',24,c.accent);
 body+=text(38,187,'Backend .NET / APIs / Data',20,c.muted);
 const cards=[[38,236,current,'CURRENT STREAK',current===1?'day':'days'],[435,236,longest,'LONGEST STREAK',longest===1?'day':'days'],[38,412,active,'ACTIVE DAYS','last year'],[435,412,Math.max(...days.map(d=>d.contributionCount)),'BEST DAY','contributions']];
 for(const [index,[x,y,value,label,unit]] of cards.entries()){
  body+='<g class="tile" style="animation-delay:'+(index*.15).toFixed(2)+'s">';
  body+='<rect x="'+x+'" y="'+y+'" width="367" height="148" rx="8" fill="'+c.soft+'" stroke="'+c.line+'"/>';
  body+=text(x+22,y+34,label,16,c.muted);
  for(let k=1;k<=16;k++){
   const on=index*.15+.27+(k-1)*.075,off=on+.075;
   const number=Math.round(value*(1-Math.pow(1-k/16,3)));
   body+='<text class="moving" x="'+(x+22)+'" y="'+(y+90)+'" font-size="48" font-weight="700" fill="'+c.accent+'" opacity="0">'+number+'<set attributeName="opacity" to="1" begin="'+on.toFixed(3)+'s"/>'+(k<16?'<set attributeName="opacity" to="0" begin="'+off.toFixed(3)+'s"/>':'')+'</text>';
  }
  body+=text(x+22,y+90,value,48,c.accent,'class="still" font-weight="700"')+text(x+22,y+124,unit,16,c.muted)+'</g>';
 }
 // Monthly bars use only real contribution days from the displayed calendar.
 const monthly=new Map();for(const d of days){const key=d.date.slice(0,7);monthly.set(key,(monthly.get(key)||0)+d.contributionCount);}
 const months=[...monthly].slice(-12),max=Math.max(1,...months.map(m=>m[1]));
 body+='<g class="tile" style="animation-delay:1s">'+text(38,625,'$ monthly contributions',20,c.accent)+'</g>';
 body+='<path d="M38 805H802" stroke="'+c.line+'"/>';
 months.forEach(([month,n],i)=>{
  const x=48+i*63,h=Math.max(2,n/max*126),delay=1.3+i*.06;
  body+='<rect class="bar" x="'+x+'" y="'+(805-h)+'" width="38" height="'+h+'" rx="3" fill="'+(n?c.accent:c.line)+'" style="animation-delay:'+delay.toFixed(2)+'s"><title>'+month+': '+n+' contributions</title></rect>';
  body+=text(x+19,835,new Date(month+'-01T12:00:00Z').toLocaleString('en-US',{month:'short',timeZone:'UTC'}),13,c.muted,'text-anchor="middle"');
  if(n)body+='<g class="tile" style="animation-delay:'+(delay+.6).toFixed(2)+'s">'+text(x+19,795-h,n,13,c.ink,'text-anchor="middle"')+'</g>';
 });
 await writeFile(out+'/about-'+theme+'.svg',svg(840,880,'Ziad Elmaghraby — backend .NET engineer; contribution streaks and activity statistics.',body));
 body='';
 let lastMonth='';
 calendar.weeks.forEach((week,col)=>{
  const month=week.contributionDays[0].date.slice(0,7);
  if(month!==lastMonth&&col<calendar.weeks.length-2){body+=text(53+col*16,20,new Date(week.contributionDays[0].date+'T12:00:00Z').toLocaleString('en-US',{month:'short',timeZone:'UTC'}),12,c.muted);lastMonth=month;}
  week.contributionDays.forEach(d=>{
   const row=new Date(d.date+'T12:00:00Z').getUTCDay();
   const level=!d.contributionCount?0:d.contributionCount<3?1:d.contributionCount<6?2:d.contributionCount<10?3:4;
   body+='<rect class="cell '+(level?'active':'')+'" style="animation-delay:'+(col*(3.45/53)+row*(.215/6)).toFixed(3)+'s" x="'+(53+col*16)+'" y="'+(34+row*16)+'" width="12" height="12" rx="2" fill="'+c.grid[level]+'"><title>'+d.date+': '+d.contributionCount+' contributions</title></rect>';
  });
 });
 body+=text(10,60,'Mon',10,c.muted)+text(10,92,'Wed',10,c.muted)+text(10,124,'Fri',10,c.muted);
 body+=text(53,164,total.toLocaleString('en-US')+' contributions in the last year',14,c.ink,'font-weight="600"');
 body+=text(53,188,days[0].date+' — '+days.at(-1).date+' · Updated daily',10,c.muted);
 await writeFile(out+'/contributions-'+theme+'.svg',svg(960,201,total+' GitHub contributions in the last year.',body));
}
console.log('Rendered reference-matched entrance: cursor typing, diagonal pops, staggered count-ups and growing monthly bars.');

await import('./project-cards.mjs');
