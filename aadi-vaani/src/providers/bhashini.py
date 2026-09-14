import time
import httpx
from typing import Optional, Dict, Any
from src.providers.base import BaseTranslationProvider, ProviderResult

# ISO 639-3 to Bhashini language tag map
ISO_TO_BHASHINI = {
    "hin": "hi",
    "hi": "hi",
    "sat": "sat",
    "eng": "en",
    "en": "en",
}

BHASHINI_TO_ISO = {
    "hi": "hin",
    "sat": "sat",
    "en": "eng"
}

class BhashiniProvider(BaseTranslationProvider):
    """
    Bhashini ULCA Pipeline API adapter.
    Handles dynamic inference endpoint resolution and authentication tokens.
    """
    def __init__(
        self,
        name: str = "bhashini",
        enabled: bool = True,
        user_id: str = "",
        api_key: str = "",
        inference_key: str = "",
        pipeline_url: str = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
        timeout_seconds: float = 8.0,
        max_retries: int = 2,
        failure_threshold: int = 3,
        config: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            name=name,
            provider_type="bhashini",
            enabled=enabled,
            timeout_seconds=timeout_seconds,
            max_retries=max_retries,
            failure_threshold=failure_threshold,
            config=config or {}
        )
        self.user_id = user_id or self.config.get("user_id", "")
        self.api_key = api_key or self.config.get("api_key", "")
        self.inference_key = inference_key or self.config.get("inference_key", "")
        self.pipeline_url = pipeline_url or self.config.get("pipeline_url", "https://dhruva-api.bhashini.gov.in/services/inference/pipeline")

    def supports_pair(self, source_lang: str, target_lang: str) -> bool:
        src = ISO_TO_BHASHINI.get(source_lang.lower())
        tgt = ISO_TO_BHASHINI.get(target_lang.lower())
        if not src or not tgt:
            return False
        # Bhashini supports scheduled languages (Hindi, Santali, English)
        supported_pairs = {("hi", "sat"), ("sat", "hi"), ("en", "sat"), ("sat", "en")}
        return (src, tgt) in supported_pairs

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        **kwargs
    ) -> ProviderResult:
        if not self.circuit_breaker.can_attempt():
            raise RuntimeError(f"Circuit breaker is OPEN for {self.name}")

        src_bhashini = ISO_TO_BHASHINI.get(source_lang.lower(), source_lang.lower())
        tgt_bhashini = ISO_TO_BHASHINI.get(target_lang.lower(), target_lang.lower())

        if not self.api_key or not self.user_id:
            # Without configured credentials, raise clear configuration error so router falls back
            self.circuit_breaker.record_failure()
            raise ValueError("Bhashini API credentials (BHASHINI_USER_ID, BHASHINI_API_KEY) not configured")

        start_time = time.perf_counter()
        
        # Step 1: Request Pipeline Configuration
        pipeline_headers = {
            "Content-Type": "application/json",
            "ulcaApiKey": self.api_key,
            "userID": self.user_id
        }
        
        pipeline_payload = {
            "pipelineTasks": [
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": src_bhashini,
                            "targetLanguage": tgt_bhashini
                        }
                    }
                }
            ],
            "pipelineRequestConfig": {
                "pipelineId": "64392f96daac500b55c543d7" # Standard Bhashini public pipeline ID
            }
        }

        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            try:
                # Negotiate endpoint
                res = await client.post(self.pipeline_url, json=pipeline_payload, headers=pipeline_headers)
                res.raise_for_status()
                pipeline_data = res.json()

                # Extract callback endpoint, serviceId and inference auth key
                task_config = pipeline_data["pipelineResponseConfig"][0]["config"][0]
                service_id = task_config["serviceId"]
                callback_url = pipeline_data["pipelineInferenceAPIEndPoint"]["callbackUrl"]
                inference_auth_header = pipeline_data["pipelineInferenceAPIEndPoint"]["inferenceApiKey"]["value"]
                auth_name = pipeline_data["pipelineInferenceAPIEndPoint"]["inferenceApiKey"].get("name", "Authorization")

                # Step 2: Call Inference API
                compute_headers = {
                    "Content-Type": "application/json",
                    auth_name: inference_auth_header
                }

                compute_payload = {
                    "pipelineTasks": [
                        {
                            "taskType": "translation",
                            "config": {
                                "language": {
                                    "sourceLanguage": src_bhashini,
                                    "targetLanguage": tgt_bhashini
                                },
                                "serviceId": service_id
                            }
                        }
                    ],
                    "inputData": {
                        "input": [{"source": text}]
                    }
                }

                infer_res = await client.post(callback_url, json=compute_payload, headers=compute_headers)
                infer_res.raise_for_status()
                infer_data = infer_res.json()

                translated_output = infer_data["pipelineResponse"][0]["output"][0]["target"]
                duration_ms = (time.perf_counter() - start_time) * 1000.0
                
                self.circuit_breaker.record_success()

                return ProviderResult(
                    translated_text=translated_output,
                    backend_name=self.name,
                    latency_ms=round(duration_ms, 2),
                    confidence_score=0.92,
                    model_identifier=service_id,
                    raw_response=infer_data
                )

            except Exception as e:
                self.circuit_breaker.record_failure()
                raise RuntimeError(f"Bhashini translation failed: {str(e)}") from e
