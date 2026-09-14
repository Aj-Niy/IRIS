import pytest
import asyncio
from src.router.engine import TranslationRouterEngine
from src.router.schemas import TranslationRequest
from src.providers.base import BaseTranslationProvider, ProviderResult

class FailingProvider(BaseTranslationProvider):
    def __init__(self, name="failing"):
        super().__init__(name=name, provider_type="mock_fail", enabled=True)

    def supports_pair(self, source_lang: str, target_lang: str) -> bool:
        return True

    async def translate(self, text: str, source_lang: str, target_lang: str, **kwargs) -> ProviderResult:
        self.circuit_breaker.record_failure()
        raise RuntimeError("Simulated upstream network timeout")

@pytest.mark.asyncio
async def test_router_hindi_to_santali_mock():
    engine = TranslationRouterEngine()
    req = TranslationRequest(
        text="नमस्ते",
        source_lang="hin",
        target_lang="sat",
        allow_fallback=True,
        preferred_backend="mock"
    )
    res = await engine.translate(req)
    assert res.translated_text == "ᱡᱚᱦᱟᱨ"
    assert res.source_lang == "hin"
    assert res.target_lang == "sat"
    assert res.backend_used == "mock"
    assert res.cached is False

@pytest.mark.asyncio
async def test_router_hindi_to_mundari_mock():
    engine = TranslationRouterEngine()
    req = TranslationRequest(
        text="नमस्ते",
        source_lang="hin",
        target_lang="unr",
        allow_fallback=True,
        preferred_backend="mock"
    )
    res = await engine.translate(req)
    assert res.translated_text == "जोहार"
    assert res.target_lang == "unr"
    assert res.disclaimer is not None
    assert "Mundari translation is in early beta" in res.disclaimer

@pytest.mark.asyncio
async def test_router_hindi_to_ho_mock():
    engine = TranslationRouterEngine()
    req = TranslationRequest(
        text="नमस्ते",
        source_lang="hin",
        target_lang="hoc",
        allow_fallback=True,
        preferred_backend="mock"
    )
    res = await engine.translate(req)
    assert res.translated_text == "जोहार"
    assert res.target_lang == "hoc"
    assert res.disclaimer is not None
    assert "Ho translation is in early beta" in res.disclaimer

@pytest.mark.asyncio
async def test_router_hindi_to_ho_warang_citi():
    engine = TranslationRouterEngine()
    req = TranslationRequest(
        text="नमस्ते",
        source_lang="hin",
        target_lang="hoc",
        script_preference="warang_citi",
        allow_fallback=True,
        preferred_backend="mock"
    )
    res = await engine.translate(req)
    assert res.target_lang == "hoc"
    from src.transliteration.warang_citi import is_warang_citi
    assert is_warang_citi(res.translated_text) is True

@pytest.mark.asyncio
async def test_router_english_to_ho_warang_citi():
    engine = TranslationRouterEngine()
    # Test Latin "hello" with source_lang="hin" (user typed English in default Hindi mode)
    req = TranslationRequest(
        text="hello",
        source_lang="hin",
        target_lang="hoc",
        script_preference="warang_citi",
        allow_fallback=True,
        preferred_backend="mock"
    )
    res = await engine.translate(req)
    assert res.target_lang == "hoc"
    from src.transliteration.warang_citi import is_warang_citi
    assert is_warang_citi(res.translated_text) is True
    assert res.translated_text == "𑢮𑢩𑢹𑢡𑢼"

@pytest.mark.asyncio
async def test_router_english_to_santali_and_mundari():
    engine = TranslationRouterEngine()
    # English -> Santali
    req_sat = TranslationRequest(
        text="hello",
        source_lang="eng",
        target_lang="sat",
        allow_fallback=True,
        preferred_backend="mock"
    )
    res_sat = await engine.translate(req_sat)
    assert res_sat.translated_text == "ᱡᱚᱦᱟᱨ"

    # English -> Mundari
    req_unr = TranslationRequest(
        text="hello",
        source_lang="eng",
        target_lang="unr",
        allow_fallback=True,
        preferred_backend="mock"
    )
    res_unr = await engine.translate(req_unr)
    assert res_unr.translated_text == "जोहार"

@pytest.mark.asyncio
async def test_router_same_language_pair():
    engine = TranslationRouterEngine()
    # Test hin -> hin with English input
    req_en = TranslationRequest(
        text="hello",
        source_lang="hin",
        target_lang="hin",
        allow_fallback=True
    )
    res_en = await engine.translate(req_en)
    assert res_en.translated_text == "नमस्ते"
    assert res_en.backend_used == "mock"

    # Test hin -> hin with Hindi input
    req_hi = TranslationRequest(
        text="नमस्ते",
        source_lang="hin",
        target_lang="hin",
        allow_fallback=True
    )
    res_hi = await engine.translate(req_hi)
    assert res_hi.translated_text == "नमस्ते"


@pytest.mark.asyncio
async def test_router_cascading_fallback():
    engine = TranslationRouterEngine()
    # Inject a failing provider ahead of mock in the engine
    failing = FailingProvider(name="failing_service")
    engine.providers["failing_service"] = failing
    
    # Configure custom test chain with failing provider first
    engine.config["routes"]["hin:sat"]["priority"] = ["failing_service", "mock"]

    req = TranslationRequest(
        text="पानी",
        source_lang="hin",
        target_lang="sat",
        allow_fallback=True
    )
    res = await engine.translate(req)
    
    assert res.backend_used == "mock"
    assert res.translated_text == "ᱫᱟᱜ"
    assert res.provenance.fallback_occurred is True
    assert "failing_service" in res.provenance.attempted_chain
    assert "mock" in res.provenance.attempted_chain

@pytest.mark.asyncio
async def test_circuit_breaker_tripping():
    engine = TranslationRouterEngine()
    failing = FailingProvider(name="flakey")
    engine.providers["flakey"] = failing

    assert failing.circuit_breaker.state == "CLOSED"
    
    # Cause 3 failures (threshold)
    for _ in range(3):
        try:
            await failing.translate("text", "hin", "sat")
        except RuntimeError:
            pass

    assert failing.circuit_breaker.state == "OPEN"
    assert failing.circuit_breaker.can_attempt() is False
