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
  else {
   const candidates=win?[['py',['-3.12']],['py',['-3.11']],['python',[]]]:[['python3.12',[]],['python3.11',[]],['python3',[]]];
   const found=candidates.find(([command,args])=>spawnSync(command,[...args,'-c','import sys; sys.exit(0 if sys.version_info[:2] in [(3,11),(3,12)] else 1)']).status===0);
   if(!found)throw Error('Install Python 3.11 or 3.12 with pip and venv, then restart this launcher.');
   run(found[0],[...found[1],'-m','venv','.venv']);
  }
 }
 run(python,['-m','pip','install','-r','backend/requirements-runtime.txt']);
 await downloadModel();
 fs.writeFileSync(path.join(root,'.project-zero-ready'),'Setup completed.\n');
 console.log('Setup complete. Run npm start to launch all three services.');
}catch(e){console.error(e.message);process.exitCode=1;}
