# PROJECT ZERO — setup, AI and architecture

## Run the app

Requirements: Node.js 22.12+ and npm. Open this repository in VS Code or your preferred IDE.

```sh
cd frontend
npm ci
npm start
```

Open the printed URL (normally http://127.0.0.1:5173). On Windows, `Start-Project.cmd` installs frontend dependencies if needed and starts the server.

## What runs in local mode?

The frontend is the interface, while browser storage holds local complaints and citizen profiles. The trained category model runs in JavaScript on the same device. No API key, external AI service, Python process or shared database is needed for this mode.

At login, choose **Local workspace** then **Continue as guest**, or select **Create account / Citizen sign in**. Registration asks for full name, email, password, optional phone and area. Account details prefill the complaint form. Passwords use PBKDF2-SHA-256 (600,000 iterations) with a random 16-byte salt; plaintext passwords are not stored. Accounts and records are logically separated by local profile, but this is not production multi-user security: a person controlling the browser can access browser storage. Guest records belong to the guest workspace on this device. Clearing site data removes all local accounts and records.

Local submissions are not sent to an authority. They do not automatically upload in connected mode. Photo references retain the filename only, matching the original API contract.

## AI / NLP actually implemented

- **Model:** Multinomial Naive Bayes, trained on the repository dataset plus Abhishek Singh's Indian Citizen Grievance Dataset v3 (CC0), containing synthetic Hindi, Hinglish and English complaints.
- **Features:** Unicode Hindi/English word unigrams and bigrams; Laplace smoothing.
- **Output:** Water, Electricity, Road, Garbage or Others, category score, evidence count and a human-review indicator when evidence is weak.
- **Priority:** separate, explainable severity/disruption rules. It is not a trained priority model, and language such as negation can still be misinterpreted.
- **Runtime:** JavaScript inference with bundled model weights. No network inference calls.
- **Evaluation:** 3,590 training examples and 734 held-out examples; 81.61% accuracy and 70.17% balanced accuracy. The original dataset uses a seeded stratified split; the Indian source uses its supplied separate-template holdout. Exact duplicate held-out text is removed from training. This is an in-repository benchmark, not independent real-world validation; generated templates may overlap. Scores are uncalibrated and must not be treated as a guarantee.

Retrain with Python standard-library tools (no pip dependencies required):

```sh
python ml_model/train_browser_model.py
```

Outputs: `frontend/src/ml/complaint-model.json` and `ml_model/browser-evaluation.json`. The shipped model is trained only on the training split, preserving its reported held-out evaluation. The original Flask TF-IDF / scikit-learn pipeline remains available separately.

## What does the backend do?

A database stores data; it does not provide the application workflow on its own. The Flask backend receives requests, validates them, authenticates officers, classifies text server-side, handles status changes and writes shared history/notifications through SQLite or MongoDB.

Local mode does not call that service for complaint actions. **Connected API** mode does. Officer sign-in always uses the real backend; public registration never grants officer privileges.

To start the existing backend, use Python 3.11 or 3.12. From the repository root:

```sh
python -m venv .venv
```

Activate it using `.venv\Scripts\Activate.ps1` in Windows PowerShell, or `source .venv/bin/activate` on macOS/Linux.

```sh
pip install -r backend/requirements.txt
python -m nltk.downloader vader_lexicon
cd ml_model
python train_model.py
cd ..
python backend/app.py
```

Configure officer credentials with the root `.env.example` and original README. SQLite fallback supports local operation without MongoDB. The frontend defaults to `http://localhost:5000/api`; override with `VITE_API_URL` in `frontend/.env` and restart Vite.

Connected backend verification remains blocked in this development environment by Windows Application Control rejecting the scikit-learn native library. Browser NLP is independently implemented and tested; no Windows security settings were changed.

## Interface updates

- PROJECT ZERO branding; login-first entry and basic citizen registration.
- The top toolbar and breadcrumbs are removed; Exit workspace and About Project are in the sidebar footer. Page navigation resets scroll position.
- Service activity replaces the previously decorative workspace label.
- Separate simulated activity with priority/status filters, timestamped timelines, status updates every 6 seconds and new arrivals every 12 seconds. No manual advance or pause controls. The latest 40 cases are retained; closed cases never revert to pending.
- Simulated records are never mixed into real complaint storage. Simulated records are explicitly labelled.
- Sync has a visible spinner, disabled state and a 650ms minimum feedback duration.
- Successful submissions show a themed animated helper and screen ripple for 950ms. A persistent confirmation remains afterward. Reduced-motion preferences disable motion.

## Tools and validation

React 19, React Router 7, Vite 8, Tailwind CSS 4, custom CSS, Lucide, Recharts, Axios, browser storage, Web Crypto, Python standard-library training and JavaScript model inference. Flask, NLTK and scikit-learn are retained for connected mode.

From `frontend`: `npm test`, `npm run lint`, `npm run build`. Tests cover local persistence/filtering/tracking, learned category inference, low-evidence review, registration, duplicate account rejection, wrong-password rejection, hashed storage and logical record separation. The frontend does not require the blocked Python native dependency.

Cleanup removed only the unused overview component and unused hero illustration. Backend workflows, datasets, training scripts and tests are retained because they serve connected mode or reproducible AI evaluation. No changes have been pushed to GitHub.

## Sources and current presentation

Indian data: https://www.kaggle.com/datasets/abhisheksingh016/citizen-grievance-dataset (Abhishek Singh, version 3, CC0). This is synthetic data with CPGRAMS-style labels, not official CPGRAMS records. Water, Electricity, Roads and Sanitation map to the four named civic categories; the remaining departments map to Others. The source CSVs are included under ml_model/indian_citizen_dataset for reproducibility.

The analysis popup uses a native modal dialog, keyboard focus handling, an indeterminate progress bar and reduced-motion support. The model loads on demand, not on the login screen.

The Emblem of India and an India Gate photo are bundled locally with source credits in THIRD_PARTY_NOTICES.md and About Project. The visible identity states Independent civic demo; PROJECT ZERO is not a Government of India service.
