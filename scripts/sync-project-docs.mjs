import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const guide=JSON.parse(fs.readFileSync(new URL('frontend/src/content/projectGuide.json',root),'utf8'));
let text=`# ${guide.name}\n\n${guide.subtitle}\n\n[GitHub repository](${guide.repository})\n\n`;
for(const s of guide.sections){
 text+=`## ${s.title}\n\n`;
 for(const p of s.paragraphs||[])text+=p+'\n\n';
 if(s.table){text+='| '+s.table.headers.join(' | ')+' |\n| '+s.table.headers.map(()=>'---').join(' | ')+' |\n';for(const row of s.table.rows)text+='| '+row.map(c=>c.replaceAll('|','\\|')).join(' | ')+' |\n';text+='\n';}
 for(const step of s.steps||[]){text+=`### ${step.title}\n\n`;if(step.code)text+='```sh\n'+step.code+'\n```\n\n';if(step.text)text+=step.text+'\n\n';}
 for(const item of s.items||[])text+='- '+item+'\n';if(s.items)text+='\n';
 for(const p of s.paragraphsAfter||[])text+=p+'\n\n';
 for(const [label,url] of s.links||[])text+=`- [${label}](${url})\n`;if(s.links)text+='\n';
}
text=text.trimEnd()+'\n';
for(const file of ['README.md','docs/civicflow-frontend.md']){
 const url=new URL(file,root);
 if(process.argv.includes('--check')){if(fs.readFileSync(url,'utf8').replaceAll('\r\n','\n')!==text)throw Error(file+' is out of sync. Run node scripts/sync-project-docs.mjs.');}
 else fs.writeFileSync(url,text);
}
console.log(process.argv.includes('--check')?'Project guides are synchronized.':'Updated README.md and docs/civicflow-frontend.md.');
