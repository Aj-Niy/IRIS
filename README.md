<div align="center">

# 🌾 IRIS AI
### Inclusive Real-Time Instruction System (PALASH × CodeSeekho)
**Teacher-first mother-tongue FLN instruction support with embedded coding for inclusive education.**

*Grounded in NEP 2020 & NIPUN Bharat, powered by Apertium English-Santali, Ol Chiki dual-script engine, and offline tablet intelligence.*

</div>

---

## 📖 Overview

**IRIS** is a unified education intelligence platform designed around a **teacher-first front door**. It empowers primary school teachers in Hindi/English-medium tribal and rural schools to instruct Santali-speaking children in **Foundational Literacy and Numeracy (FLN)** using native **Ol Chiki (`ᱚᱞ ᱪᱤᱠᱤ`)** script, Roman transliterations, and audio pronunciation guides.

The platform unifies two major use cases under one general-purpose **Universal AI Tutor Engine**:
1. **Primary Focus (Front Door)**: Teacher-first Mother-Tongue FLN instruction (Santali MVP), NIPUN Bharat grounded worksheet & flashcard generation, and real-time offline voice phrasebooks.
2. **Secondary Module (Embedded)**: Project-based interactive coding lab (Smart Calculator, Quiz App, Monaco sandbox) with cross-platform Indian Sign Language (ISL) video accessibility for Class 8+ students.

---

## 🎯 The Four Core Pillars of IRIS

| Module | Purpose & Pedagogy | Key Capabilities |
|---|---|---|
| 🏫 **Santali FLN Studio** | Primary classroom instruction bridge for Hindi/English teachers | Dual-script reader (**Ol Chiki `ᱚᱞ ᱪᱤᱠᱤ`** + Roman), Apertium linguistic glossing, NCERT primary stories, audio pronunciation |
| 📝 **NIPUN Bharat Worksheets** | Competency-grounded practice material | Mapped to official NIPUN outcome codes (L1–L5, M1–M5), interactive flip flashcards, printable PDF export via jsPDF |
| 🎙️ **Live Classroom Phrasebook** | Real-time voice assistance in classroom | 50+ bounded phrases ("sit down", "open books", "count to 5"), Web Speech recognition, 100% offline tablet operation |
| 💻 **Embedded Coding Lab** | Inclusive STEM education for Class 8+ | Monaco code editor, Python/JS sandbox, Socratic AI coding mentor, ISL sign video clips |

---

## 🏗️ Architecture & Tech Stack

```
Teacher Tablet (2GB RAM Offline Cache / React Web)
       │
       ├──► 1. Santali FLN Studio ──► Apertium eng-sat Lexicon + Ol Chiki Parser
       ├──► 2. NIPUN Worksheets   ──► Competency Generator + jsPDF Printable Engine
       ├──► 3. Voice Phrasebook   ──► Bounded 50+ Phrases + Speech Synthesis
       ├──► 4. Coding Module      ──► Monaco Sandbox + Socratic Tutor + ISL Clips
       │
       ▼
Local Cache (LocalStorage / IndexedDB) ──► Offline Sync Queue
       │ (when reconnected)
       ▼
IRIS Express Backend (/api/iris/tutor, /api/iris/translate, /api/iris/sync-progress)
       ├──► Supabase (fln_lessons, worksheets, classroom_logs, videos)
       ├──► Apertium eng-sat Linguistic Bank
       └──► Google Gemini 1.5/2.0 Flash (Curriculum Grounding)
```

---

## 🚀 Getting Started

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to launch the IRIS Teacher-First Studio.

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
Runs the Express API on `http://localhost:3001` with `/api/iris/*` routes.

---

## 🤝 Project Alignment & References
- **Apertium English-Santali Integration**: [apertium-eng-sat](https://github.com/apertium/apertium-eng-sat)
- **NIPUN Bharat Guidelines**: Ministry of Education, Govt. of India (Foundational Literacy & Numeracy Lakshyas)
- **NEP 2020**: Mother-tongue instruction & multi-disciplinary inclusive learning