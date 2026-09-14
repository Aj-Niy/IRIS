import json
import logging
from typing import Optional, Dict, Any
from src.cache.base import BaseTranslationCache

logger = logging.getLogger(__name__)

class RedisTranslationCache(BaseTranslationCache):
    """
    Distributed Redis cache backend for multi-worker production deployments.
    """
    def __init__(self, redis_url: str = "redis://localhost:6379/0", default_ttl_seconds: int = 86400):
        self.redis_url = redis_url
        self.default_ttl = default_ttl_seconds
        self._client = None

    async def _get_client(self):
        if self._client is None:
            try:
                import redis.asyncio as aioredis
                self._client = aioredis.from_url(self.redis_url, decode_responses=True)
            except ImportError:
                logger.warning("redis library not installed; caching will fail gracefully.")
                return None
            except Exception as e:
                logger.error(f"Failed to connect to Redis at {self.redis_url}: {e}")
                return None
        return self._client

    async def get(self, source_lang: str, target_lang: str, text: str, script: Optional[str] = None) -> Optional[Dict[str, Any]]:
        client = await self._get_client()
        if not client:
            return None
        key = f"cache:translation:{self.generate_key(source_lang, target_lang, text, script)}"
        try:
            val = await client.get(key)
            if val:
                return json.loads(val)
        except Exception as e:
            logger.warning(f"Redis get failed: {e}")
        return None

    async def set(
        self,
        source_lang: str,
        target_lang: str,
        text: str,
        data: Dict[str, Any],
        ttl_seconds: Optional[int] = None,
        script: Optional[str] = None
    ) -> None:
        client = await self._get_client()
        if not client:
            return
        key = f"cache:translation:{self.generate_key(source_lang, target_lang, text, script)}"
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        try:
            await client.setex(key, ttl, json.dumps(data, ensure_ascii=False))
        except Exception as e:
            logger.warning(f"Redis set failed: {e}")

    async def clear(self) -> None:
        client = await self._get_client()
        if not client:
            return
        try:
            keys = await client.keys("cache:translation:*")
            if keys:
                await client.delete(*keys)
        except Exception as e:
            logger.warning(f"Redis clear failed: {e}")
