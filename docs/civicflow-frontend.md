# PROJECT ZERO

Public grievance reporting, assisted classification, and officer review

[GitHub repository](https://github.com/nehalmistaken/project-zero)

## 1. What is PROJECT ZERO?

PROJECT ZERO is a civic service project for reporting a local problem, saving a tracking reference, and following the response. A citizen can describe a water, electricity, road, sanitation, or general concern. The app suggests a department and priority; an officer can review a saved case and explain a decision.

The recommended full launch starts the React interface, Flask API, and a pretrained multilingual MiniLM analysis service together on your computer. Local workspace keeps citizen records in browser storage while using the local model service. Connected API saves shared records in the Flask database. A smaller browser classifier remains available when the model service is offline, with a visible fallback notice.

Project name: PROJECT ZERO. The existing GitHub repository is nehalmistaken/project-zero. Its folder name can remain project-zero; it does not change the product name. This is an independent project, not a Government of India service.

- [Project repository](https://github.com/nehalmistaken/project-zero)

## 2. What you can do

- Report a concern: choose a category, enter a title and description, contact details and location, then review the suggested classification before saving.
- Analyze with AI: the downloaded multilingual MiniLM model compares the meaning of your title and description with civic service examples. The dialog shows a suggested department, priority and reasons. Priority remains an explainable safety-rule decision, not a separate trained urgency model.
- Track a case: keep the LOCAL reference, search Track & browse, or open Case timeline. Saved user cases appear before sample cases, newest first. The timeline shows recorded decisions and progress through five stages.
- Use a citizen account: save basic details for future forms. Guest access works without registration. Local records are associated with the guest workspace or local profile that created them.
- Review as an officer: open Operations workspace, search by reference or keywords, select a saved grievance, adjust its priority or advance its status, and enter a reason. That decision appears in the citizen's history.
- Use the separate Analysis desk: officers can select a saved grievance or test a draft, run the pretrained model, compare category similarities, inspect reference examples and risk signals, and review missing-information questions. Local officers can explicitly save a reviewed priority with a reason. Analysis alone never changes a saved case; connected officers use their existing operations controls to apply decisions.
- Approve officer access: the local administrator uses the separate Officer access page to approve pending officer registrations.
- Explore Service activity: sample arrivals, priorities, and statuses change randomly every 3–7 seconds. Metric cards filter the visible cases. The feed retains 40 samples; received totals can include older samples.
- See consistent time: matching analog and digital clocks use India Standard Time across the workspace and login page, with larger clocks on login and Service activity. Time comes from the computer clock, not a government time service.
- Receive save feedback: after a successful save, an animated helper appears for three seconds and fades out. A persistent confirmation and tracking reference remain.

## 3. What to install on your PC or laptop

Internet is needed for initial package and model downloads. The model then runs on this computer; complaint text is not sent to Hugging Face or a hosted AI provider. Allow disk space for npm packages, a Python environment, and model files. The rainbow animation is only a visual effect; this project does not call Gemini.

| Install | Needed for | Why |
| --- | --- | --- |
| Node.js 22.12+ with npm | Required for the frontend | Node runs Vite and build tools. npm installs the packages in package-lock.json. Use a supported Node version compatible with Vite 8. |
| A modern browser | Required | Runs the interface, browser NLP, storage and Web Crypto. Use the same browser and address to return to your saved local records. |
| VS Code or another IDE | Optional but useful | Open folders, edit code, and run commands in an integrated terminal. No IDE extension is required. |
| Git | Optional | Clone the repository and manage changes. Alternatively download the repository ZIP and extract it. |
| Python 3.11 or 3.12 with pip and venv | Required for the recommended full launch | Runs Flask. Setup installs the smaller runtime requirements; the original scikit-learn training environment is optional. |
| MongoDB | Optional backend database only | Leave MONGO_URI blank to use SQLite, which is included with Python. No separate SQLite installer is needed. |
| Pretrained multilingual MiniLM weights | Downloaded automatically during setup | About 136 MB of model and tokenizer files, plus runtime packages. Stored under models/multilingual-minilm. No GPU or API key is required. |

- [Node.js downloads](https://nodejs.org/en/download)
- [VS Code](https://code.visualstudio.com/)
- [Git downloads](https://git-scm.com/downloads)
- [Python downloads](https://www.python.org/downloads/)

## 4. One setup, one command to run everything

Install Node.js 22.12+ with npm and Python 3.11 or 3.12 first. Download and extract the repository ZIP, or clone the repository. Open the root folder in your IDE; it contains package.json, frontend, backend, analysis, scripts, and Start-Project.cmd.

### Get the source (skip if you extracted the ZIP)

```sh
git clone https://github.com/nehalmistaken/project-zero.git
cd project-zero
```

### Install once from the repository root

```sh
npm ci
npm run setup
```

The first command installs the local model runtime. Setup installs frontend packages, creates .venv, installs backend/requirements-runtime.txt, and downloads the pinned pretrained model. On Windows it looks for Python 3.12, then 3.11 through the py launcher. For a custom Python installation, set PROJECT_ZERO_PYTHON to its full executable path before setup. No PowerShell execution-policy changes are needed.

### Start the complete project

```sh
npm start
```

Run this from the root, not frontend. The launcher waits for the model and API to become ready before starting the interface. Open http://127.0.0.1:5173. It uses ports 5001 (analysis), 5000 (Flask), and 5173 (frontend). Stop an existing project server before starting another instance. Ctrl+C stops the services launched by this command.

### Windows shortcut

Double-click Start-Project.cmd at the repository root. It installs missing packages and the model, then starts the same combined launcher. Node/npm and Python must already be installed. If setup fails, the window keeps the error visible.

### Choose where to save records

Local workspace stores records in this browser. Continue as guest or create a citizen account. Local administrator credentials are admin / admin123; new local officers need approval. Connected API uses the running Flask database and its separately configured officer credentials. Both modes can use the same local pretrained model.

### Try the workflow

Save a fictional grievance and retain its reference. Sign in as the local administrator, select it from Operations workspace, and record a decision. Open Analysis desk to inspect model evidence separately. An analysis result does not automatically approve or close a grievance.

### Optional lightweight interface only

```sh
cd frontend
npm ci
npm start
```

This starts only Vite. If the model service is not running, analysis displays a fallback notice and uses the bundled browser model. Connected API also requires Flask, so use the root launcher for the full experience.

## 5. Technology used, explained simply

The full project has three running services: React/Vite on 5173, Flask on 5000, and Node-based model inference on 5001. The browser talks to the model through Vite’s local proxy. Flask uses the same model service when it needs a prediction. The model service listens on the loopback address only.

| Technology | Where used | What it does here |
| --- | --- | --- |
| React 19 + JavaScript / JSX | Frontend pages and components | Builds interactive forms, dialogs, accounts, review queues, and timeline screens. |
| React Router 7 | frontend/src/App.jsx | Switches between login, submission, tracking, activity, About Project, and officer pages without loading a separate website. |
| Vite 8 + Node.js + npm | Frontend tooling | Serves the local app, reloads edits during development, installs dependencies, and creates production files. |
| Tailwind CSS 4 + custom CSS + PostCSS / Autoprefixer | Styles and build configuration | Controls spacing, responsive layouts, theme colors, accessible focus states, and animations. PostCSS processes the styles for the build. |
| Lucide React | Interface icons | Provides consistent navigation, search, status and action icons. The analog clock is a small custom SVG component. |
| Browser storage + Web Crypto | Local accounts and grievances | Stores local records and salted PBKDF2 password hashes. These browser APIs require no npm or database install. |
| Multilingual MiniLM + Transformers.js + ONNX Runtime | analysis/engine.mjs, prototypes.json and server.mjs | Loads a pinned, quantized pretrained model locally. Embeds the complaint and reference examples, compares their cosine similarities, and returns category evidence. Explicit service phrases and safety rules supplement the model. |
| Axios | frontend/src/services/api.js | Sends HTTP requests when Connected API is selected. Local grievance actions use the local service instead. |
| Recharts | Connected Dashboard.jsx | Draws the connected officer dashboard's charts. It is not the engine behind the local simulation counters. |
| Oxlint + Node assertions | Frontend checks | Checks JavaScript quality and tests local records, accounts, officer decisions, simulation invariants and triage rules. |
| Python + Flask + Flask-CORS | backend/app.py | Runs the API, receives requests, and allows the separate frontend origin to communicate with it. |
| PyJWT + python-dotenv | Optional backend authentication/configuration | Validates signed authentication tokens and loads environment settings such as administrator credentials. |
| SQLite or MongoDB via PyMongo | Optional backend/database.py | Persists shared server-side records. SQLite is the fallback; MongoDB is selected through its connection configuration. |
| scikit-learn, pandas and NLTK (legacy tooling) | Optional original training scripts / classifier | Preserved for reproducing the original Python model. Not imported by the default runtime; not required by the combined launcher. |
| Bundled Naive Bayes fallback | frontend/src/ml and backend/integrated_classifier.py | Used when the pretrained service is unavailable. The UI discloses that fallback analysis is active. |

## 6. How the analysis works

A small hand-authored regression set produced 10/12 correct category decisions for the new pipeline versus 8/12 for the previous classifier. This is a development check, not an independent accuracy benchmark. The saved report includes both failures: a dry-tap paraphrase was deferred to general review, and one Hindi rubbish complaint was routed to Road. Do not treat the earlier 81.61% browser-model benchmark as the accuracy of this new pipeline.

The older browser Naive Bayes weights remain as a disclosed offline fallback. The pretrained model is downloaded, not retrained here. Model weights are stored outside Git because the ONNX file exceeds GitHub’s ordinary single-file limit; the repository includes a pinned downloader, checksums, model information and an evaluation script. The full project ZIP supplied in chat includes the downloaded model files.

### Use a real pretrained language model

Xenova/paraphrase-multilingual-MiniLM-L12-v2 is the ONNX version of a Sentence Transformers multilingual model. Setup downloads revision 2c4055b12046f11709e9df2c122e59ffbdc2f900. It produces numerical representations of text meaning; it is an embedding model, not a chatbot or a grievance-specific model trained by this project.

### Compare service meanings

The model compares the concern with curated multilingual examples for Water, Electricity, Road, Garbage and Others. The best similarity for each category is displayed in the officer desk. Close or weak matches trigger human review. Clear service phrases can determine routing while model matches provide supporting evidence.

### Check reported risks

Rules look for reported electrical hazards, contamination, major infrastructure damage, injury or death, widespread outages and other disruption. A death report without enough context still needs investigation; it does not establish a cause. These rules are not a trained priority model. Negation and context can still be misinterpreted.

### Inspect the result

Analysis desk shows the current saved decision alongside the new suggestion, reference examples, similarity scores, risk reasons and templated follow-up questions. Similarity scores are not probabilities. Officers must verify the facts; no model can guarantee accurate routing for every concern.

- [Pretrained ONNX model](https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2)
- [Original Sentence Transformers model and Apache 2.0 license](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
- [Original browser-model dataset](https://www.kaggle.com/datasets/abhisheksingh016/citizen-grievance-dataset)

## 7. Where your data goes

- Local grievances, citizen accounts, and officer accounts stay in this browser on this site address. They are not sent to a public authority. Clearing site data removes them; changing browser, hostname or port can make them appear missing.
- Local account passwords use PBKDF2-SHA-256 with a random salt. Local profile separation is a convenience for this project; someone controlling the browser can inspect or alter stored data. Server-side authorization is needed for a shared deployment.
- Simulation data is separate from saved citizen records and uses session storage. It is illustrative, not live government data. Its automatic changes never approve or resolve an actual saved grievance.
- The photo field currently saves a filename reference only. It does not upload or preserve the image itself.
- Connected mode sends requests to your configured Flask service and stores shared records in its database. Switching modes does not migrate local accounts or complaints. Connected officer accounts and local accounts are separate.
- Only title/description text is sent to the local model process. The model service does not save requests or log complaint text. It does not contact remote model hosts during inference. The connected database retains a legacy numeric sentiment field; a zero placeholder means sentiment was not measured by this model.

## 8. Backend configuration and service layout

The root launcher now starts Flask automatically. The default runtime no longer imports scikit-learn or NLTK, so the previous Windows native-library blocker is removed from this launch path. Shared workflows use Flask with SQLite by default; MongoDB remains optional.

Default local ports are fixed by the combined launcher. For a custom deployment, start each service separately and configure its host/port and frontend proxy accordingly.

### Configure server credentials if needed

Copy .env.example to a new .env in the root only if one does not already exist. Set JWT_SECRET_KEY, ADMIN_USERNAME and ADMIN_PASSWORD. Do not commit .env. Without overrides, the backend development login is admin / admin123. Local browser accounts remain separate.

### Database

Leave MONGO_URI empty for SQLite. Records are saved in backend/complaints.db. Do not delete it to refresh code. If MONGO_URI is configured, backend/database.py handles that connection and its fallback. Local browser records do not automatically migrate to this database.

### Health checks

```sh
http://127.0.0.1:5000/health
http://127.0.0.1:5001/health
```

Flask should report healthy; the analysis service should report ready. The UI is at http://127.0.0.1:5173.

### Legacy training, only if you need it

```sh
cd ml_model
../.venv/Scripts/python.exe train_model.py
```

First install backend/requirements.txt into the virtual environment. On macOS/Linux use ../.venv/bin/python. This reproduces the original scikit-learn model, not the pretrained MiniLM model used by the default application.

The combined launcher and 71 isolated backend regression tests were verified in this workspace. This is still a development application: a public deployment needs production hosting and access-control review. The launcher binds services locally; it does not publish them to the internet.

## 9. Checks, builds, and common problems

### Verify the pretrained model and shared backend

```sh
npm run test:analysis
.venv\Scripts\python.exe scripts/test-backend.py
```

Run from the repository root after setup. On macOS/Linux use .venv/bin/python. The semantic test runs actual model inference and writes analysis/evaluation.json. Backend tests use a disposable SQLite database. Start the full project first so backend integration tests can use the analysis service.

### Run frontend checks

```sh
cd frontend
npm test
npm run lint
npm run build
```

Use cd frontend only when starting at the repository root. Tests use isolated in-memory storage and do not change your browser records. The build creates frontend/dist.

### Preview a build locally

```sh
npm run preview
```

Run this inside frontend after building. This is a local preview, not a public deployment. A static host needs SPA fallback to index.html for direct route links. Connected mode also needs a separately deployed backend and configured API address.

- npm is not recognized: install Node.js with npm and reopen the terminal. In PowerShell, npm.cmd can be used if the npm.ps1 launcher is blocked.
- The page will not open: make sure the root npm start command is still running and use the exact port printed by Vite.
- Records appear missing: check that you used the same hostname, port, browser profile, workspace mode and citizen account. Simulation records are separate.
- Officer sign-in fails: confirm Local workspace versus Connected API. New local officers require approval; connected credentials come from the backend configuration.
- Connected requests fail: confirm the Flask terminal is running, VITE_API_URL ends in /api, and the backend is reachable. Restart Vite after changing frontend environment settings.
- AI suggests the wrong category or priority: give specific facts about the problem, duration and safety impact, review the suggestion, and use officer review when needed.
- A build reports a large NLP chunk: model weights load when needed. A size warning is distinct from a failed build.
- Model download or native runtime fails: read the setup error, verify internet access and platform support, then rerun npm run model:download. Do not disable OS protections. The frontend can still provide disclosed fallback suggestions.

## 10. Repository structure and documentation

To change the project explanation, edit frontend/src/content/projectGuide.json and run node scripts/sync-project-docs.mjs from the repository root. About Project reads the same content, so the application and repository documentation stay consistent. The repository slug is preserved to keep existing clone URLs working.

| Location | Purpose |
| --- | --- |
| frontend/src/pages | Login, grievance, activity, About Project, and officer screens. |
| frontend/src/components | Shared sidebar, clock, analysis dialog and submission feedback. |
| frontend/src/services | Local persistence, accounts, simulation, API requests and triage. |
| frontend/src/ml | Bundled browser model weights and report. |
| frontend/src/content/projectGuide.json | Single source for this About Project page and the generated repository guides. |
| frontend/tests | Isolated JavaScript workflow and regression checks. |
| backend | Optional Flask API, authentication, database and service workflows. |
| ml_model | Datasets, training scripts, evaluations and generated server model files. |
| scripts/sync-project-docs.mjs | Generates README.md and docs/civicflow-frontend.md from the shared guide. |
| Start-Project.cmd | Windows combined setup and launch shortcut. |
| THIRD_PARTY_NOTICES.md | Image and dataset attribution. |
| analysis | Local pretrained model engine, reference examples, evaluation report and license. |
| models/multilingual-minilm | Downloaded pinned weights and tokenizer files; ignored by Git. |
| scripts/setup.mjs and scripts/start.mjs | Install dependencies and supervise frontend, Flask and model services together. |
| scripts/test-backend.py | Isolated backend regression runner. |

## 11. Identity and credits

PROJECT ZERO uses an India-themed visual identity and identifies itself as an independent project. Displaying the emblem does not make it a government portal. The India Gate photograph is credited to Jais006 under CC0. Dataset and image provenance are recorded in THIRD_PARTY_NOTICES.md.

- [Emblem of India — source](https://commons.wikimedia.org/wiki/File:Emblem_of_India.svg)
- [India Gate photograph — source](https://commons.wikimedia.org/wiki/File:India_Gate_in_New_Delhi,_India.jpg)
