import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
const npm=process.platform==='win32'?'npm.cmd':'npm';
function run(command,args){if(process.env.npm_execpath){args=[process.env.npm_execpath,...args];command=process.execPath;}const r=spawnSync(command,args,{stdio:'inherit',shell:process.platform==='win32'&&command==='npm.cmd'});if(r.error||r.status!==0)throw Error(r.error?.message||'Command failed; see the message above.');}
try{
 if(!fs.existsSync('node_modules/@huggingface/transformers'))run(npm,['ci']);
 if(!fs.existsSync('.project-zero-ready')||!fs.existsSync('frontend/node_modules')||!fs.existsSync('.venv'))run(npm,['run','setup']);
 await import('./start.mjs');
}catch(e){console.error(e.message);process.exitCode=1;}
