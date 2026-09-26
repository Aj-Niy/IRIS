# ShikshaSetu (शिक्षासेतु) — Offline Android Edition

### Mother-Tongue First Foundational Literacy & Numeracy (FLN) and Inclusive Multimodal Learning Platform

**ShikshaSetu** is an offline-ready, teacher-first educational platform designed to bridge the language divide in primary and secondary classrooms across tribal and rural regions. Grounded in **NEP 2020** and the **NIPUN Bharat Mission** (Jharkhand MTB-MLE, Problem Statement 26042), the platform empowers Hindi-medium teachers to instruct children in their native mother tongues: **Santali (`sat` / Ol Chiki `ᱚᱞ ᱪᱤᱠᱤ`)**, **Ho (`hoc` / Warang Citi)**, and **Mundari (`unr`)**.

This branch (`offline-mode`) packages the full ShikshaSetu application into an installable Android APK optimized for $\le$ 2GB RAM low-resource school tablets that operates completely in **Airplane Mode** without internet connectivity or local backend servers.

---

## 1. Key System Modules

### 1.1 FLN Lesson Studio (Offline Ready)
- Translates Hindi classroom passages into authentic tribal languages with dual-script rendering (**Ol Chiki `ᱚᱞ ᱪᱤᱠᱤ`** and phonetic Romanization).
- Provides word-by-word linguistic glossing, vocabulary breakdowns, and audio playback guides for teachers.
- Covers Grade 1 to 3 primary NCERT and JCERT curriculum modules.
- Includes local lesson completion and tracking directly saved to on-device IndexedDB.

### 1.2 Classroom Voice Engine (Offline Ready)
- Two-way constrained classroom dialogue speech matching between Hindi and indigenous languages.
- Powered by the bundled **Aadi Vaani** local linguistic corpus with zero network latency.
- Full offline support for classroom commands, affirmations, numeracy, and student response recognition.

### 1.3 NIPUN Bharat Worksheets & Flashcards (Offline Ready)
- Competency-aligned practice material mapped directly to NIPUN Bharat learning outcomes (L1.1, L1.2, L2.1, L3.1 Literacy, M1.1, M1.2, M2.1, M3.1 Numeracy).
- Instant offline PDF generation via `jsPDF` for resource-constrained schools.
- 48+ bilingual tactile flashcards with Ol Chiki native script and Roman pronunciation.

### 1.4 Offline Socratic Pedagogy Mentor (Offline Ready)
- Deterministic on-device teacher assistance for classroom instructions.
- Provides 1-click structured pedagogical actions: Competency explanations, 5 oral classroom questions, concrete object activity plans, and remediation guides for struggling learners.

### 1.5 Offline Teacher Dashboard & Translation Memory (Offline Ready)
- Computes classroom metrics from local IndexedDB storage (lessons delivered, vocabulary mastered, worksheets generated).
- Local Translation Memory records and prioritizes teacher-approved translations on future lookups.
- Queues offline activity logs for background synchronization when internet connectivity is re-established.

### 1.6 Online Multimodal Extensions (Online Connected Mode)
- **AI Avatar Video Studio**: Study note to animated video generator with voice narration (available when online).
- **Live ISL Gesture Recognizer**: Real-time webcam hand-gesture recognition with MediaPipe & LSTM (available when online / on desktop).
- **NCERT Curriculum Hub**: Digital textbook and Python coding sandbox.

---

## 2. Offline Android App Architecture

```text
                 SHIKSHASETU OFFLINE ANDROID APP
             (React + Vite packaged with Capacitor)
                                |
             +------------------+------------------+
             |                                     |
    OFFLINE CONTENT PACK                     LOCAL DATA RUNTIME
(frontend/public/offline-pack)              (IndexedDB / LocalStorage)
             |                                     |
   - Grades 1-3 FLN Curriculum            - Teacher Demo Profile
   - Aadi Vaani Multi-tribal Lexicon      - Lesson Progress & Mastery
   - NIPUN Worksheets (L1.1-M3.1)         - Translation Memory (Edits)
   - 48+ Bilingual Flashcards             - Offline Activity Logs
   - Classroom Dialogue Phrasebook        - Sync Queue (Reconnection)
             |                                     |
             +------------------+------------------+
                                |
                       AIRPLANE MODE READY
```

---

## 3. Building & Installing the Android APK

### 3.1 Prerequisites
- Node.js 20+
- Java JDK 17
- Android SDK (API 34+ recommended)

### 3.2 Local Build Commands
```bash
# 1. Build the Vite Web Application
cd frontend
npm install
npm run build

# 2. Synchronize Web Assets with Android Platform
npx cap sync android

# 3. Assemble the Android Debug APK
cd android
./gradlew assembleDebug

# Output APK Location:
# frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

### 3.3 Installing on a Physical Tablet / Emulator
```bash
adb install -r frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. Automated CI/CD & Shareable Download

The `offline-mode` branch includes automated GitHub Actions workflows:

1. **Automated APK Build Workflow** (`.github/workflows/build-offline-apk.yml`):
   - Automatically builds on every push to `offline-mode` and manual trigger.
   - Uploads `ShikshaSetu-offline.apk` as a workflow artifact.

2. **Automated Release Workflow** (`.github/workflows/release-offline-apk.yml`):
   - Automatically publishes a GitHub Release when a tag such as `offline-v0.1.0` is pushed.
   - Attaches `ShikshaSetu-offline.apk` as a direct download asset.

---

## 5. Airplane Mode Verification Scenario

To test the core SIH classroom scenario in airplane mode:

1. **Launch App**: Open `ShikshaSetu` on the Android tablet with Airplane Mode enabled.
2. **Profile Selection**: Tap **"Demo Teacher (Offline)"** to enter immediately without cloud authentication.
3. **FLN Lesson Studio**:
   - Select **Grade 2** $\rightarrow$ **Numeracy** $\rightarrow$ **Number Comparison (M2.1)**.
   - Select **Santali (Ol Chiki)**.
   - View dual-script lesson script (**Ol Chiki** + **Roman phonetics** + **Hindi source**).
   - Tap **"Pronounce"** to play teacher audio.
   - Tap **"Mark Taught"** to log progress.
4. **NIPUN Worksheets**:
   - Open **Worksheets** tab.
   - Select competency **M2.1** (or L1.1, L1.2).
   - Tap **"Export PDF"** to generate the bilingual worksheet offline.
5. **Flashcards**:
   - Open flashcards in the worksheet tab $\rightarrow$ flip cards to practice vocabulary.
6. **Classroom Voice**:
   - Open **Voice Engine** tab $\rightarrow$ choose a greeting or instruction $\rightarrow$ play audio.
7. **Teacher Dashboard**:
   - Open **Dashboard** tab $\rightarrow$ verify logged lesson count and mastered competency heatmap updated from local IndexedDB.
8. **Pedagogy Mentor**:
   - Open **Pedagogy Assistant** $\rightarrow$ tap **"Explain this Competency"** or **"Suggest Classroom Activity"** for instant offline pedagogical guidance.

---

## 6. Policy & Standards Compliance

- **NEP 2020**: Mother-tongue instruction in foundational learning years.
- **NIPUN Bharat Mission**: Foundational Literacy and Numeracy goals for Grade 1-3.
- **Constitution of India**: Eighth Schedule recognition of Santali (Ol Chiki script).
