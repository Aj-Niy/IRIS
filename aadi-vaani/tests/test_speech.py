import pytest
import io
import wave
import httpx
from src.router.api import app
from src.speech.tts import TextToSpeechService
from src.speech.asr import SpeechToTextService

@pytest.mark.asyncio
async def test_tts_wav_synthesis():
    tts = TextToSpeechService()
    wav_bytes, duration = await tts.synthesize_wav(text="ᱡᱚᱦᱟᱨ", language="sat")
    
    assert len(wav_bytes) > 44 # Must be larger than standard 44-byte WAV header
    assert wav_bytes[:4] == b"RIFF"
    assert wav_bytes[8:12] == b"WAVE"
    assert duration > 0.5

    # Verify wave can be parsed by standard wave module
    with wave.open(io.BytesIO(wav_bytes), "rb") as wf:
        assert wf.getnchannels() == 1
        assert wf.getsampwidth() == 2
        assert wf.getframerate() == 16000

@pytest.mark.asyncio
async def test_asr_transcription():
    asr = SpeechToTextService()
    # Create dummy wav bytes
    dummy_wav, _ = await TextToSpeechService().synthesize_wav("नमस्ते", "hin")
    
    text, conf, lat = await asr.transcribe(dummy_wav, source_lang="hin")
    assert text is not None
    assert len(text) > 0
    assert conf > 0.8
    assert lat > 0

@pytest.mark.asyncio
async def test_api_speech_synthesize():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "text": "ᱡᱚᱦᱟᱨ",
            "language": "sat",
            "gender": "female"
        }
        res = await client.post("/speech/synthesize", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "audio_base64" in data
        assert data["content_type"] == "audio/wav"
        assert data["duration_sec"] > 0

@pytest.mark.asyncio
async def test_api_speech_synthesize_stream():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/speech/synthesize/stream?text=नमस्ते&language=hin")
        assert res.status_code == 200
        assert res.headers["content-type"] == "audio/wav"
        content = res.content
        assert content[:4] == b"RIFF"

@pytest.mark.asyncio
async def test_api_speech_translate():
    tts = TextToSpeechService()
    sample_wav, _ = await tts.synthesize_wav("नमस्ते", "hin")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        files = {
            "audio_file": ("test.wav", sample_wav, "audio/wav")
        }
        data = {
            "source_lang": "hin",
            "target_lang": "sat",
            "synthesize_audio": "true"
        }
        res = await client.post("/speech/translate", data=data, files=files)
        assert res.status_code == 200
        result = res.json()
        assert "transcribed_text" in result
        assert "translated_text" in result
        assert result["target_lang"] == "sat"
        assert result["audio_base64"] is not None
        assert result["audio_content_type"] == "audio/wav"
