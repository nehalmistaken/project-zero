import {grievanceText,triage,explicitCategory} from './triage.js';
import model from '../ml/complaint-model.json' with { type: 'json' };
export const modelReport = model.report;
const departments={Water:'Water Supply Department',Electricity:'Electricity Department',Road:'Public Works Department',Garbage:'Sanitation/Waste Management Department',Others:'General/Public Grievance Department'};
export function analyzeComplaint(input){
 const text=grievanceText(input);
 const words=text.match(/[a-z\u0900-\u097f]{2,}/g)||[];
 const tokens=[...words,...words.slice(1).map((w,i)=>words[i]+'_'+w)];
 const scores=[...model.priors];let recognized=0;
 for(const token of tokens){const weights=model.weights[token];if(weights){recognized++;weights.forEach((v,i)=>scores[i]+=v);}}
 const order=scores.map((score,i)=>({category:model.labels[i],score})).sort((a,b)=>b.score-a.score);
 const max=order[0].score,denom=order.reduce((n,x)=>n+Math.exp(x.score-max),0);
 const confidence=recognized?Math.exp(order[0].score-max)/denom:0;
 const impact=triage(text);
 const needs_review=recognized<2||confidence<.65||impact.priority_needs_review;
 const explicit=explicitCategory(text);
 const category=explicit||(recognized?order[0].category:'Others');
 return {category,department:departments[category],...impact,classification_reason:explicit?'Explicit service phrase matched; statistical model used as supporting evidence.':'Trained multilingual text model.',sentiment_score:null,classifier_source:'trained_multinomial_nb',confidence:explicit&&explicit!==order[0].category?null:confidence,needs_review,recognized_tokens:recognized,alternatives:order.slice(0,3).map(x=>({category:x.category,score:recognized?Math.exp(x.score-max)/denom:0}))};
}

