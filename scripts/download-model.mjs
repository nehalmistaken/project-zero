import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {createHash} from 'node:crypto';
export const modelId='Xenova/paraphrase-multilingual-MiniLM-L12-v2';
export const revision='2c4055b12046f11709e9df2c122e59ffbdc2f900';
export const modelDir=fileURLToPath(new URL('../models/multilingual-minilm/',import.meta.url));
const files=['config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','onnx/model_quantized.onnx'];
export async function downloadModel(){
 fs.mkdirSync(modelDir,{recursive:true});const manifest={modelId,revision,files:[]};
 const lock=JSON.parse(fs.readFileSync(new URL('../analysis/model-lock.json',import.meta.url),'utf8'));
 for(const name of files){const target=path.join(modelDir,name);fs.mkdirSync(path.dirname(target),{recursive:true});
 if(!fs.existsSync(target)){console.log('Downloading '+name);const response=await fetch(`https://huggingface.co/${modelId}/resolve/${revision}/${name}`);if(!response.ok)throw Error('Model download failed: '+response.status);await pipeline(Readable.fromWeb(response.body),fs.createWriteStream(target+'.partial'));fs.renameSync(target+'.partial',target);}
 const hash=createHash('sha256');for await(const chunk of fs.createReadStream(target))hash.update(chunk);const entry={name,bytes:fs.statSync(target).size,sha256:hash.digest('hex')};
 if(entry.sha256!==lock.files.find(f=>f.name===name)?.sha256)throw Error('Model checksum mismatch: '+name+'. Remove this file and run npm run model:download again.');
 manifest.files.push(entry);
 }
 fs.writeFileSync(path.join(modelDir,'manifest.json'),JSON.stringify(manifest,null,2));console.log('Pinned multilingual model is ready locally.');
}
if(process.argv[1]===fileURLToPath(import.meta.url))downloadModel().catch(e=>{console.error(e.message);process.exitCode=1;});
