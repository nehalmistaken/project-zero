import assert from 'node:assert/strict';
import fs from 'node:fs';
import {analyze} from '../analysis/engine.mjs';
import {analyzeComplaint} from '../frontend/src/services/nlp.js';
const cases=[
 ['The taps in our apartment have run dry since yesterday.','Water'],
 ['There is a crater in the carriageway that damages passing tyres.','Road'],
 ['Every evening the lamps along our lane stay dark.','Electricity'],
 ['Refuse bags have accumulated because the collection truck never comes.','Garbage'],
 ['Please repaint the faded seating in our public garden.','Others'],
 ['हमारे घरों में पीने का पानी नहीं आ रहा है।','Water'],
 ['सड़क पर गड्ढे होने से वाहन दुर्घटना हो रही है।','Road'],
 ['कूड़ा कई दिनों से सड़क पर पड़ा है।','Garbage'],
 ['हमारे मोहल्ले में बिजली की आपूर्ति बंद है।','Electricity'],
 ['The loudspeaker at the venue keeps everyone awake at night.','Others'],
 ['A water main burst and the drinking supply has stopped.','Water'],
 ['A live wire is hanging over the pavement.','Electricity']
];
const rows=[];
for(const [text,expected] of cases){const result=await analyze(text);assert.equal(result.classifier_source,'multilingual_minilm');rows.push({text,expected,actual:result.category,baseline:analyzeComplaint(text).category,review:result.needs_review,similarity:result.semantic_similarity});}
const report={kind:'Hand-authored regression set, not an independent accuracy benchmark',model:'Xenova/paraphrase-multilingual-MiniLM-L12-v2',total:rows.length,correct:rows.filter(r=>r.actual===r.expected).length,baselineCorrect:rows.filter(r=>r.baseline===r.expected).length,rows};
fs.writeFileSync(new URL('../analysis/evaluation.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
assert.ok(report.correct>=10,'Investigate category regressions before shipping');
assert.equal((await analyze('A person died after touching a live wire.')).priority,'High');
const unrelated=await analyze('please help me with this problem');assert.ok(unrelated.needs_review);
