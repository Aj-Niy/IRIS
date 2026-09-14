import time
import asyncio
from typing import Optional, Dict, Any
from src.cache.base import BaseTranslationCache

class MemoryTranslationCache(BaseTranslationCache):
    """
    In-memory TTL cache for local development and single-instance deployments.
    """
    def __init__(self, default_ttl_seconds: int = 86400, max_entries: int = 10000):
        self.default_ttl = default_ttl_seconds
        self.max_entries = max_entries
        self._store: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()

    async def get(self, source_lang: str, target_lang: str, text: str, script: Optional[str] = None) -> Optional[Dict[str, Any]]:
        key = self.generate_key(source_lang, target_lang, text, script)
        async with self._lock:
            entry = self._store.get(key)
            if not entry:
                return None
            
            # Check expiration
            if time.time() > entry["expires_at"]:
                del self._store[key]
                return None
                
            return entry["data"]

    async def set(
        self,
        source_lang: str,
        target_lang: str,
        text: str,
        data: Dict[str, Any],
        ttl_seconds: Optional[int] = None,
        script: Optional[str] = None
    ) -> None:
        key = self.generate_key(source_lang, target_lang, text, script)
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        expires_at = time.time() + ttl

        async with self._lock:
            # Simple eviction if max entries reached
            if len(self._store) >= self.max_entries and key not in self._store:
                # Remove oldest entry
                oldest_key = min(self._store.keys(), key=lambda k: self._store[k]["expires_at"])
                del self._store[oldest_key]

            self._store[key] = {
                "data": data,
                "expires_at": expires_at
            }

    async def clear(self) -> None:
        async with self._lock:
            self._store.clear()
