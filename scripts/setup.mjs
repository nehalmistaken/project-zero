import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {downloadModel} from './download-model.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),win=process.platform==='win32';
function run(command,args,cwd=root){const r=spawnSync(command,args,{cwd,stdio:'inherit'});if(r.error||r.status!==0)throw Error(`${command} failed. ${r.error?.message||'Read the error above.'}`);}
try{
 if(!process.env.npm_execpath)throw Error('Run npm run setup from the repository root.');
 run(process.execPath,[process.env.npm_execpath,'ci'],path.join(root,'frontend'));
 const python=path.join(root,'.venv',win?'Scripts/python.exe':'bin/python');
 if(!fs.existsSync(python)){
  if(process.env.PROJECT_ZERO_PYTHON)run(process.env.PROJECT_ZERO_PYTHON,['-m','venv','.venv']);
  else if(win){const probe=spawnSync('py',['-3.12','--version']);run('py',[probe.status===0?'-3.12':'-3.11','-m','venv','.venv']);}
  else run('python3',['-m','venv','.venv']);
 }
 run(python,['-m','pip','install','-r','backend/requirements-runtime.txt']);
 await downloadModel();
 console.log('Setup complete. Run npm start to launch all three services.');
}catch(e){console.error(e.message);process.exitCode=1;}
