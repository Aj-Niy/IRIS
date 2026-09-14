import math
import re
from typing import List, Dict, Any, Optional

def tokenize(text: str) -> List[str]:
    """Tokenize by whitespace and punctuation for basic scoring."""
    return [t for t in re.findall(r"\w+|[^\w\s]", text, re.UNICODE) if t.strip()]

def compute_chrf(hypothesis: str, reference: str, n: int = 6, beta: float = 2.0) -> float:
    """
    Computes character n-gram F-score (chrF), highly recommended for morphologically rich
    and low-resource Indian languages like Santali and Mundari.
    """
    hyp_chars = [c for c in hypothesis if not c.isspace()]
    ref_chars = [c for c in reference if not c.isspace()]
    
    if not hyp_chars or not ref_chars:
        return 0.0

    precisions = []
    recalls = []

    for order in range(1, n + 1):
        if len(hyp_chars) < order or len(ref_chars) < order:
            continue
        
        hyp_ngrams = {}
        for i in range(len(hyp_chars) - order + 1):
            ng = "".join(hyp_chars[i:i+order])
            hyp_ngrams[ng] = hyp_ngrams.get(ng, 0) + 1

        ref_ngrams = {}
        for i in range(len(ref_chars) - order + 1):
            ng = "".join(ref_chars[i:i+order])
            ref_ngrams[ng] = ref_ngrams.get(ng, 0) + 1

        overlap = 0
        for ng, count in hyp_ngrams.items():
            if ng in ref_ngrams:
                overlap += min(count, ref_ngrams[ng])

        total_hyp = sum(hyp_ngrams.values())
        total_ref = sum(ref_ngrams.values())

        p = overlap / total_hyp if total_hyp > 0 else 0.0
        r = overlap / total_ref if total_ref > 0 else 0.0
        precisions.append(p)
        recalls.append(r)

    if not precisions or not recalls:
        return 0.0

    avg_p = sum(precisions) / len(precisions)
    avg_r = sum(recalls) / len(recalls)

    if avg_p + avg_r == 0:
        return 0.0

    beta_sq = beta ** 2
    f_score = (1 + beta_sq) * (avg_p * avg_r) / (beta_sq * avg_p + avg_r)
    return round(f_score * 100.0, 2)

def compute_corpus_metrics(hypotheses: List[str], references: List[str]) -> Dict[str, Any]:
    """
    Computes chrF and exact match metrics across a parallel evaluation set.
    Attempts to use sacrebleu if installed, else uses robust built-in calculations.
    """
    if len(hypotheses) != len(references):
        raise ValueError("Number of hypotheses and references must match")

    total_pairs = len(hypotheses)
    if total_pairs == 0:
        return {"count": 0, "chrF": 0.0, "exact_match": 0.0}

    exact_matches = sum(1 for h, r in zip(hypotheses, references) if h.strip() == r.strip())
    chrf_scores = [compute_chrf(h, r) for h, r in zip(hypotheses, references)]
    avg_chrf = round(sum(chrf_scores) / total_pairs, 2)

    bleu_score = None
    try:
        import sacrebleu
        bleu = sacrebleu.corpus_bleu(hypotheses, [references])
        bleu_score = round(bleu.score, 2)
    except ImportError:
        pass

    return {
        "count": total_pairs,
        "exact_match_ratio": round(exact_matches / total_pairs, 4),
        "avg_chrF": avg_chrf,
        "bleu": bleu_score
    }
