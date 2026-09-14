import time
import httpx
from typing import Optional, Dict, Any
from src.providers.base import BaseTranslationProvider, ProviderResult

# Mapping from ISO 639-3 to IndicTrans2 script-tagged codes
ISO_TO_INDICTRANS2 = {
    "hin": "hin_Deva",
    "sat": "sat_Olck",
    "eng": "eng_Latn",
    "hi": "hin_Deva",
    "en": "eng_Latn"
}

class IndicTrans2Provider(BaseTranslationProvider):
    """
    Self-hosted IndicTrans2 inference provider (MIT License).
    Interfaces with an IndicTrans2 service endpoint (FastAPI / TorchServe wrapper).
    Supports Hindi ('hin_Deva') <-> Santali ('sat_Olck').
    """
    def __init__(
        self,
        name: str = "indictrans2",
        enabled: bool = True,
        endpoint_url: str = "http://localhost:8001/translate",
        timeout_seconds: float = 10.0,
        max_retries: int = 2,
        failure_threshold: int = 3,
        config: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            name=name,
            provider_type="indictrans2",
            enabled=enabled,
            timeout_seconds=timeout_seconds,
            max_retries=max_retries,
            failure_threshold=failure_threshold,
            config=config or {}
        )
        self.endpoint_url = endpoint_url or self.config.get("endpoint_url", "http://localhost:8001/translate")

    def supports_pair(self, source_lang: str, target_lang: str) -> bool:
        src = ISO_TO_INDICTRANS2.get(source_lang.lower())
        tgt = ISO_TO_INDICTRANS2.get(target_lang.lower())
        if not src or not tgt:
            return False
        supported = {("hin_Deva", "sat_Olck"), ("sat_Olck", "hin_Deva"), ("eng_Latn", "sat_Olck"), ("sat_Olck", "eng_Latn")}
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

        src_tag = ISO_TO_INDICTRANS2.get(source_lang.lower())
        tgt_tag = ISO_TO_INDICTRANS2.get(target_lang.lower())
        if not src_tag or not tgt_tag:
            raise ValueError(f"Unsupported language pair for IndicTrans2: {source_lang} -> {target_lang}")

        start_time = time.perf_counter()
        payload = {
            "text": text,
            "src_lang": src_tag,
            "tgt_lang": tgt_tag
        }

        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            try:
                res = await client.post(self.endpoint_url, json=payload)
                res.raise_for_status()
                data = res.json()

                translated_text = data.get("translated_text", data.get("translation", ""))
                duration_ms = (time.perf_counter() - start_time) * 1000.0
                
                self.circuit_breaker.record_success()

                return ProviderResult(
                    translated_text=translated_text,
                    backend_name=self.name,
                    latency_ms=round(duration_ms, 2),
                    confidence_score=data.get("confidence", 0.90),
                    model_identifier=data.get("model", "ai4bharat/indictrans2-indic-indic-1B"),
                    raw_response=data
                )
            except Exception as e:
                self.circuit_breaker.record_failure()
                raise RuntimeError(f"IndicTrans2 translation failed: {str(e)}") from e
