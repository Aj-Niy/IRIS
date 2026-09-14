import time
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from src.router.schemas import (
    TranslationRequest,
    TranslationResponse,
    BatchTranslationRequest,
    BatchTranslationResponse,
    SupportedLanguagesResponse
)
from src.router.engine import TranslationRouterEngine
from src.feedback.api import router as feedback_router
from config.settings import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Translation Router & Multi-Backend Engine for Indian Indigenous Languages: "
        "Hindi ↔ Santali (ISO 'sat') and Hindi ↔ Mundari (ISO 'unr')."
    )
)

# CORS middleware for web frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global engine singleton
engine = TranslationRouterEngine()

from fastapi.responses import HTMLResponse
from src.router.web_ui import WEB_UI_HTML
from src.speech.api import router as speech_router, set_engine as set_speech_engine

# Set shared engine for speech pipeline
set_speech_engine(engine)

# Include subrouters
app.include_router(feedback_router)
app.include_router(speech_router)

@app.get("/", response_class=HTMLResponse, tags=["Web UI"])
async def root():
    """Serves the interactive Aadi Vaani web portal for translation testing."""
    return HTMLResponse(content=WEB_UI_HTML)

@app.get("/info", tags=["Root"])
async def service_info():
    """Returns service metadata and documentation URLs."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "supported_languages_url": "/languages"
    }

@app.get("/health", tags=["Monitoring"])
async def health_check():
    """
    Returns the operational status of all backend adapters and their circuit breakers.
    """
    provider_status = {}
    for name, provider in engine.providers.items():
        provider_status[name] = {
            "enabled": provider.enabled,
            "type": provider.provider_type,
            "circuit_state": provider.circuit_breaker.state,
            "failure_count": provider.circuit_breaker.failure_count,
            "healthy": await provider.is_healthy()
        }

    return {
        "status": "healthy",
        "timestamp": time.time(),
        "cache_backend": engine.cache.__class__.__name__,
        "providers": provider_status
    }

@app.get("/languages", response_model=SupportedLanguagesResponse, tags=["Languages"])
async def list_languages():
    """
    Returns all supported language pairs, primary providers, and development stage status.
    """
    pairs = engine.get_supported_pairs()
    return SupportedLanguagesResponse(pairs=pairs)

@app.post("/translate", response_model=TranslationResponse, tags=["Translation"])
async def translate_text(request: TranslationRequest):
    """
    Translates text between Hindi, Santali, and Mundari with automated fallback and caching.
    """
    try:
        response = await engine.translate(request)
        return response
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/translate/batch", response_model=BatchTranslationResponse, tags=["Translation"])
async def batch_translate(request: BatchTranslationRequest):
    """
    Translates a list of sentences between supported language pairs.
    """
    start = time.perf_counter()
    translations = []

    for text in request.texts:
        single_req = TranslationRequest(
            text=text,
            source_lang=request.source_lang,
            target_lang=request.target_lang,
            script_preference=request.script_preference,
            allow_fallback=request.allow_fallback
        )
        try:
            res = await engine.translate(single_req)
            translations.append(res)
        except Exception as e:
            # Fallback error response for item
            raise HTTPException(status_code=500, detail=f"Batch translation error on item: {str(e)}")

    total_latency = (time.perf_counter() - start) * 1000.0
    return BatchTranslationResponse(
        translations=translations,
        total_latency_ms=round(total_latency, 2)
    )

@app.post("/cache/clear", tags=["Cache"])
async def clear_cache():
    """
    Clears all cached translation results.
    """
    await engine.cache.clear()
    return {"status": "success", "message": "Translation cache cleared successfully"}

