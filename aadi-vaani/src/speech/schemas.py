from typing import Optional
from pydantic import BaseModel, Field

class AudioTranslationResponse(BaseModel):
    transcribed_text: str = Field(..., description="Text transcribed from input speech")
    translated_text: str = Field(..., description="Machine translated target text")
    source_lang: str
    target_lang: str
    audio_base64: Optional[str] = Field(default=None, description="Base64 encoded WAV audio of translated text")
    audio_content_type: str = "audio/wav"
    backend_used: str
    latency_ms: float
    disclaimer: Optional[str] = None

class SpeechSynthesisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to synthesize into speech")
    language: str = Field(default="sat", description="Language code (sat, unr, hin)")
    gender: Optional[str] = Field(default="female", description="Voice gender: female or male")

class SpeechSynthesisResponse(BaseModel):
    audio_base64: str = Field(..., description="Base64 encoded audio payload")
    content_type: str = "audio/wav"
    duration_sec: float
    language: str

class TranscriptionResponse(BaseModel):
    text: str = Field(..., description="Transcribed text from speech")
    language: str
    confidence: float
    latency_ms: float
