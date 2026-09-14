import hashlib
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any

class BaseTranslationCache(ABC):
    """
    Abstract interface for translation response caching.
    Keys are keyed by SHA-256 hashes of normalized (source_lang, target_lang, text) tuples.
    """
    @staticmethod
    def generate_key(source_lang: str, target_lang: str, text: str, script: Optional[str] = None) -> str:
        script_part = f":{script.lower().strip()}" if script else ""
        normalized_str = f"{source_lang.lower().strip()}:{target_lang.lower().strip()}:{text.strip()}{script_part}"
        return hashlib.sha256(normalized_str.encode("utf-8")).hexdigest()

    @abstractmethod
    async def get(self, source_lang: str, target_lang: str, text: str, script: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieve cached translation dictionary if present and not expired."""
        pass

    @abstractmethod
    async def set(
        self,
        source_lang: str,
        target_lang: str,
        text: str,
        data: Dict[str, Any],
        ttl_seconds: Optional[int] = None,
        script: Optional[str] = None
    ) -> None:
        """Store translation dictionary with TTL."""
        pass

    @abstractmethod
    async def clear(self) -> None:
        """Clear all cached entries."""
        pass
