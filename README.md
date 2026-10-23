# DevOps Exam Hub 🚀

A polished, developer-grade single-sitting MCQ examination application covering the complete modern DevOps engineering roadmap.

Built with **HTML5, CSS3, Bootstrap 5.3 CDN, and Vanilla JavaScript (ES6+)**, integrated with **MongoDB Atlas** for student account creation, question bank persistence, and exam result tracking.

---

## 🌟 Highlights

- **Exactly 100 Rigorous Questions**: Curated across 6 foundational DevOps topics following the roadmap:
  - **Git (25)** — Including interactive rebase, `rebase --onto`, conflict markers, `rerere`, reflog recovery, `git bisect`, and **4 "arrange the correct sequence" MCQs**.
  - **GitHub (10)** — Workflows, events, runners, secrets, matrix builds, branch protection, PR mechanics.
  - **Terraform (15)** — State locking, remote backends, `import`, drift detection, lifecycle rules, modules.
  - **Ansible (15)** — Agentless model, handlers, idempotency, variable precedence, Galaxy roles, Vault.
  - **Docker (20)** — Container runtime architecture, multi-stage builds, networking, storage, layer caching.
  - **Kubernetes (15)** — Control plane, Pods, Deployments, StatefulSets, Services, Ingress, probes, QoS, RBAC.
- **Difficulty Mix**:
  - Easy: 10%
  - Medium: 30%
  - Hard: 60%
- **MongoDB Atlas Integration**:
  - Automatically seeds all 100 questions with correct answer keys into MongoDB Atlas.
  - Mandatory student registration (Full Name + Email) stored in MongoDB Atlas `students` collection.
  - Complete exam submissions (score, percentage, topic scores, time taken, per-question answers) recorded in `submissions` collection.
