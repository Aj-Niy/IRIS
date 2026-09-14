import time
import httpx
from typing import Optional, Dict, Any
from src.providers.base import BaseTranslationProvider, ProviderResult

class CustomMundariProvider(BaseTranslationProvider):
    """
    Adapter for custom fine-tuned Mundari checkpoints (Phase 4).
    Trained via transfer learning from North Munda (Santali) baselines with Tribal Research Institute parallel data.
    Automatically tags responses with provenance and beta reliability disclaimers.
    """
    def __init__(
        self,
        name: str = "custom_mundari",
        enabled: bool = True,
        endpoint_url: str = "http://localhost:8003/translate",
        timeout_seconds: float = 10.0,
        max_retries: int = 2,
        failure_threshold: int = 3,
        config: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            name=name,
            provider_type="custom_mundari",
            enabled=enabled,
            timeout_seconds=timeout_seconds,
            max_retries=max_retries,
            failure_threshold=failure_threshold,
            config=config or {}
        )
        self.endpoint_url = endpoint_url or self.config.get("endpoint_url", "http://localhost:8003/translate")

    def supports_pair(self, source_lang: str, target_lang: str) -> bool:
        src = source_lang.lower().strip()
        tgt = target_lang.lower().strip()
        supported = {("hin", "unr"), ("unr", "hin"), ("hi", "unr"), ("unr", "hi")}
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

        src = source_lang.lower().strip()
        tgt = target_lang.lower().strip()

        start_time = time.perf_counter()
        payload = {
            "text": text,
            "source_lang": src,
            "target_lang": tgt,
            "script": kwargs.get("script_preference", "devanagari")
        }

        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            try:
                res = await client.post(self.endpoint_url, json=payload)
                res.raise_for_status()
                data = res.json()

                translated = data.get("translated_text", data.get("translation", ""))
                duration_ms = (time.perf_counter() - start_time) * 1000.0

                self.circuit_breaker.record_success()

                return ProviderResult(
                    translated_text=translated,
                    backend_name=self.name,
                    latency_ms=round(duration_ms, 2),
                    confidence_score=data.get("confidence", 0.78),
                    model_identifier=data.get("model", "aadi-vaani/mundari-ft-v1-beta"),
                    metadata={
                        "stage": "Phase 4 Fine-Tuned Checkpoint",
                        "script": payload["script"],
                        "disclaimer": "Mundari machine translation is in early beta; native speaker review is recommended."
                    },
                    raw_response=data
                )
            except Exception as e:
                self.circuit_breaker.record_failure()
                raise RuntimeError(f"Custom Mundari translation service failed: {str(e)}") from e
