import {mkdir,writeFile} from 'node:fs/promises';
const out='assets/terminal';
await mkdir(out,{recursive:true});
const themes={dark:{ink:'#e6edf3',muted:'#9daab8',line:'#30363d',accent:'#72d6bb',soft:'#161b22'},light:{ink:'#1f2328',muted:'#596775',line:'#d8dee4',accent:'#167761',soft:'#f6f8fa'}};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const projects=[
 {id:'stockpilot',number:'01',name:'StockPilot',category:'BACKEND / INVENTORY & ORDERS',lines:['Multi-tenant inventory with transactional stock','reservations, role-based access and integration tests.'],tags:['ASP.NET Core','EF Core','C#'],icon:'M0 8 16 0 32 8v22L16 38 0 30ZM0 8l16 8 16-8M16 16v22',mini:'tenant → order → reserve → commit'},
 {id:'noteforge',number:'02',name:'NoteForge',category:'PRODUCTIVITY / WORKSPACE',lines:['Block editing, nested pages and project databases','in a single workspace. Currently in development.'],tags:['Blazor','EF Core','SQLite'],icon:'M3 0h21l8 8v30H3ZM24 0v9h8M9 17h17M9 24h17M9 31h10',mini:'workspace / pages / blocks'},
 {id:'clarity',number:'03',name:'Clarity Clinic',category:'HEALTHCARE / OPERATIONS',lines:['Bilingual appointments, patient profiles and billing','with reports and audited doctor availability.'],tags:['PHP','Bilingual UI','Scheduling'],icon:'M12 0h12v12h12v12H24v12H12V24H0V12h12Z',mini:'appointments / patients / billing'}
];
for(const [theme,c]of Object.entries(themes))for(const p of projects){
 const t=(x,y,s,size=14,color=c.ink,attrs='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${attrs}>${esc(s)}</text>`;
 let b=`<rect x=".5" y=".5" width="959" height="225" rx="12" fill="none" stroke="${c.line}"/><path d="M1 38V188" stroke="${c.accent}" stroke-width="3"/><rect x="28" y="28" width="64" height="64" rx="12" fill="${c.soft}"/><g transform="translate(43 42)" fill="none" stroke="${c.accent}" stroke-width="1.6" stroke-linejoin="round">${'<path d="'+p.icon+'"/>'}</g>`;
 b+=t(116,44,p.category,11,c.accent,'letter-spacing="1.4"')+t(116,82,p.name,30,c.ink,'font-weight="700"')+t(909,47,p.number,21,c.muted,'text-anchor="end"');
 b+=t(116,116,p.lines[0],16,c.muted)+t(116,142,p.lines[1],16,c.muted);
 let x=116;for(const tag of p.tags){const w=tag.length*7.4+24;b+=`<rect x="${x}" y="170" width="${w}" height="27" rx="5" fill="${c.soft}"/>`+t(x+12,188,tag,12);x+=w+8;}
 b+=t(916,188,'View source ↗',13,c.accent,'text-anchor="end"');
 await writeFile(`${out}/project-${p.id}-${theme}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="226" viewBox="0 0 960 226" role="img"><title>${p.name} — ${esc(p.category)}</title><style>text{font-family:Segoe UI,Arial,sans-serif}</style>${b}</svg>`);
}
console.log('Rendered three project cards in dark and light themes.');
