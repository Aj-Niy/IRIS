import time
import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Response
from typing import Optional

from src.speech.schemas import (
    AudioTranslationResponse,
    SpeechSynthesisRequest,
    SpeechSynthesisResponse,
    TranscriptionResponse
)
from src.speech.asr import SpeechToTextService
from src.speech.tts import TextToSpeechService
from src.router.schemas import TranslationRequest
from src.router.engine import TranslationRouterEngine

router = APIRouter(prefix="/speech", tags=["Speech Translation (Audio)"])

asr_service = SpeechToTextService()
tts_service = TextToSpeechService()

# Reference to the shared router engine
_engine: Optional[TranslationRouterEngine] = None

def get_engine() -> TranslationRouterEngine:
    global _engine
    if _engine is None:
        _engine = TranslationRouterEngine()
    return _engine

def set_engine(engine: TranslationRouterEngine):
    global _engine
    _engine = engine

@router.post("/translate", response_model=AudioTranslationResponse)
async def translate_speech(
    audio_file: UploadFile = File(..., description="Audio file to translate (.wav, .mp3, .webm, .ogg)"),
    source_lang: str = Form("hin", description="Source spoken language (e.g. hin, sat)"),
    target_lang: str = Form("sat", description="Target translated language (e.g. sat, unr, hin)"),
    synthesize_audio: bool = Form(True, description="Whether to generate synthesized audio for the translated output")
):
    """
    Multimodal End-to-End Audio Translation:
    1. Transcribes incoming audio speech (Speech-to-Text).
    2. Translates transcribed text into target language using the Translation Router.
    3. Synthesizes translated speech into playable WAV audio (Text-to-Speech).
    """
    start_time = time.perf_counter()
    try:
        audio_bytes = await audio_file.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Uploaded audio file is empty")

        # Step 1: Speech-to-Text (ASR)
        transcribed_text, asr_conf, asr_latency = await asr_service.transcribe(
            audio_bytes=audio_bytes,
            source_lang=source_lang,
            filename=audio_file.filename
        )

        # Step 2: Machine Translation via Router
        engine = get_engine()
        trans_req = TranslationRequest(
            text=transcribed_text,
            source_lang=source_lang,
            target_lang=target_lang,
            allow_fallback=True
        )
        trans_res = await engine.translate(trans_req)

        # Step 3: Text-to-Speech (TTS) for translated output
        audio_b64 = None
        if synthesize_audio:
            wav_bytes, _ = await tts_service.synthesize_wav(
                text=trans_res.translated_text,
                language=target_lang
            )
            audio_b64 = base64.b64encode(wav_bytes).decode("utf-8")

        total_latency = (time.perf_counter() - start_time) * 1000.0

        return AudioTranslationResponse(
            transcribed_text=transcribed_text,
            translated_text=trans_res.translated_text,
            source_lang=source_lang,
            target_lang=target_lang,
            audio_base64=audio_b64,
            audio_content_type="audio/wav",
            backend_used=trans_res.backend_used,
            latency_ms=round(total_latency, 2),
            disclaimer=trans_res.disclaimer
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio translation failed: {str(e)}")

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    language: str = Form("hin")
):
    """Transcribes an audio speech clip into text."""
    try:
        audio_bytes = await audio_file.read()
        text, conf, lat = await asr_service.transcribe(audio_bytes, language, audio_file.filename)
        return TranscriptionResponse(
            text=text,
            language=language,
            confidence=conf,
            latency_ms=lat
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@router.post("/synthesize", response_model=SpeechSynthesisResponse)
async def synthesize_speech(req: SpeechSynthesisRequest):
    """Synthesizes text into speech and returns base64 encoded WAV audio."""
    try:
        wav_bytes, dur = await tts_service.synthesize_wav(
            text=req.text,
            language=req.language,
            gender=req.gender or "female"
        )
        audio_b64 = base64.b64encode(wav_bytes).decode("utf-8")
        return SpeechSynthesisResponse(
            audio_base64=audio_b64,
            content_type="audio/wav",
            duration_sec=dur,
            language=req.language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")

@router.get("/synthesize/stream")
async def stream_synthesized_speech(
    text: str = Query(..., description="Text to speak"),
    language: str = Query("sat", description="Language code"),
    gender: str = Query("female", description="Voice gender")
):
    """Returns raw binary audio/wav for direct playback in HTML <audio> tags."""
    try:
        wav_bytes, _ = await tts_service.synthesize_wav(text=text, language=language, gender=gender)
        return Response(content=wav_bytes, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Streaming audio synthesis failed: {str(e)}")
