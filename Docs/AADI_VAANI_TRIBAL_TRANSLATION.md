# 🌾 Aadi Vaani (आदि वाणी): Tribal Voice & Text Translation Module for IRIS

## 1. Executive Summary & Context
**Aadi Vaani** is an indigenous linguistic translation and voice bridge integrated into the **IRIS (Inclusive Real-Time Instruction System)** ecosystem. Aligned with **NEP 2020** and **NIPUN Bharat** foundational literacy in the mother tongue, this module connects Hindi and English instruction to three major Austroasiatic tribal languages of Eastern/Central India:
- **Santali (`sat`)**: Dual-script support for authentic **Ol Chiki (`ᱚᱞ ᱪᱤᱠᱤ`)** and Devanagari.
- **Mundari (`unr`)**: Devanagari representation for Jharkhand tribal education.
- **Ho (`hoc`)**: Dual-script support for indigenous **Warang Citi (`𑢹𑣉𑣉 𑢱𑣁𑣋𑣁𑣜`)** and Devanagari.

---

## 2. Directory Structure inside IRIS
```
iris/
├── Docs/
│   ├── AADI_VAANI_TRIBAL_TRANSLATION.md   <-- Detailed architectural & API docs
│   └── WorkFlow.docx
├── aadi-vaani/                            <-- Isolated tribal translation service
│   ├── new_index.py                       <-- Python service entrypoint
│   ├── new_index.js                       <-- Node.js / Express adapter client
│   ├── config/
│   │   ├── routing_config.yaml            <-- Fallback cascade & routing matrix
│   │   └── settings.py                    <-- App configuration & env variables
│   ├── data/
│   │   ├── corpora/                       <-- Formatted JSONL/TSV fine-tuning datasets
│   │   │   ├── hin_sat_train.jsonl
│   │   │   ├── hin_unr_train.jsonl
│   │   │   ├── hin_hoc_train.jsonl
│   │   │   └── indigenous_tribal_multilingual_train.jsonl
│   │   └── download_tribal_datasets.py    <-- Automated online dataset acquisition
│   ├── src/
│   │   ├── router/
│   │   │   ├── api.py                     <-- FastAPI REST endpoints
│   │   │   ├── engine.py                  <-- Circuit breaker & fallback router
│   │   │   ├── schemas.py                 <-- Pydantic schemas
│   │   │   └── web_ui.py                  <-- Interactive responsive translation portal
│   │   ├── providers/
│   │   │   ├── base.py                    <-- Circuit breaker & provider interfaces
│   │   │   ├── mock.py                    <-- Local bilingual & multi-script lexicon
│   │   │   ├── bhashini.py                <-- Bhashini ULCA pipeline integration
│   │   │   ├── indictrans2.py             <-- AI4Bharat IndicTrans2 integration
│   │   │   ├── custom_mundari.py          <-- Fine-tuned Mundari model integration
│   │   │   └── nllb.py                    <-- Meta NLLB-200 distillation service
│   │   ├── transliteration/
│   │   │   ├── ol_chiki.py                <-- Devanagari <-> Ol Chiki engine (U+1C50-1C7F)
│   │   │   └── warang_citi.py             <-- Devanagari <-> Warang Citi (U+118A0-118FF)
│   │   ├── speech/
│   │   │   ├── asr.py                     <-- Speech-to-Text audio transcription
│   │   │   └── tts.py                     <-- Syllabic audio synthesis (WAV output)
│   │   └── cache/
│   │       ├── base.py / memory.py / redis.py <-- Multi-script isolated cache
│   │       └── tests/
│   ├── requirements.txt
│   └── pytest.ini
└── index.js                               <-- Root IRIS entrypoint (untouched)
```

---

## 3. Key Capabilities & Architectural Highlights

### A. Dual-Script Transliteration Engines
- **Ol Chiki Engine (`src/transliteration/ol_chiki.py`)**:
  - Full mapping of Unicode Ol Chiki (`U+1C50`–`U+1C7F`).
  - Converts text between Devanagari, Latin, and Ol Chiki scripts with vowel diacritics (**ᱚ, ᱛ, ᱜ, ᱝ, ᱞ, ᱟ, ᱠ, ᱡ, ᱢ, ᱣ, ᱤ, ᱥ, ᱦ, ᱧ, ᱨ, ᱩ, ᱪ, ᱫ, ᱬ, ᱭ, ᱮ, ᱯ, ᱰ, ᱱ, ᱲ, ᱳ, ᱴ, ᱵ, ᱶ, ᱷ**).
