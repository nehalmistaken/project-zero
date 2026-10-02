"""Reproducible multilingual browser NB training; Python standard library only."""
import csv,json,math,random,re,collections,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCE='https://www.kaggle.com/datasets/abhisheksingh016/citizen-grievance-dataset'
def tokens(text):
    words=re.findall(r'[a-z\u0900-\u097f]{2,}',text.lower())
    return words+[a+'_'+b for a,b in zip(words,words[1:])]
def train(rows):
    labels=sorted({k for _,k in rows});counts={k:collections.Counter() for k in labels};docs=collections.Counter()
    for text,label in rows:counts[label].update(tokens(text));docs[label]+=1
    vocab=sorted(set().union(*(set(c) for c in counts.values())))
    totals={k:sum(counts[k].values())+len(vocab) for k in labels}
    return {'labels':labels,'weights':{w:[round(math.log((counts[k][w]+1)/totals[k]),7) for k in labels] for w in vocab},'priors':[math.log(docs[k]/len(rows)) for k in labels]}
def predict(model,text):
    scores=model['priors'][:]
    for token in tokens(text):
        if token in model['weights']:scores=[a+b for a,b in zip(scores,model['weights'][token])]
    return model['labels'][max(range(len(scores)),key=scores.__getitem__)]
def key(text):return ' '.join(text.lower().split())
def unique(rows):return list({key(t):(t,k) for t,k in rows}.values())
def load(path,external=False):
    mapping={'Water Supply':'Water','Electricity':'Electricity','Roads & Infrastructure':'Road','Sanitation & Garbage':'Garbage'}
    with path.open(encoding='utf-8-sig',newline='') as file:return unique([(r['text'] if external else r['complaint_text'],mapping.get(r['category'],'Others') if external else r['category']) for r in csv.DictReader(file)])
original=load(ROOT/'ml_model/dataset.csv');rng=random.Random(42);base_train=[];base_test=[]
for label in sorted({k for _,k in original}):
    group=[r for r in original if r[1]==label];rng.shuffle(group);n=max(1,int(len(group)*.2));base_test+=group[:n];base_train+=group[n:]
folder=ROOT/'ml_model/indian_citizen_dataset'
external_train=load(folder/'grievances_synthetic.csv',True);external_test=load(folder/'grievances_holdout_templates.csv',True)
test=unique(base_test+external_test);test_keys={key(t) for t,_ in test}
training=[r for r in unique(base_train+external_train) if key(r[0]) not in test_keys]
model=train(training)
def evaluate(rows):
    matrix={k:{j:0 for j in model['labels']} for k in model['labels']};correct=0
    for text,label in rows:
        result=predict(model,text);correct+=result==label;matrix[label][result]+=1
    recalls=[matrix[k][k]/sum(matrix[k].values()) for k in matrix if sum(matrix[k].values())]
    return {'samples':len(rows),'accuracy':round(correct/len(rows),4),'balanced_accuracy':round(sum(recalls)/len(recalls),4),'confusion_matrix':matrix}
metrics=evaluate(test)
report={'algorithm':'Multinomial Naive Bayes','features':'Unicode Hindi/English word unigrams and bigrams; Laplace smoothing','seed':42,'unique_samples':len(training)+len(test),'training_samples':len(training),'test_samples':len(test),'accuracy':metrics['accuracy'],'balanced_accuracy':metrics['balanced_accuracy'],'confusion_matrix':metrics['confusion_matrix'],'indian_template_holdout':evaluate(external_test),'original_holdout':evaluate(base_test),'source':SOURCE,'source_author':'Abhishek Singh','source_license':'CC0: Public Domain','source_version':3,'languages':['English','Hindi','Hinglish'],'limitations':'Synthetic Indian grievance examples plus repository examples. External template holdout is separate; exact duplicate test text removed from training. Broad departments map to Others. Not a real-world benchmark; scores are uncalibrated. Priority remains rule-based.'}
model['report']=report
(ROOT/'frontend/src/ml/complaint-model.json').write_text(json.dumps(model,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
(ROOT/'ml_model/browser-evaluation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ['confusion_matrix','indian_template_holdout','original_holdout']},indent=2))
