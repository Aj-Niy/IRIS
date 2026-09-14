from fastapi import APIRouter, HTTPException
from src.feedback.schemas import FeedbackSubmission, FeedbackResponse
from src.feedback.storage import FeedbackStorage

router = APIRouter(prefix="/feedback", tags=["Feedback"])
storage = FeedbackStorage()

@router.post("", response_model=FeedbackResponse)
async def submit_feedback(feedback: FeedbackSubmission):
    """
    Submits user or native speaker feedback, ratings, and corrections for a translation.
    Feeds directly into the Phase 4 candidate dataset for continuous improvement.
    """
    try:
        feedback_id = await storage.save_feedback(feedback)
        return FeedbackResponse(
            status="success",
            feedback_id=feedback_id,
            message="Feedback successfully recorded for model evaluation and fine-tuning."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record feedback: {str(e)}")

@router.get("/stats")
async def get_feedback_stats():
    """Returns aggregated feedback metrics across language pairs."""
    return storage.get_summary_stats()
