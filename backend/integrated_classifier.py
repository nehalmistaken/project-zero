"""Use the local semantic service; expose a clearly marked fallback if offline."""
import json
import math
import os
import re
from pathlib import Path
from urllib.request import Request, urlopen

class ComplaintClassifier:
    def __init__(self):
        self.model = json.loads((Path(__file__).resolve().parents[1] / 'frontend/src/ml/complaint-model.json').read_text(encoding='utf-8'))

    def get_full_analysis(self, text):
        # Send only the concern, never consolidated citizen contact metadata.
        title = re.search(r'^TITLE:\s*(.*)', text, re.I)
        parts = re.split(r'DESCRIPTION:\s*\n', text, flags=re.I)
        concern = ((title.group(1) if title else '') + ' ' + parts[1]) if len(parts) > 1 else text
        try:
            request = Request(os.getenv('ANALYSIS_URL', 'http://127.0.0.1:5001/analyze'), data=json.dumps({'text': concern[:6000]}).encode(), headers={'Content-Type': 'application/json'})
            with urlopen(request, timeout=120) as response:
                return json.load(response)['data']
        except Exception:
            words = re.findall(r'[a-z\u0900-\u097f]{2,}', concern.lower())
            tokens = words + [a+'_'+b for a,b in zip(words, words[1:])]
            scores = self.model['priors'][:]
            for token in tokens:
                if token in self.model['weights']:
                    scores = [a+b for a,b in zip(scores, self.model['weights'][token])]
            index = max(range(len(scores)), key=scores.__getitem__)
            hazard = bool(re.search(r'\b(died|fatal|fire|injur\w*|live wire|gas leak|dangerous|contaminated)\b|मौत|आग|घायल', concern, re.I))
            return {'category': self.model['labels'][index], 'priority': 'High' if hazard else 'Medium', 'priority_reason': 'Reported safety signal; verify urgently.' if hazard else 'Model service offline; priority requires officer review.', 'sentiment_score': None, 'confidence': None, 'needs_review': True, 'classifier_source': 'backend_nb_fallback', 'analysis_warning': 'Local semantic service unavailable. Bundled category model used; review priority manually.'}
