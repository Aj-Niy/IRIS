import pytest
import httpx
from src.router.api import app

@pytest.mark.asyncio
async def test_api_root():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/")
        assert res.status_code == 200
        assert "Aadi Vaani" in res.text
        assert "text/html" in res.headers["content-type"]

@pytest.mark.asyncio
async def test_api_info():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/info")
        assert res.status_code == 200
        data = res.json()
        assert "Aadi Vaani Translation Router" in data["service"]

@pytest.mark.asyncio
async def test_api_health():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "mock" in data["providers"]
        assert "bhashini" in data["providers"]
        assert "indictrans2" in data["providers"]

@pytest.mark.asyncio
async def test_api_languages():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/languages")
        assert res.status_code == 200
        data = res.json()
        assert "pairs" in data
        pairs = [(p["source_lang"], p["target_lang"]) for p in data["pairs"]]
        assert ("hin", "sat") in pairs
        assert ("hin", "unr") in pairs

@pytest.mark.asyncio
async def test_api_translate_hindi_to_santali():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "text": "नमस्ते",
            "source_lang": "hin",
            "target_lang": "sat",
            "preferred_backend": "mock"
        }
        res = await client.post("/translate", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["translated_text"] == "ᱡᱚᱦᱟᱨ"
        assert data["backend_used"] == "mock"
        assert data["cached"] is False

@pytest.mark.asyncio
async def test_api_feedback_submission():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "source_text": "नमस्ते",
            "source_lang": "hin",
            "target_lang": "sat",
            "translated_text": "ᱡᱚᱦᱟᱨ",
            "corrected_text": "ᱡᱚᱦᱟᱨ",
            "backend_used": "mock",
            "rating": 5,
            "is_accurate": True,
            "comment": "Accurate greeting in Ol Chiki",
            "native_speaker": True
        }
        res = await client.post("/feedback", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert "feedback_id" in data
