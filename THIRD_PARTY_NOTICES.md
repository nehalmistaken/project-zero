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
- MuRIL pretrained model was researched but not bundled or executed. The shipped model is locally trained Multinomial Naive Bayes.
