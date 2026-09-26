# ShikshaSetu (शिक्षासेतु)

### Mother-Tongue First Foundational Literacy & Numeracy (FLN) and Inclusive Multimodal Learning Platform

**ShikshaSetu** is an offline-ready, teacher-first educational platform designed to bridge the language divide in primary and secondary classrooms across tribal and rural regions. Grounded in **NEP 2020** and the **NIPUN Bharat Mission** (Jharkhand MTB-MLE, Problem Statement 26042), the platform empowers Hindi-medium teachers to instruct children in their native mother tongues: **Santali (`sat` / Ol Chiki `ᱚᱞ ᱪᱤᱠᱤ`)**, **Ho (`hoc` / Warang Citi)**, and **Mundari (`unr`)**.

---

## 1. Key System Modules

### 1.1 FLN Lesson Studio
- Translates Hindi classroom passages into authentic tribal languages with dual-script rendering (**Ol Chiki `ᱚᱞ ᱪᱤᱠᱤ`** and phonetic Romanization).
- Provides word-by-word linguistic glossing, vocabulary breakdowns, and audio playback guides for teachers.
- Covers Grade 1 to 3 primary NCERT and JCERT curriculum stories.

### 1.2 Classroom Voice Engine
- Two-way real-time classroom speech translation between Hindi and indigenous languages.
- Powered by the **Aadi Vaani** translation router and client-side phonetic engine with under 1.5s real-time latency.
- Full support for classroom commands, affirmations, numeracy, and student response translation.

### 1.3 Live ISL Gesture AI Recognizer
- Real-time webcam hand-gesture recognition tailored for inclusive and deaf-accessible classrooms.
- Utilizes MediaPipe 126-keypoint hand landmark extraction and a trained LSTM temporal sequence model.
- Automatically translates recognized Indian Sign Language (ISL) gestures into tribal Ol Chiki script, Roman pronunciation, and Hindi meanings.

### 1.4 AI Avatar Video Generation Studio
- Converts study notes, PPTs, and PDFs into 3 to 5-minute animated video lessons with Indian accent voice narration.
- Features multi-scene pedagogical progression (Intro, Concept, Animated Flowcharts, Live Code Sandbox, and Summary Index).
- Includes one-click generation of Lesson Summaries, interactive 3D Flip Flashcards, and printable NIPUN worksheets.

### 1.5 NIPUN Bharat Worksheets & Flashcards
- Competency-aligned practice material mapped directly to NIPUN Bharat learning outcomes (L1-L5 Literacy, M1-M5 Numeracy).
- Dual-script print sheets with instant PDF export via `jsPDF` for resource-constrained schools.

### 1.6 NCERT Curriculum Hub & Socratic AI Mentor
- Digital textbook and curriculum browser across Science, Mathematics, and Computer Science (Classes 6-12).
- Socratic AI teaching assistant providing culturally grounded pedagogic suggestions and interactive coding sandboxes.

### 1.7 Offline-First Tablet Architecture
- Fully functional on low-resource school tablets ($\le$ 2GB RAM) without active internet connectivity.
- Local interactions and analytics are stored via IndexedDB and synchronized automatically when network access is restored.

---

## 2. Directory Structure

```
IRIS / ShikshaSetu
├── frontend/                     # React + Vite Single-Page Application
│   ├── src/
│   │   ├── components/           # UI Modules (VideoStudio, LivePhrasebook, etc.)
│   │   ├── services/             # Aadi Vaani client, API bridges, offline sync
│   │   └── styles/               # CSS styling and design system
│   └── public/                   # Static assets, branding logo, and audio files
├── aadi-vaani/                   # Indigenous Translation Service (FastAPI + Python)
│   ├── src/router/               # Multi-backend fallback routing & caching
│   ├── src/transliteration/      # Ol Chiki and Warang Citi phonetic converters
│   └── src/providers/            # Bhashini, IndicTrans2, and custom lexicon adapters
├── gestures/                     # Real-Time Gesture Inference Service
│   ├── gesture_api.py            # Local HTTP bridge on port 5005
│   ├── isl_model_lstm.h5         # Trained 126-landmark LSTM sequence classifier
│   └── predict_live_lstm.py      # Native desktop MediaPipe test harness
├── backend-v3/                   # AI Avatar Video Generation Engine
│   ├── server.js                 # Express orchestration server (port 3002)
│   ├── llmRotation.js            # Gemini -> Groq -> Cerebras auto-fallback
│   └── voiceGenerator.js         # Indian accent voice synthesis
├── src/                          # Remotion Video Compositions & Scenes
│   ├── scenes/                   # Visual, Code, Flowchart, and Index scenes
│   └── components/               # Animated Teacher Avatar and PiP components
└── README.md                     # Main documentation
```

---

## 3. Quick Start Guide

### 3.1 Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173` (or `http://localhost:3000`).

### 3.2 Video Generation Studio Backend
```bash
cd backend-v3
npm install
node server.js
```
The video generation engine runs on `http://localhost:3002`.

### 3.3 Aadi Vaani Translation Router
```bash
cd aadi-vaani
pip install -r requirements.txt
uvicorn src.router.api:app --reload --port 8000
```
Interactive API documentation is available at `http://localhost:8000/docs`.

### 3.4 Live Gesture AI Service
```bash
cd gestures
pip install tensorflow opencv-python mediapipe
python gesture_api.py
```
The gesture API server listens on `http://localhost:5005`.

---

## 4. Policy & Pedagogical Standards

- **National Education Policy (NEP 2020)**: Primary education delivery in the child's home language / mother tongue.
- **NIPUN Bharat Mission**: National Initiative for Proficiency in Reading with Understanding and Numeracy.
- **Constitution of India**: Eighth Schedule recognition of the Santali language and Ol Chiki script.
