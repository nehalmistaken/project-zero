import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const python=process.env.PROJECT_ZERO_PYTHON||path.join(root,'.venv',process.platform==='win32'?'Scripts/python.exe':'bin/python');
const children=[];let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill();process.exitCode=code;}
function launch(command,args,cwd=root){const child=spawn(command,args,{cwd,stdio:'inherit',env:{...process.env,FLASK_ENV:'production',PORT:'5000',HOST:'127.0.0.1',ANALYSIS_PORT:'5001',ANALYSIS_URL:'http://127.0.0.1:5001/analyze'}});children.push(child);child.on('error',e=>{console.error(e.message);stop(1);});child.on('exit',code=>{if(!stopping){console.error('A service stopped; shutting down the workspace.');stop(code||1);}});return child;}
async function health(url,expected){try{const r=await fetch(url,{signal:AbortSignal.timeout(1000)});const data=await r.json();return expected(data);}catch{return false;}}
async function wait(url,expected){for(let i=0;i<90&&!stopping;i++){if(await health(url,expected))return;await new Promise(r=>setTimeout(r,1000));}throw Error('Service did not become ready: '+url);}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
try{
 if(!fs.existsSync(python))throw Error('Python environment missing. Run npm run setup first.');
 if(!fs.existsSync(path.join(root,'models/multilingual-minilm/onnx/model_quantized.onnx')))throw Error('Model missing. Run npm run model:download.');
 for(const port of [5000,5001,5173]){try{await fetch(`http://127.0.0.1:${port}`,{signal:AbortSignal.timeout(800)});throw Error(`Port ${port} is already in use. Stop the existing project server before npm start.`);}catch(e){if(e.message.startsWith('Port '))throw e;}}
 launch(process.execPath,['analysis/server.mjs']);await wait('http://127.0.0.1:5001/health',d=>d.state==='ready');
 launch(python,['app.py'],path.join(root,'backend'));await wait('http://127.0.0.1:5000/health',d=>d.status==='healthy');
 launch(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5173','--strictPort'],path.join(root,'frontend'));
 console.log('PROJECT ZERO: http://127.0.0.1:5173 — frontend, Flask API, and multilingual model. Ctrl+C stops all services.');
}catch(e){console.error(e.message);stop(1);}
