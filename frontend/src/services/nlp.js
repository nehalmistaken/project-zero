import model from '../ml/complaint-model.json' with { type: 'json' };
export const modelReport = model.report;
const departments={Water:'Water Supply Department',Electricity:'Electricity Department',Road:'Public Works Department',Garbage:'Sanitation/Waste Management Department',Others:'General/Public Grievance Department'};
export function analyzeComplaint(input){
 const text=(input.split('DESCRIPTION:\n')[1]||input).toLowerCase();
 const words=text.match(/[a-z\u0900-\u097f]{2,}/g)||[];
 const tokens=[...words,...words.slice(1).map((w,i)=>words[i]+'_'+w)];
 const scores=[...model.priors];let recognized=0;
 for(const token of tokens){const weights=model.weights[token];if(weights){recognized++;weights.forEach((v,i)=>scores[i]+=v);}}
 const order=scores.map((score,i)=>({category:model.labels[i],score})).sort((a,b)=>b.score-a.score);
 const max=order[0].score,denom=order.reduce((n,x)=>n+Math.exp(x.score-max),0);
 const confidence=recognized?Math.exp(order[0].score-max)/denom:0;
 const needs_review=recognized<2||confidence<.65;
 const category=recognized?order[0].category:'Others';
 const severity=/\b(fire|injur\w*|exposed|electrocut\w*|flood\w*|danger\w*|collapse\w*)\b/.test(text) || /खतरा|आग|घायल|खुली तार|खुले तार|बाढ़|jaan ka khatra|aag lagi/.test(text);
 const duration=/\b(days|weeks|repeated|daily|blocked|broken|leaking|dirty|smell|contaminated)\b/.test(text) || /बंद|खराब|गंदा|गंदगी|लीक|गड्ढ|दिनों|haft|nahi aa|kharab|gaddhe|band hai/.test(text);
 const priority=severity?'High':duration?'Medium':'Low';
 return {category,department:departments[category],priority,sentiment_score:null,classifier_source:'trained_multinomial_nb',confidence,needs_review,recognized_tokens:recognized,priority_reason:severity?'Safety-related language detected.':duration?'Ongoing disruption detected.':'No explicit high-severity signal detected.',alternatives:order.slice(0,3).map(x=>({category:x.category,score:recognized?Math.exp(x.score-max)/denom:0}))};
}

