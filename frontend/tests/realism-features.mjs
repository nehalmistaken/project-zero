import assert from 'node:assert/strict';
import {initialFeed,advanceFeed} from '../src/services/activityFeed.js';
import {analyzeComplaint} from '../src/services/nlp.js';
let feed=initialFeed(100000);let previous=new Map(feed.rows.map(r=>[r.id,r.stage]));
for(let i=1;i<=100;i++){feed=advanceFeed(feed,100000+i*6000);assert.ok(feed.rows.length<=40);for(const row of feed.rows){assert.ok(row.stage>=(previous.get(row.id)||0));assert.equal(row.history.length,row.stage+1);assert.ok(row.history.every((e,j,a)=>j===0||e.at>=a[j-1].at));}previous=new Map(feed.rows.map(r=>[r.id,r.stage]));}
assert.ok(feed.sequence>6);assert.equal(new Set(feed.rows.map(r=>r.id)).size,feed.rows.length);
assert.equal(analyzeComplaint('हमारे इलाके में पानी की सप्लाई बंद है').category,'Water');
assert.equal(analyzeComplaint('bijli nahi aa rahi transformer kharab hai').category,'Electricity');
assert.equal(analyzeComplaint('sadak par gaddhe hain').category,'Road');
console.log('Feed invariants over 100 updates and Hindi/Hinglish smoke checks passed.');
