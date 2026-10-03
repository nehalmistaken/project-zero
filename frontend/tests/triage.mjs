import assert from 'node:assert/strict';
import {analyzeComplaint} from '../src/services/nlp.js';
const cases=[['A big pot hole in national highway 12','Road','High'],['Main city water pipeline damaged','Water','High'],['The rubbish bins are overflowing with garbage','Garbage','Medium'],['No electricity in the entire ward for 4 days','Electricity','High'],['Please repaint the faded park bench',null,'Low'],['There is no fire, please repaint the faded bench',null,'Low'],['An exposed electric wire is sparking near the school','Electricity','High'],['हमारे इलाके में पानी की सप्लाई बंद है','Water','Medium']];
for(const [text,category,priority] of cases){const r=analyzeComplaint(text);if(category)assert.equal(r.category,category,text);assert.equal(r.priority,priority,text);assert.ok(r.priority_reason);}
const unclear=analyzeComplaint('Please help me with this issue');assert.ok(unclear.priority_needs_review);
assert.equal(analyzeComplaint('TITLE: big pothole\nLOCATION: water road\nCITIZEN: Example\nDESCRIPTION:\na dangerous hole on the highway').category,'Road');
console.log('10 triage regression checks passed. Rule checks are not a model accuracy benchmark.');
