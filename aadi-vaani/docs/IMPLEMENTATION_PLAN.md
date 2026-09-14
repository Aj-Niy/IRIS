# Implementation Plan: Hindi ↔ Santali / Mundari Translation Feature

## 0. Document Scope and How to Use This Plan

This plan is intentionally structured, not padded. Each section is written to be immediately actionable by an engineering team. Where a section says "expand on request," that means the section is deliberately kept concise here and can be grown into a much deeper sub-document if your team needs it — for example, the Mundari data-collection section could become its own 20-page annexure once you've chosen a data partner.

---

## 1. Executive Summary

The goal is to add Hindi (and optionally English) ↔ Santali and Hindi ↔ Mundari translation to the project. No single existing system — not Bhashini, not AI4Bharat's IndicTrans2, not Meta's NLLB-200 — fully and reliably covers both target languages today:

- **Santali** is a scheduled Indian language (ISO `sat`) with growing digital resources. It is confirmed supported in IndicTrans2 (`sat_Olck`), Bhashini, and NLLB-200.
- **Mundari** (ISO `unr`) is not a scheduled language, has minimal digital text corpus, and is not confirmed in any of the three major systems above. Government precedent (Adi Vaani) shows the only workable path was to build a custom parallel corpus with a Tribal Research Institute and fine-tune from there.

Given this asymmetry, the plan treats Santali as an **integration problem** (wire up and evaluate existing services) and Mundari as a **data and modeling problem** (build a low-resource NMT pipeline from scratch, following the precedent set by the IIIT-Hyderabad/Adi Vaani team).

The recommended architecture is a **translation router service** that tries multiple backends in priority order with automatic fallback, rather than committing to one vendor or model.

---

## 2. Goals and Non-Goals

### 2.1 Goals
- Provide Hindi→Santali, Santali→Hindi translation at production quality within the first delivery milestone.
- Provide Hindi→Mundari, Mundari→Hindi translation at a usable (not necessarily production) quality by project end, with a clear roadmap to improve it post-launch.
- Build the system so that adding more target languages later (Bhili, Gondi, Ho, Kui, Garo) requires no architectural change — only new backend adapters or fine-tuned checkpoints.
- Keep licensing clean enough that the feature can ship commercially if that becomes a requirement later, even if the current use case is non-commercial.
- Establish an evaluation and monitoring loop so translation quality is measured continuously, not just at launch.

### 2.2 Non-Goals (for this phase)
- Building a from-scratch large language model. This plan uses transfer learning and fine-tuning of existing open models, not pretraining.
- Real-time simultaneous speech interpretation (speech-to-speech with sub-second latency). Speech support here is turn-based (record → transcribe → translate → synthesize), not live simultaneous interpretation.
- Full linguistic documentation or academic corpus publication. Data collection is scoped to what is needed for model training, not comprehensive language documentation.
- Replacing or competing with Adi Vaani. Where possible, the plan treats Adi Vaani as a benchmark and potential future partner/data source, not a target to displace.

---

## 3. Background Summary

- **Adi Vaani**: Beta-launched September 2025 by the Ministry of Tribal Affairs, built by a consortium led by IIT Delhi with BITS Pilani, IIIT Hyderabad, IIIT Naya Raipur, and state Tribal Research Institutes. Supports Santali, Bhili, Mundari, Gondi in beta, with Kui and Garo planned. Closed platform.
- **Bhashini**: Government of India's national language AI mission. Exposes a public API following the ULCA pattern. Broad coverage for 22 scheduled languages; Santali is supported, Mundari is not in standard public pipelines.
- **AI4Bharat / IndicTrans2**: Open NMT system out of IIT Madras, covering 22 scheduled Indian languages with published weights on HuggingFace under the MIT License. Supports `sat_Olck`. Launchpad for Mundari transfer learning.
- **NLLB-200 (Meta)**: Open-source (CC-BY-NC-4.0), covers 200+ languages including `sat_Olck`. Non-commercial eval/teacher model.

---

## 4. System Architecture

```
                     ┌────────────────────────┐
   Client (app/web) →│ Translation Router API │
                     └───────────┬────────────┘
                                 │
              ┌──────────────────┼───────────────────┐
              ▼                  ▼                    ▼
     ┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐
     │ Bhashini adapter │ │ IndicTrans2       │ │ NLLB-200          │
     │ (hosted API)     │ │ adapter (self-    │ │ adapter (self-    │
     │                  │ │ hosted inference) │ │ hosted, eval-only)│
     └─────────────────┘ └──────────────────┘ └──────────────────┘
              │                  │                    │
              └──────────┬───────┴──────────┬─────────┘
                         ▼                   ▼
                ┌─────────────────┐  ┌────────────────────┐
                │ Result cache     │  │ Custom fine-tuned   │
                │ (Redis/Memory)   │  │ Mundari model        │
                └─────────────────┘  │ (self-hosted, Phase 4)│
                                     └────────────────────┘
```

---

## 5. Phased Delivery Roadmap

- **Phase 0 — Discovery and Verification**: Verify language tags, Bhashini ULCA endpoints, and license constraints.
- **Phase 1 — Bhashini Integration & Core Router**: Fast path to Hindi ↔ Santali via hosted ULCA API with caching and fallback.
- **Phase 2 — IndicTrans2 Self-Hosted Fallback**: Self-hosted MIT-licensed container fallback for Santali and baseline for Mundari.
- **Phase 3 — NLLB-200 Evaluation Track**: Non-commercial distillation teacher and benchmark.
- **Phase 4 — Mundari Data Collection & Fine-Tuning**: Parallel corpus curation (TRI/native speakers) and transfer-learning fine-tuning from Santali checkpoint.
- **Phase 5 — Speech & OCR Extensions**: Audio transcription, TTS synthesis, Ol Chiki OCR.
- **Phase 6 — Production Hardening & Monitoring**: Latency monitoring, circuit breakers, load testing.
- **Phase 7 — Continuous Active Learning**: Capturing user feedback for retraining iterations.
