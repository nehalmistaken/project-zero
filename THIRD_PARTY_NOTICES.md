# Asset and dataset provenance

## Emblem of India
- Source: https://commons.wikimedia.org/wiki/File:Emblem_of_India.svg
- Original: https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg
- Author attributed by source: Government of India; source page marks the artwork public domain in India.
- Official insignia use restrictions are separate from copyright. Included only as a design reference in this visibly independent civic demonstration. Do not present PROJECT ZERO as a government service.

## India Gate photograph
- Source: https://commons.wikimedia.org/wiki/File:India_Gate_in_New_Delhi,_India.jpg
- Photographer: Jais006, 2 December 2011.
- License: CC0 1.0 Universal Public Domain Dedication.
- Display treatment: CSS crop and dark overlay; original asset retained.

## Indian Citizen Grievance Dataset
- Source: https://www.kaggle.com/datasets/abhisheksingh016/citizen-grievance-dataset
- Author: Abhishek Singh. Version 3. License: CC0: Public Domain (verified through Kaggle dataset API).
- Files: grievances_synthetic.csv and grievances_holdout_templates.csv.
- Synthetic Hindi, Hinglish and English training examples with CPGRAMS-style categories, not official government grievance records.
- Reproduction and category mapping: ml_model/train_browser_model.py.
- Browser model and report: frontend/src/ml/complaint-model.json and ml_model/browser-evaluation.json.
- MuRIL was researched but not bundled. This locally trained Multinomial Naive Bayes model is now the offline fallback; the default full workspace uses MiniLM described below.

## Pretrained semantic model
- Model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2, by Sentence Transformers.
- Base model: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (Apache-2.0).
- ONNX conversion: Xenova/paraphrase-multilingual-MiniLM-L12-v2, revision 2c4055b12046f11709e9df2c122e59ffbdc2f900.
- Runtime: @huggingface/transformers 3.8.1 with ONNX Runtime.
- Weights are unmodified downloaded quantized ONNX files. Project-specific routing uses analysis/prototypes.json and explicit triage rules; no pretrained weight fine-tuning is claimed.
- License text: analysis/MODEL-LICENSE.txt. Download checksums: analysis/model-lock.json.