- **Warang Citi Engine (`src/transliteration/warang_citi.py`)**:
  - Full mapping of Unicode SMP Warang Citi block (`U+118A0`–`U+118FF`).
  - Supports phonetic bidirectional transliteration for Ho between Devanagari and native Warang Citi (`𑢹𑣉𑣉 𑢱𑣁𑣋𑣁𑣜`).

### B. Cascading Routing & Circuit Breakers
- **Provider Chain Priority**:
  - `hin:sat` / `sat:hin`: Bhashini ULCA -> IndicTrans2 -> NLLB-200 -> Local Indigenous Lexicon
  - `hin:unr` / `unr:hin`: Custom Mundari -> Local Indigenous Lexicon
  - `hin:hoc` / `hoc:hin`: Local Indigenous Lexicon (Devanagari & Warang Citi)
  - `same-language` (`hin:hin`, `sat:sat`, `hoc:hoc`): Native script transliteration / Latin bridging.
- **Fail-Safe Circuit Breaker**: Automatically bypasses failing remote upstream backends after 3 timeouts, recovering without dropping teacher requests.

### C. Multi-Script Cache Isolation
- Cache keys incorporate `SHA-256(src_lang + tgt_lang + script_preference + text)`.
- Guarantees that `"hello"` translated to Ho in Devanagari (`जोहार`) does not overwrite or collide with Ho in Warang Citi (`𑢮𑢩𑢹𑢡𑢼`).

### D. Audio STT & TTS Engine
- **ASR (Speech-to-Text)**: Accepts live mic audio (`audio/wav`) or uploaded files, transcribes via dual speech recognition with Hindi/English fallback.
- **TTS (Text-to-Speech)**: Synthesizes indigenous phonemes into 16kHz PCM WAV audio with real-time browser streaming playback (`/speech/synthesize/stream`).

---

## 4. REST API Reference

### 1. Translation: `POST /translate`
**Request:**
```json
{
  "text": "hello",
  "source_lang": "hin",
  "target_lang": "hoc",
  "script_preference": "warang_citi",
  "allow_fallback": true
}
```
**Response:**
```json
{
  "translated_text": "𑢮𑢩𑢹𑢡𑢼",
  "source_lang": "hin",
  "target_lang": "hoc",
  "backend_used": "mock",
  "latency_ms": 20.4,
  "confidence_score": 0.98,
  "cached": false,
  "disclaimer": "Ho translation is in early beta; native speaker review recommended."
}
```

### 2. Speech-to-Speech: `POST /speech/translate`
Accepts `multipart/form-data` with `audio_file`, transcribes input voice, translates to target tribal language, and synthesizes target audio stream in Base64 WAV.

### 3. Audio Streaming: `GET /speech/synthesize/stream`
Stream synthesized speech audio directly in `audio/wav` format.
Query params: `text=...&language=hoc`

### 4. Health Check: `GET /health`
Returns live status of all upstream backends (Bhashini, IndicTrans2, Custom Mundari, Mock) and active cache backend.

---

## 5. Online Datasets for Model Training

The `data/download_tribal_datasets.py` pipeline aggregates data from Hugging Face, GitHub, and LDC-IL:
- **Santali**: `aiswarya9302/santali-backtranslated-corpus`, `XKaab/ASR-santali_100hrs`, `Murmu722/santali_corpus_unified_v2`.
- **Mundari**: `Nightmare-22/AI-Translator-Tool-for-Tribal-Languages`, `KAABSHAHID/AdiDhwani`.
- **Ho**: `HARSHAVARTHAN-KS/SIH`, `ayushp-com/bhasa-setu2.0`, `CIIL LDC-IL Ho Corpus`.

---

## 6. How to Run Locally

### Start Python Translation Router:
```bash
cd aadi-vaani
python new_index.py
```
Or with virtual environment:
```bash
.\.venv\Scripts\python.exe new_index.py
```
Open **`http://localhost:8000/`** to interact with the web translation portal.

### Run Verification Test Suite:
```bash
pytest -v
```
All **35 test cases** cover API endpoints, transliteration, router fallbacks, circuit breakers, cache segregation, and audio speech pipelines.
