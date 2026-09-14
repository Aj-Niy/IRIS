import time
import logging
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Any

from src.router.schemas import TranslationRequest, TranslationResponse, ProvenanceInfo, LanguagePairStatus
from src.providers.base import BaseTranslationProvider, ProviderResult
from src.providers.mock import MockTranslationProvider
from src.providers.bhashini import BhashiniProvider
from src.providers.indictrans2 import IndicTrans2Provider
from src.providers.nllb import NLLBProvider
from src.providers.custom_mundari import CustomMundariProvider
from src.cache.base import BaseTranslationCache
from src.cache.memory import MemoryTranslationCache
from src.cache.redis import RedisTranslationCache
from src.transliteration.ol_chiki import normalize_santali_script
from src.transliteration.warang_citi import normalize_ho_script
from config.settings import settings

logger = logging.getLogger("translation_router")

class TranslationRouterEngine:
    def __init__(self, config_path: Optional[str] = None):
        self.config_path = Path(config_path or settings.ROUTING_CONFIG_PATH)
        self.config = self._load_config()
        self.providers: Dict[str, BaseTranslationProvider] = {}
        self.cache: BaseTranslationCache = self._init_cache()
        self._init_providers()

    def _load_config(self) -> Dict[str, Any]:
        if self.config_path.exists():
            with open(self.config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f) or {}
        logger.warning(f"Routing config file not found at {self.config_path}; using defaults.")
        return {}

    def _init_cache(self) -> BaseTranslationCache:
        cache_cfg = self.config.get("cache", {})
        backend = cache_cfg.get("backend", settings.CACHE_BACKEND)
        ttl = cache_cfg.get("default_ttl_seconds", settings.CACHE_TTL_SECONDS)
        if backend == "redis":
            redis_url = cache_cfg.get("redis_url", settings.REDIS_URL)
            return RedisTranslationCache(redis_url=redis_url, default_ttl_seconds=ttl)
        return MemoryTranslationCache(default_ttl_seconds=ttl)

    def _init_providers(self):
        providers_cfg = self.config.get("providers", {})
        
        # 1. Mock Provider
        mock_cfg = providers_cfg.get("mock", {})
        self.providers["mock"] = MockTranslationProvider(
            enabled=mock_cfg.get("enabled", True),
            simulated_latency_ms=mock_cfg.get("config", {}).get("simulated_latency_ms", 20.0)
        )

        # 2. Bhashini ULCA Provider
        bhashini_cfg = providers_cfg.get("bhashini", {})
        self.providers["bhashini"] = BhashiniProvider(
            enabled=bhashini_cfg.get("enabled", True),
            user_id=settings.BHASHINI_USER_ID,
            api_key=settings.BHASHINI_API_KEY,
            inference_key=settings.BHASHINI_INFERENCE_KEY,
            pipeline_url=bhashini_cfg.get("config", {}).get("pipeline_url", settings.BHASHINI_PIPELINE_URL),
            timeout_seconds=bhashini_cfg.get("timeout_seconds", 8.0)
        )

        # 3. IndicTrans2 Provider
        indic_cfg = providers_cfg.get("indictrans2", {})
        self.providers["indictrans2"] = IndicTrans2Provider(
            enabled=indic_cfg.get("enabled", True),
            endpoint_url=indic_cfg.get("config", {}).get("endpoint_url", settings.INDICTRANS2_ENDPOINT),
            timeout_seconds=indic_cfg.get("timeout_seconds", 10.0)
        )

        # 4. NLLB-200 Provider
        nllb_cfg = providers_cfg.get("nllb", {})
        self.providers["nllb"] = NLLBProvider(
            enabled=nllb_cfg.get("enabled", False), # Non-commercial eval default
            endpoint_url=nllb_cfg.get("config", {}).get("endpoint_url", settings.NLLB_ENDPOINT),
            timeout_seconds=nllb_cfg.get("timeout_seconds", 12.0)
        )

        # 5. Custom Mundari Provider
        mundari_cfg = providers_cfg.get("custom_mundari", {})
        self.providers["custom_mundari"] = CustomMundariProvider(
            enabled=mundari_cfg.get("enabled", True),
            endpoint_url=mundari_cfg.get("config", {}).get("endpoint_url", settings.MUNDARI_ENDPOINT),
            timeout_seconds=mundari_cfg.get("timeout_seconds", 10.0)
        )

    def get_route_chain(self, source_lang: str, target_lang: str, preferred_backend: Optional[str] = None) -> List[str]:
        src = source_lang.lower().strip()
        tgt = target_lang.lower().strip()
        key = f"{src}:{tgt}"
        routes = self.config.get("routes", {})
        
        chain = []
        if key in routes:
            chain = list(routes[key].get("priority", []))
        elif src == tgt:
            chain = ["mock"]
        else:
            # Universal fallback order
            chain = ["bhashini", "indictrans2", "custom_mundari", "mock"]

        if preferred_backend and preferred_backend in self.providers:
            if preferred_backend in chain:
                chain.remove(preferred_backend)
            chain.insert(0, preferred_backend)

        return chain

    async def translate(self, req: TranslationRequest) -> TranslationResponse:
        overall_start = time.perf_counter()
        src = req.source_lang.lower().strip()
        tgt = req.target_lang.lower().strip()

        # Step 1: Check Cache (including script preference to prevent script collisions)
        cached_entry = await self.cache.get(src, tgt, req.text, script=req.script_preference)
        if cached_entry:
            duration_ms = (time.perf_counter() - overall_start) * 1000.0
            return TranslationResponse(
                translated_text=cached_entry["translated_text"],
                source_lang=src,
                target_lang=tgt,
                backend_used=cached_entry.get("backend_used", "cache"),
                latency_ms=round(duration_ms, 2),
                cached=True,
                confidence_score=cached_entry.get("confidence_score", 1.0),
                provenance=ProvenanceInfo(
                    backend=cached_entry.get("backend_used", "cache"),
                    model_identifier=cached_entry.get("model_identifier"),
                    attempted_chain=["cache"],
                    fallback_occurred=False,
                    details={"cached_at": cached_entry.get("cached_at")}
                ),
                disclaimer=cached_entry.get("disclaimer")
            )

        # Step 2: Determine Provider Fallback Chain
        chain = self.get_route_chain(src, tgt, req.preferred_backend)
        attempted: List[str] = []
        last_error = None

        for backend_name in chain:
            if not req.allow_fallback and attempted:
                break

            provider = self.providers.get(backend_name)
            if not provider or not provider.enabled:
                continue

            if not provider.supports_pair(src, tgt):
                continue

            if not provider.circuit_breaker.can_attempt():
                logger.warning(f"Skipping {backend_name}: Circuit breaker is OPEN")
                continue

            attempted.append(backend_name)
            try:
                result: ProviderResult = await provider.translate(
                    text=req.text,
                    source_lang=src,
                    target_lang=tgt,
                    script_preference=req.script_preference
                )

                # Script normalization:
                final_text = result.translated_text
                if tgt == "sat":
                    target_script = req.script_preference or "ol_chiki"
                    final_text = normalize_santali_script(final_text, target_script)
                elif tgt == "hoc" and req.script_preference:
                    final_text = normalize_ho_script(final_text, req.script_preference)

                total_duration_ms = (time.perf_counter() - overall_start) * 1000.0
                fallback_occurred = len(attempted) > 1

                # Tribal beta disclaimer handling
                disclaimer = None
                if tgt == "unr" or src == "unr":
                    disclaimer = "Mundari translation is in early beta; native speaker review recommended."
                elif tgt == "hoc" or src == "hoc":
                    disclaimer = "Ho translation is in early beta; native speaker review recommended."

                response = TranslationResponse(
                    translated_text=final_text,
                    source_lang=src,
                    target_lang=tgt,
                    backend_used=backend_name,
                    latency_ms=round(total_duration_ms, 2),
                    cached=False,
                    confidence_score=result.confidence_score,
                    provenance=ProvenanceInfo(
                        backend=backend_name,
                        model_identifier=result.model_identifier,
                        attempted_chain=attempted,
                        fallback_occurred=fallback_occurred,
                        details=result.metadata
                    ),
                    disclaimer=disclaimer
                )

                # Store in cache
                cache_payload = {
                    "translated_text": final_text,
                    "backend_used": backend_name,
                    "confidence_score": result.confidence_score,
                    "model_identifier": result.model_identifier,
                    "disclaimer": disclaimer,
                    "cached_at": time.time()
                }
                await self.cache.set(src, tgt, req.text, cache_payload, script=req.script_preference)

                return response

            except Exception as e:
                logger.warning(f"Backend '{backend_name}' failed for {src}->{tgt}: {e}")
                last_error = e

        # If all backends in the chain failed
        raise RuntimeError(
            f"All translation providers failed for '{src}' -> '{tgt}'. "
            f"Attempted chain: {attempted}. Last error: {last_error}"
        )

    def get_supported_pairs(self) -> List[LanguagePairStatus]:
        routes = self.config.get("routes", {})
        pairs = []
        for pair_key, route_data in routes.items():
            src, tgt = pair_key.split(":")
            priority = route_data.get("priority", [])
            primary = priority[0] if priority else "mock"
            is_beta = ("unr" in (src, tgt)) or ("hoc" in (src, tgt))
            status = "beta" if is_beta else "production"
            if "unr" in (src, tgt):
                desc = f"Mundari low-resource pair via {primary} (Early Beta)"
            elif "hoc" in (src, tgt):
                desc = f"Ho indigenous language pair via {primary} (Early Beta - Devanagari & Warang Citi)"
            else:
                desc = f"Hindi/Santali pair via {primary}"
            pairs.append(LanguagePairStatus(
                source_lang=src,
                target_lang=tgt,
                primary_backend=primary,
                available_backends=priority,
                status=status,
                description=desc
            ))
        return pairs
