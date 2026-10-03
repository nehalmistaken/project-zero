import {pipeline,env} from '@huggingface/transformers';
import fs from 'node:fs';
import {modelDir,modelId,revision} from '../scripts/download-model.mjs';
import {analyzeComplaint} from '../frontend/src/services/nlp.js';
import {grievanceText,explicitCategory,triage} from '../frontend/src/services/triage.js';
const examples=JSON.parse(fs.readFileSync(new URL('./prototypes.json',import.meta.url),'utf8'));
const departments={Water:'Water Supply Department',Electricity:'Electricity Department',Road:'Public Works Department',Garbage:'Sanitation/Waste Management Department',Others:'General/Public Grievance Department'};
env.allowRemoteModels=false;
env.cacheDir=new URL('../models/cache/',import.meta.url).pathname;
let ready;
export function initialize(){return ready??=load().catch(e=>{ready=null;throw e;});}
async function load(){const extractor=await pipeline('feature-extraction',modelDir,{dtype:'q8',device:'cpu',local_files_only:true});const embedded=await extractor(examples.map(x=>x.text),{pooling:'mean',normalize:true});return {extractor,vectors:embedded.tolist()};}
function questions(text){const out=[];if(!/\d|day|week|since|hour|दिन|घंट|से/.test(text))out.push('When did the issue start, and is it still happening?');if(!/people|famil|resident|school|hospital|home|area|लोग|घर/.test(text))out.push('How many people or essential facilities are affected?');if(!/near|road|street|ward|sector|village|पास|इलाके/.test(text))out.push('What is the exact location or nearest landmark?');return out;}
export async function analyze(input){
 const text=grievanceText(input).slice(0,6000);if(text.trim().length<5)throw Error('Provide a more detailed description.');
 const {extractor,vectors}=await initialize();const vector=(await extractor(text,{pooling:'mean',normalize:true})).tolist()[0];
 const matches=examples.map((e,i)=>({...e,score:vectors[i].reduce((sum,v,j)=>sum+v*vector[j],0)})).sort((a,b)=>b.score-a.score);
 const alternatives=Object.keys(departments).map(category=>({category,score:Math.max(...matches.filter(m=>m.category===category).map(m=>m.score))})).sort((a,b)=>b.score-a.score);
 const best=alternatives[0],margin=best.score-alternatives[1].score,explicit=explicitCategory(text),uncertain=best.score<.38||margin<.045;
 const category=explicit||(uncertain?'Others':best.category),impact=triage(text);
 return {category,department:departments[category],...impact,classifier_source:'multilingual_minilm',model_name:modelId,model_revision:revision,confidence:null,semantic_similarity:best.score,category_margin:margin,needs_review:uncertain||impact.priority_needs_review,classification_reason:explicit?`A clear ${explicit} service phrase determined routing; semantic matches are supporting evidence.`:uncertain?'The semantic matches are too close or weak for reliable routing. General review is recommended.':`The complaint is closest in meaning to the ${category} service examples.`,alternatives,evidence:matches.slice(0,3),follow_up_questions:questions(text),suggested_action:impact.priority==='High'?'Promptly verify the reported safety impact and route to the responsible service.':impact.priority==='Low'?'Review as a routine service improvement.':'Verify the scale and duration before assigning a response.',sentiment_score:null,analysis_version:'minilm-prototype-v1'};
}
export function fallback(input){return {...analyzeComplaint(input),model_name:'Bundled Naive Bayes fallback',analysis_warning:'Pretrained model is unavailable. This result uses the smaller bundled classifier and rules.',follow_up_questions:questions(grievanceText(input))};}
