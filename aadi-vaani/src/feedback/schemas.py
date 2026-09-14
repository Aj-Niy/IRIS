import time
from typing import Optional
from pydantic import BaseModel, Field

class FeedbackSubmission(BaseModel):
    source_text: str = Field(..., description="Original input text")
    source_lang: str = Field(..., description="Source language ISO code")
    target_lang: str = Field(..., description="Target language ISO code")
    translated_text: str = Field(..., description="Machine translated output")
    corrected_text: Optional[str] = Field(default=None, description="Human/Native speaker correction")
    backend_used: str = Field(..., description="Name of backend that produced translation")
    rating: int = Field(..., ge=1, le=5, description="1 (poor) to 5 (excellent)")
    is_accurate: bool = Field(default=True, description="Flag whether meaning is preserved")
    comment: Optional[str] = Field(default=None, description="Linguistic remarks or context")
    native_speaker: bool = Field(default=False, description="Whether feedback author is a native speaker")
    reviewer_id: Optional[str] = Field(default=None, description="Optional contributor/evaluator identifier")
    timestamp: float = Field(default_factory=time.time)

class FeedbackResponse(BaseModel):
    status: str = "success"
    feedback_id: str
    message: str
