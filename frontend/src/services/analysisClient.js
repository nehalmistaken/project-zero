import {analyzeComplaint} from './nlp.js';
import {grievanceText} from './triage.js';
export async function analyzeWithModel(input){
 if(typeof window==='undefined')return analyzeComplaint(input);
 try{const response=await fetch('/analysis-api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:grievanceText(input)}),signal:AbortSignal.timeout(120000)});if(!response.ok)throw Error('Analysis service unavailable');const result=await response.json();if(!result.data?.category)throw Error('Invalid analysis result');return result.data;}
 catch{return {...analyzeComplaint(input),analysis_warning:'The pretrained model service is not available. Start the full project from its root folder. This suggestion uses the bundled classifier and rules.',model_name:'Bundled Naive Bayes fallback'};}
}
