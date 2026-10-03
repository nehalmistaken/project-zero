export function grievanceText(input){const description=input.split(/DESCRIPTION:\s*\n/i)[1];const title=input.match(/^TITLE:\s*(.*)/i)?.[1]||'';return (description?title+' '+description:input).toLowerCase();}
export function triage(text){
 const affirmative=text.replace(/\b(?:no|without|not any)\s+(?:immediate\s+)?(?:fire|danger|injuries|injury|flooding|risk)\b/g,' ');
 const signals=[];
 const hazard=/\b(electrocut\w*|live wire\w*|exposed (?:electric\w* )?wire\w*|sparking|fire|gas leak|injur\w*|collapsed|collapse|sewage.*drinking|contaminated.*water|water.*contaminated|flooding|dangerous)\b|खुली तार|खुले तार|करंट|आग लगी|बाढ़|घायल|जान का खतरा/.test(affirmative);
 const roadRisk=/pothole|pot hole|गड्ढ|gaddh/.test(text)&&/highway|national highway|accident|deep|large|big|school|hospital|बड़ा/.test(text);
 const mainLeak=/(main|major|burst|broken|damage|damaged).*(water pipe|pipeline|water line)|(?:main|burst).*pipe|pipeline.*(?:burst|damage)|पाइप.*फट/.test(text);
 const outage=/no water|no power|no electricity|power cut|outage|supply.*(?:stopped|cut|off)|पानी.*बंद|बिजली.*बंद|nahi aa|band hai/.test(text);
 const broad=/entire|whole|hospital|school|hundreds|village|ward|colony|पूरा|अस्पताल/.test(text);
 const prolonged=/\b(?:[3-9]|\d{2,})\s*days|weeks|week|हफ्त|सप्ताह|तीन दिन/.test(text);
 if(hazard)signals.push('Immediate safety or public-health hazard');if(roadRisk)signals.push('Road defect with a high-risk location or size');if(mainLeak)signals.push('Major water infrastructure damage');if(outage&&broad)signals.push('Essential-service outage affecting a wider area');if(outage&&prolonged)signals.push('Prolonged essential-service outage');
 const disruption=/leak|damag|broken|pothole|pot hole|blocked|overflow|garbage|dirty|sewage|smell|not working|खराब|गंद|गड्ढ|लीक|kharab|gaddh/.test(text)||outage;
 const routine=/repaint|painting|suggestion|request.*bench|new bench|cosmetic|beautif|faded/.test(text);
 const priority=signals.length?'High':disruption?'Medium':routine?'Low':'Medium';
 return {priority,priority_reason:signals.length?signals.join('; ')+'.':disruption?'Service disruption or infrastructure defect requires review.':routine?'Routine improvement request; no explicit disruption detected.':'Impact is unclear. Medium priority is provisional; an officer should review.',priority_needs_review:!signals.length&&!disruption&&!routine,priority_signals:signals};
}
export function explicitCategory(text){
 const rules=[['Electricity',/\b(live wire|power cut|electricity|transformer|electrocut\w*|streetlight)\b|बिजली|bijli/],['Road',/\b(potholes?|pot holes?|footpath|road surface|road repair)\b|गड्ढ|gaddh/],['Water',/\b(water (?:pipe|supply|leak|pressure)|pipeline|drinking water)\b|पानी|paani/],['Garbage',/\b(garbage|rubbish|waste collection|trash|sewage|drain overflow)\b|कचरा|kachra/]];
 const hits=rules.filter(([,rule])=>rule.test(text));return hits.length===1?hits[0][0]:null;
}
