# Aadi Vaani (आदि वाणी) Translation Service

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **Translation Router & Multi-Backend Engine for Indian Indigenous Languages: Hindi ↔ Santali (`sat`) & Hindi ↔ Mundari (`unr`)**

---

## 1. Overview

**Aadi Vaani Translation Service** addresses the structural asymmetry in language technology for Indian tribal languages:
- **Santali (`sat`)**: Eighth Schedule language with emerging digital support. Routed dynamically through **Bhashini ULCA API** and self-hosted **IndicTrans2** (`sat_Olck`, MIT License), with fallback and caching.
- **Mundari (`unr`)**: Non-scheduled, low-resource Austroasiatic language lacking public baseline models. Handled via a transfer-learning adapter trained from North Munda (Santali) checkpoints with Tribal Research Institute and native-speaker parallel corpora.

The architecture is built on a **resilient translation router pattern**:
1. **Dynamic Priority Routing & Cascade Fallback** (Bhashini → IndicTrans2 → Custom Mundari → Local Cache).
2. **Circuit Breaking**: Prevents slow or failing backends from cascading latency.
3. **Response Caching**: Deterministic SHA-256 caching over `(source_lang, target_lang, text)`.
4. **Script Normalization**: Bidirectional conversion between Santali Ol Chiki (`sat_Olck`), Devanagari, and Latin.
5. **Human-in-the-Loop Feedback Loop**: Ingestion API for native speaker reviews and continuous dataset enrichment.

---

## 2. Directory Structure

```
aadi vaani/
├── config/
│   ├── routing_config.yaml         # Priority chains, fallback rules, timeouts
│   └── settings.py                 # Pydantic environment configuration
├── src/
│   ├── router/
│   │   ├── api.py                  # FastAPI REST endpoints (/translate, /health, /languages)
│   │   ├── engine.py               # Fallback engine, circuit breaker & cache coordinator
│   │   └── schemas.py              # Pydantic models for requests & responses
│   ├── providers/
│   │   ├── base.py                 # BaseTranslationProvider & CircuitBreaker
│   │   ├── mock.py                 # Deterministic local provider with indigenous seed vocabulary
│   │   ├── bhashini.py             # Bhashini ULCA Pipeline API adapter
│   │   ├── indictrans2.py          # IndicTrans2 self-hosted inference adapter (MIT)
│   │   ├── nllb.py                 # NLLB-200 evaluation/teacher adapter (CC-BY-NC-4.0)
│   │   └── custom_mundari.py       # Fine-tuned Mundari model adapter (Phase 4)
│   ├── cache/
│   │   ├── base.py                 # Base cache interface
│   │   ├── memory.py               # Memory TTL cache
│   │   └── redis.py                # Redis client for production
│   ├── transliteration/
│   │   └── ol_chiki.py             # Ol Chiki <-> Devanagari / Latin transliteration
│   ├── feedback/
│   │   ├── api.py                  # POST /feedback endpoint
│   │   ├── storage.py              # JSONL candidate dataset collector
│   │   └── schemas.py              # Feedback models
│   └── eval/
│       ├── metrics.py              # chrF, BLEU evaluation utilities
│       └── benchmark.py            # Automated multi-backend benchmarking
├── scripts/
│   └── phase0_discovery.py         # Verification tool for model tags & API connectivity
├── tests/                          # Full pytest test suite
├── docs/
│   └── IMPLEMENTATION_PLAN.md      # Permanent roadmap and architecture design
├── requirements.txt
└── Dockerfile
```

---

## 3. Quick Start

### 3.1 Setup Environment

```bash
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
# source .venv/bin/activate    # Linux / macOS

# Install dependencies
pip install -r requirements.txt
```

### 3.2 Run Phase 0 Verification

```bash
python scripts/phase0_discovery.py
```

### 3.3 Start Translation Router Service

```bash
uvicorn src.router.api:app --reload --port 8000
```

- Interactive OpenAPI Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)
- Language Pairs: [http://localhost:8000/languages](http://localhost:8000/languages)

---

## 4. Example API Usage

### Translate Hindi to Santali (Ol Chiki)

```bash
curl -X POST http://localhost:8000/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "नमस्ते",
    "source_lang": "hin",
    "target_lang": "sat"
  }'
```

**Response:**
```json
{
  "translated_text": "ᱡᱚᱦᱟᱨ",
  "source_lang": "hin",
  "target_lang": "sat",
  "backend_used": "mock",
  "latency_ms": 22.4,
  "cached": false,
  "confidence_score": 0.98,
  "provenance": {
    "backend": "mock",
    "model_identifier": "mock-v1.0-indigenous-seed",
    "attempted_chain": ["bhashini", "indictrans2", "mock"],
    "fallback_occurred": true
  }
}
```

### Submit Native Speaker Feedback

```bash
curl -X POST http://localhost:8000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "source_text": "नमस्ते",
    "source_lang": "hin",
    "target_lang": "sat",
    "translated_text": "ᱡᱚᱦᱟᱨ",
    "corrected_text": "ᱡᱚᱦᱟᱨ",
    "backend_used": "mock",
    "rating": 5,
    "is_accurate": true,
    "native_speaker": true
  }'
```

---

## 5. Running Tests

```bash
pytest tests/ -v
```

---

## 6. License

This repository and translation routing service is licensed under the **MIT License**.
Individual model backend weights are governed by their respective licenses:
- IndicTrans2: MIT License
- NLLB-200: CC-BY-NC-4.0 (Non-commercial / evaluation only)