- **Dual-Mode Execution**:
  1. **Full-Stack with MongoDB Atlas**: Run `npm start` and visit `http://localhost:3000`.
  2. **Standalone Browser Execution**: Double-click [index.html](file:///c:/Devops%20Interview/index.html) directly in any browser (works offline with localStorage fallback and zero console errors).
- **Classy, Developer-Centric UI**:
  - Exclusive distraction-free dark theme (deep ink surfaces #111827 and #0B1020) tailored for prolonged focus.
  - Modern typography: Inter, Fraunces serif headings, JetBrains Mono code blocks.
  - Interactive question palette (1–100 grid) showing current, answered, unanswered, and marked states.
  - Monospace elapsed time tracking stopwatch with no time limit.
  - Keyboard shortcuts (`A–D` or `1–4` to select, `←`/`→` to navigate, `M` to mark for review).
  - Animated SVG score ring, topic breakdown progress bars, and comprehensive question review with expandable theory explanations.

---

## 📁 Project Structure

```
Devops Interview/
├── index.html                    # Main HTML application
├── css/
│   └── style.css                 # Complete design system tokens, themes & layout
├── js/
│   ├── app.js                    # Exam state engine, timer, palette & MongoDB sync
│   └── questions/                # 100 questions in 6 roadmap files
│       ├── git.js                # 25 questions (with 4 sequence MCQs)
│       ├── github.js             # 10 questions
│       ├── terraform.js          # 15 questions
│       ├── ansible.js            # 15 questions
│       ├── docker.js             # 20 questions
│       └── kubernetes.js         # 15 questions
├── server.js                     # Express backend connected to MongoDB Atlas
├── seed.js                       # Standalone MongoDB Atlas database seeder
├── validate-bank.js              # Question bank integrity & distribution validator
├── test-mongo.js                 # Database connectivity test script
├── atlas-credentials.env         # MongoDB Atlas connection URI and credentials
├── package.json                  # Dependencies (express, mongodb, cors, dotenv)
└── README.md                     # Documentation
```

---

## 🚀 How to Run

### Method 1: Full-Stack Mode with MongoDB Atlas (Recommended)

1. Make sure Node.js is installed.
2. Ensure [atlas-credentials.env](file:///c:/Devops%20Interview/atlas-credentials.env) is present in the project root:
   ```env
   MONGODB_USERNAME="shubhamgayke9860_db_user"
   MONGODB_PASSWORD="YKLKsyF3pURNEsmc"
   MONGODB_URI="mongodb+srv://shubhamgayke9860_db_user:YKLKsyF3pURNEsmc@devopsinterview.iikdoho.mongodb.net"
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open your browser to:
   ```
   http://localhost:3000
   ```
   - The status bar at the top of the start screen will display: **`🍃 MongoDB Atlas: Connected`**.
   - Enter your full name and email to create/authenticate your student account.
   - All submissions and progress are synchronized directly to MongoDB Atlas.

### Method 2: Standalone Browser Mode (`file://`)

- Simply double-click [index.html](file:///c:/Devops%20Interview/index.html) or open it in any web browser.
- No local server or build step required.
- If the backend server is running in the background, the web application will automatically connect to `http://localhost:3000/api` via CORS.
- If no server is running, the application gracefully operates in **Offline Mode** using `localStorage` for progress persistence.

---

## 🍃 MongoDB Atlas Database Schema

Database Name: `devops_exam_hub`

### 1. `students` Collection
Stores student account registrations:
```json
{
  "_id": "ObjectId('...')",
  "name": "Jane Doe",
  "email": "jane@company.com",
  "createdAt": "2026-10-23T04:14:35.000Z",
  "lastLoginAt": "2026-10-23T04:14:35.000Z",
  "examAttempts": 1,
  "lastExamScore": 88,
  "lastExamPercentage": 88,
  "lastExamAt": "2026-10-23T04:55:12.000Z"
}
```

### 2. `questions` Collection
Stores the verified 100 questions with complete options, correct answers, and explanations:
```json
{
  "_id": "ObjectId('...')",
  "id": "git-001",
  "topic": "Git",
  "subtopic": "Fetch vs Pull",
  "difficulty": "Easy",
  "question": "What is the primary difference between `git fetch` and `git pull`?",
  "code": null,
  "options": [
    { "id": "a", "text": "..." },
    { "id": "b", "text": "..." },
    { "id": "c", "text": "..." },
    { "id": "d", "text": "..." }
  ],
  "correct": "b",
  "explanation": "..."
}
```

### 3. `submissions` Collection
Records every student attempt with detailed telemetry:
```json
{
  "_id": "ObjectId('...')",
  "studentName": "Jane Doe",
  "studentEmail": "jane@company.com",
  "score": 88,
  "total": 100,
  "percentage": 88,
  "stats": {
    "correct": 88,
    "wrong": 9,
    "skipped": 3,
    "timeTaken": "52m 14s"
  },
  "topicScores": {
    "Git": { "correct": 22, "total": 25 },
    "GitHub": { "correct": 9, "total": 10 },
    "Terraform": { "correct": 13, "total": 15 },
    "Ansible": { "correct": 14, "total": 15 },
    "Docker": { "correct": 17, "total": 20 },
    "Kubernetes": { "correct": 13, "total": 15 }
  },
  "answers": {
    "git-001": "b",
    "git-002": "c"
  },
  "submittedAt": "2026-10-23T04:55:12.000Z"
}
```

---

## 🛠️ Validation & Scripts

- **Test MongoDB connection**:
  ```bash
  node test-mongo.js
  ```
- **Re-seed questions to MongoDB Atlas**:
  ```bash
  npm run seed
  ```
- **Validate question bank integrity**:
  ```bash
  npm run validate
  ```
  Validates 100/100 question count, ID uniqueness, 4 options per question, valid correct answers, 3–5 sentence explanations, absence of forbidden phrases, and Git sequence question counts.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `A` / `1` | Select Option A |
| `B` / `2` | Select Option B |
| `C` / `3` | Select Option C |
| `D` / `4` | Select Option D |
| `←` (Left Arrow) | Navigate to Previous Question |
| `→` (Right Arrow) | Navigate to Next Question |
| `M` | Toggle Mark for Review |

---

## 🔒 Anti-Cheating & AI Proctoring System

DevOps Exam Hub features an advanced, multi-layered anti-cheating security suite:

1. **Text Selection & Clipboard Lockdown**:
   - `user-select: none !important` applied across questions, code blocks, options, and layouts.
   - Text dragging, right-click context menu, text selection, and copy/cut/paste events are strictly intercepted and blocked.
   - Cheat key combinations blocked: `Ctrl+C`, `Ctrl+V`, `Ctrl+X`, `Ctrl+A`, `Ctrl+U`, `Ctrl+P`, `Ctrl+S`, `F12`, `Ctrl+Shift+I/J/C`.

2. **Window, Tab & Fullscreen Enforcement**:
   - The examination automatically requests fullscreen upon candidate start.
   - Window blur events, tab switching (`visibilitychange`), and fullscreen exit events are tracked in real time.
   - Exiting the exam tab or window immediately incurs an anti-cheating strike.

3. **Live Camera & AI Cell Phone Detection**:
   - Requires webcam access during pre-exam hardware check.
   - Live video feed is monitored by client-side **TensorFlow.js COCO-SSD** neural network (`@tensorflow-models/coco-ssd`).
   - Real-time bounding-box inference detects unauthorized handheld devices (`cell phone`, `telephone`).
   - Detection events trigger audible warning beeps, flash red visual banners on the video stream, and log timestamped infractions.

4. **3-Strike Termination Policy**:
   - Strike 1 & 2: Instant warning modal popup + high-frequency audio tone + strike counter increment (`1/3`, `2/3`).
   - Strike 3: **Immediate exam termination**. The examination is automatically locked, answers are submitted to MongoDB Atlas with an audit log of all infractions, and a red termination report is displayed on the results page.

---

## 🔒 Assessment Integrity Rules

- **Zero Hints During Examination**: No indication of correctness is revealed prior to submission.
- **Randomized Presentation**: Options (A–D) are randomly shuffled per attempt.
- **Refresh Protection**: Ongoing exam state is persisted so browser reloads never lose progress.
- **Neutral Result Presentation**: Strictly displays marks (X / 100) and percentages with no Pass/Fail or judgmental phrasing.
- **Audit Logging**: All infractions and termination status are logged to MongoDB Atlas `submissions` collection.

