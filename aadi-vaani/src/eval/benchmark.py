import asyncio
import time
from typing import List, Dict, Any
from src.router.engine import TranslationRouterEngine
from src.router.schemas import TranslationRequest
from src.eval.metrics import compute_corpus_metrics

class TranslationBenchmark:
    def __init__(self, engine: TranslationRouterEngine):
        self.engine = engine

    async def evaluate_backend(
        self,
        backend_name: str,
        test_pairs: List[Dict[str, str]],
        source_lang: str,
        target_lang: str
    ) -> Dict[str, Any]:
        """
        Runs a test dataset through a designated backend and computes latency and chrF quality.
        """
        hypotheses = []
        references = []
        latencies = []
        errors = 0

        for item in test_pairs:
            src_text = item["source"]
            ref_text = item["reference"]
            references.append(ref_text)

            req = TranslationRequest(
                text=src_text,
                source_lang=source_lang,
                target_lang=target_lang,
                allow_fallback=False,
                preferred_backend=backend_name
            )

            try:
                start = time.perf_counter()
                res = await self.engine.translate(req)
                latencies.append((time.perf_counter() - start) * 1000.0)
                hypotheses.append(res.translated_text)
            except Exception as e:
                errors += 1
                hypotheses.append("")

        metrics = compute_corpus_metrics(hypotheses, references)
        metrics["backend"] = backend_name
        metrics["language_pair"] = f"{source_lang}->{target_lang}"
        metrics["error_count"] = errors
        metrics["avg_latency_ms"] = round(sum(latencies) / len(latencies), 2) if latencies else 0.0

        return metrics
