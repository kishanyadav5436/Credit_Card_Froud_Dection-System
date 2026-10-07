"""
Decision Engine
===============

Configurable, deterministic threshold-based decision maker.

Converts a final_score (0-100) into a (decision, severity) tuple.

Thresholds are configurable via Settings (see core/config.py):
    APPROVE_THRESHOLD : 30  — scores below this → APPROVE
    BLOCK_THRESHOLD   : 70  — scores at/above this → BLOCK
    30 – 70           :     → REVIEW

The LLM or any AI component NEVER calls this function.
The actual fraud decision is always deterministic.
"""

from app.core.config import settings


def apply_decision(score: float) -> tuple:
    """
    Map a numeric risk score (0-100) to a (decision, severity) tuple.

    Parameters
    ----------
    score : float
        Final aggregated risk score, clamped to [0, 100].

    Returns
    -------
    (decision, severity) : (str, str)
        decision : "APPROVE" | "REVIEW" | "BLOCK"
        severity : "Low" | "Medium" | "Critical"
    """
    if score >= settings.BLOCK_THRESHOLD:
        return "BLOCK", "Critical"
    elif score >= settings.APPROVE_THRESHOLD:
        return "REVIEW", "Medium"
    else:
        return "APPROVE", "Low"


def get_threshold_config() -> dict:
    """Return current decision threshold configuration."""
    return {
        "approve_below": settings.APPROVE_THRESHOLD,
        "review_range": f"{settings.APPROVE_THRESHOLD}–{settings.BLOCK_THRESHOLD}",
        "block_at_or_above": settings.BLOCK_THRESHOLD,
    }
