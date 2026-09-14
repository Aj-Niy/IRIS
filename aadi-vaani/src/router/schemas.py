from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Source text to translate")
    source_lang: str = Field(..., min_length=2, max_length=10, description="ISO code of source language (e.g., hin, sat, unr)")
    target_lang: str = Field(..., min_length=2, max_length=10, description="ISO code of target language (e.g., sat, hin, unr)")
    script_preference: Optional[str] = Field(
        default=None,
        description="Target script preference: 'ol_chiki', 'devanagari', 'latin', or null for default"
    )
    allow_fallback: bool = Field(
        default=True,
        description="Whether to automatically cascade to fallback backends on error"
    )
    preferred_backend: Optional[str] = Field(
        default=None,
        description="Override routing order to prefer a specific backend (e.g., bhashini, indictrans2, mock)"
    )

class ProvenanceInfo(BaseModel):
    backend: str
    model_identifier: Optional[str] = None
    attempted_chain: List[str] = Field(default_factory=list)
    fallback_occurred: bool = False
    details: Dict[str, Any] = Field(default_factory=dict)

class TranslationResponse(BaseModel):
    translated_text: str
    source_lang: str
    target_lang: str
    backend_used: str
    latency_ms: float
    cached: bool = False
    confidence_score: Optional[float] = None
    provenance: ProvenanceInfo
    disclaimer: Optional[str] = None

class BatchTranslationRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=100)
    source_lang: str
    target_lang: str
    script_preference: Optional[str] = None
    allow_fallback: bool = True

class BatchTranslationResponse(BaseModel):
    translations: List[TranslationResponse]
    total_latency_ms: float

class LanguagePairStatus(BaseModel):
    source_lang: str
    target_lang: str
    primary_backend: str
    available_backends: List[str]
    status: str # "production", "beta", "in_development"
    description: str

class SupportedLanguagesResponse(BaseModel):
    pairs: List[LanguagePairStatus]
