import time
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ProviderResult(BaseModel):
    translated_text: str
    backend_name: str
    latency_ms: float
    confidence_score: Optional[float] = None
    model_identifier: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class CircuitBreaker:
    """
    Simple circuit breaker to prevent cascading failures to unresponsive backends.
    States: CLOSED (normal), OPEN (tripped/failing), HALF_OPEN (probing recovery).
    """
    def __init__(self, failure_threshold: int = 3, recovery_time_seconds: float = 60.0):
        self.failure_threshold = failure_threshold
        self.recovery_time_seconds = recovery_time_seconds
        self.failure_count = 0
        self.last_failure_time: Optional[float] = None
        self.state = "CLOSED"

    def record_success(self):
        self.failure_count = 0
        self.state = "CLOSED"

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

    def can_attempt(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if self.last_failure_time and (time.time() - self.last_failure_time > self.recovery_time_seconds):
                self.state = "HALF_OPEN"
                return True
            return False
        if self.state == "HALF_OPEN":
            return True
        return True

class BaseTranslationProvider(ABC):
    def __init__(
        self,
        name: str,
        provider_type: str,
        enabled: bool = True,
        timeout_seconds: float = 10.0,
        max_retries: int = 2,
        failure_threshold: int = 3,
        recovery_time_seconds: float = 60.0,
        config: Optional[Dict[str, Any]] = None
    ):
        self.name = name
        self.provider_type = provider_type
        self.enabled = enabled
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries
        self.config = config or {}
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=failure_threshold,
            recovery_time_seconds=recovery_time_seconds
        )

    @abstractmethod
    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        **kwargs
    ) -> ProviderResult:
        """
        Execute translation for the given text between source_lang and target_lang.
        Raises an exception if translation fails.
        """
        pass

    @abstractmethod
    def supports_pair(self, source_lang: str, target_lang: str) -> bool:
        """Check if this provider supports the given language pair."""
        pass

    async def is_healthy(self) -> bool:
        """Health check probe for this provider."""
        return self.circuit_breaker.can_attempt()
