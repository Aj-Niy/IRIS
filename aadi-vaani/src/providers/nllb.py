import time
import httpx
from typing import Optional, Dict, Any
from src.providers.base import BaseTranslationProvider, ProviderResult

ISO_TO_NLLB = {
    "hin": "hin_Deva",
    "sat": "sat_Olck",
    "eng": "eng_Latn",
    "hi": "hin_Deva",
    "en": "eng_Latn"
}

class NLLBProvider(BaseTranslationProvider):
    """
    NLLB-200 Adapter (Meta AI, CC-BY-NC-4.0).
    Used primarily for offline evaluation benchmarking and knowledge distillation.
    Disabled by default in production routing unless non-commercial deployment is verified.
    """
    def __init__(
        self,
        name: str = "nllb",
        enabled: bool = False,
        endpoint_url: str = "http://localhost:8002/translate",
        timeout_seconds: float = 12.0,
        config: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            name=name,
            provider_type="nllb",
            enabled=enabled,
            timeout_seconds=timeout_seconds,
            config=config or {}
        )
        self.endpoint_url = endpoint_url or self.config.get("endpoint_url", "http://localhost:8002/translate")

    def supports_pair(self, source_lang: str, target_lang: str) -> bool:
        src = ISO_TO_NLLB.get(source_lang.lower())
        tgt = ISO_TO_NLLB.get(target_lang.lower())
        if not src or not tgt:
            return False
        supported = {("hin_Deva", "sat_Olck"), ("sat_Olck", "hin_Deva")}
        return (src, tgt) in supported

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        **kwargs
    ) -> ProviderResult:
        if not self.circuit_breaker.can_attempt():
            raise RuntimeError(f"Circuit breaker is OPEN for {self.name}")

        src_tag = ISO_TO_NLLB.get(source_lang.lower())
        tgt_tag = ISO_TO_NLLB.get(target_lang.lower())
        if not src_tag or not tgt_tag:
            raise ValueError(f"Unsupported language pair for NLLB-200: {source_lang} -> {target_lang}")

        start_time = time.perf_counter()
        payload = {
            "inputs": text,
            "src_lang": src_tag,
            "tgt_lang": tgt_tag
        }

        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            try:
                res = await client.post(self.endpoint_url, json=payload)
                res.raise_for_status()
                data = res.json()

                translated = data.get("translation_text", data.get("translated_text", ""))
                duration_ms = (time.perf_counter() - start_time) * 1000.0

                self.circuit_breaker.record_success()

                return ProviderResult(
                    translated_text=translated,
                    backend_name=self.name,
                    latency_ms=round(duration_ms, 2),
                    confidence_score=data.get("score", 0.88),
                    model_identifier="facebook/nllb-200-distilled-600M",
                    raw_response=data
                )
            except Exception as e:
                self.circuit_breaker.record_failure()
                raise RuntimeError(f"NLLB-200 translation failed: {str(e)}") from e
