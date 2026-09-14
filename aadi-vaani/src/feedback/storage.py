import os
import json
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional
from src.feedback.schemas import FeedbackSubmission
from config.settings import settings

class FeedbackStorage:
    """
    Appends user-flagged translations and native-speaker corrections to structured JSONL logs.
    Forms the candidate dataset pipeline for Phase 4 active learning and fine-tuning.
    """
    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = Path(base_dir or settings.FEEDBACK_DATASET_DIR)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    async def save_feedback(self, feedback: FeedbackSubmission) -> str:
        feedback_id = str(uuid.uuid4())
        record = feedback.model_dump()
        record["id"] = feedback_id

        src = feedback.source_lang.lower().strip()
        tgt = feedback.target_lang.lower().strip()
        pair_filename = self.base_dir / f"feedback_{src}_{tgt}.jsonl"

        line = json.dumps(record, ensure_ascii=False) + "\n"
        
        # Async append or sync fallback
        with open(pair_filename, "a", encoding="utf-8") as f:
            f.write(line)

        return feedback_id

    def get_summary_stats(self) -> Dict[str, Any]:
        """Returns counts and average ratings across pairs."""
        stats = {}
        for jsonl_file in self.base_dir.glob("feedback_*.jsonl"):
            pair = jsonl_file.stem.replace("feedback_", "")
            total_count = 0
            ratings = []
            corrections = 0
            with open(jsonl_file, "r", encoding="utf-8") as f:
                for line in f:
                    if not line.strip():
                        continue
                    total_count += 1
                    data = json.loads(line)
                    ratings.append(data.get("rating", 3))
                    if data.get("corrected_text"):
                        corrections += 1

            stats[pair] = {
                "total_submissions": total_count,
                "corrections_collected": corrections,
                "average_rating": round(sum(ratings) / len(ratings), 2) if ratings else 0.0
            }
        return stats
