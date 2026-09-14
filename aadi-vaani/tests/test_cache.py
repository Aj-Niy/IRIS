import pytest
import asyncio
from src.cache.memory import MemoryTranslationCache
from src.router.engine import TranslationRouterEngine
from src.router.schemas import TranslationRequest

@pytest.mark.asyncio
async def test_memory_cache_set_and_get():
    cache = MemoryTranslationCache(default_ttl_seconds=5)
    await cache.set("hin", "sat", "घर", {"translated_text": "ᱚᱲᱟᱜ", "backend_used": "mock"})

    cached = await cache.get("hin", "sat", "घर")
    assert cached is not None
    assert cached["translated_text"] == "ᱚᱲᱟᱜ"
    assert cached["backend_used"] == "mock"

@pytest.mark.asyncio
async def test_memory_cache_expiration():
    cache = MemoryTranslationCache(default_ttl_seconds=1)
    await cache.set("hin", "sat", "घर", {"translated_text": "ᱚᱲᱟᱜ"}, ttl_seconds=1)

    # Immediately available
    cached = await cache.get("hin", "sat", "घर")
    assert cached is not None

    # Wait for expiration
    await asyncio.sleep(1.2)
    expired = await cache.get("hin", "sat", "घर")
    assert expired is None

@pytest.mark.asyncio
async def test_router_serves_from_cache():
    engine = TranslationRouterEngine()
    req = TranslationRequest(
        text="घर",
        source_lang="hin",
        target_lang="sat",
        preferred_backend="mock"
    )

    # First request: un-cached
    res1 = await engine.translate(req)
    assert res1.cached is False
    assert res1.translated_text == "ᱚᱲᱟᱜ"

    # Second request: served from cache
    res2 = await engine.translate(req)
    assert res2.cached is True
    assert res2.translated_text == "ᱚᱲᱟᱜ"
    assert res2.provenance.attempted_chain == ["cache"]
