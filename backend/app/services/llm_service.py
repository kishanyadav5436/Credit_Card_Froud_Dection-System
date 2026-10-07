"""
Optional LLM Explanation Service
==================================

Generates a concise, analyst-friendly fraud explanation using an LLM.

CRITICAL RULES:
  1. The LLM NEVER decides APPROVE / REVIEW / BLOCK.
     That decision is ALWAYS made by the deterministic rule + ML engines.
  2. This service only generates a HUMAN-READABLE NARRATIVE for analysts.
  3. If the LLM API is unavailable, the system continues working normally
     using the template-based explanation from explainability.py.
  4. The API key is loaded from the AI_API_KEY environment variable.
     It is NEVER hardcoded.

Supported providers (auto-detected by available package):
  - Google Gemini  (if google-generativeai is installed)
  - OpenAI         (if openai is installed)
  - Fallback       (template narrative — always works)

To enable:
  1. Add AI_API_KEY=your_key_here to backend/.env
  2. Install ONE of:
       pip install google-generativeai    # for Gemini
       pip install openai                 # for OpenAI

The LLM receives ONLY non-sensitive structured data:
  - risk_score, decision, severity
  - reason codes and labels
  - fraud_probability
  - scoring_mode

NEVER sends: customer_id, card numbers, raw amounts in full context.
"""

import logging
import os

logger = logging.getLogger(__name__)

# ── Optional LLM imports ───────────────────────────────────────────────────────

_GEMINI_AVAILABLE = False
_OPENAI_AVAILABLE = False

try:
    import google.generativeai as genai
    _GEMINI_AVAILABLE = True
    logger.info("google-generativeai available — Gemini LLM explanations enabled.")
except ImportError:
    pass

if not _GEMINI_AVAILABLE:
    try:
        from openai import OpenAI as _OpenAI
        _OPENAI_AVAILABLE = True
        logger.info("openai available — OpenAI LLM explanations enabled.")
    except ImportError:
        pass

if not _GEMINI_AVAILABLE and not _OPENAI_AVAILABLE:
    logger.info(
        "No LLM client installed. Template-based explanations will be used. "
        "Install google-generativeai or openai to enable LLM explanations."
    )

# ── Config ─────────────────────────────────────────────────────────────────────

_AI_API_KEY = os.environ.get("AI_API_KEY", "")
_LLM_MODEL_GEMINI = os.environ.get("LLM_MODEL", "gemini-1.5-flash")
_LLM_MODEL_OPENAI = os.environ.get("LLM_MODEL", "gpt-4o-mini")


# ── Public API ─────────────────────────────────────────────────────────────────

def generate_llm_explanation(
    risk_score: int,
    decision: str,
    severity: str,
    reason_codes: list,
    reasons: list,
    fraud_probability: float,
    scoring_mode: str,
    rule_score: int = 0,
    rf_score: float = None,
) -> dict:
    """
    Generate a human-readable analyst explanation using an LLM.

    Returns
    -------
    dict with keys:
        explanation   str  — analyst-friendly narrative
        source        str  — "gemini" | "openai" | "template"
        available     bool — True if LLM was successfully called
    """
    if not _AI_API_KEY:
        return _template_explanation(
            risk_score, decision, severity, reasons, fraud_probability
        )

    prompt = _build_prompt(
        risk_score, decision, severity, reason_codes, reasons,
        fraud_probability, scoring_mode, rule_score, rf_score
    )

    # Try Gemini first
    if _GEMINI_AVAILABLE:
        result = _call_gemini(prompt)
        if result["available"]:
            return result

    # Try OpenAI
    if _OPENAI_AVAILABLE:
        result = _call_openai(prompt)
        if result["available"]:
            return result

    # Fallback
    return _template_explanation(
        risk_score, decision, severity, reasons, fraud_probability
    )


def is_llm_available() -> bool:
    """Return True if an LLM API key and client are configured."""
    return bool(_AI_API_KEY) and (_GEMINI_AVAILABLE or _OPENAI_AVAILABLE)


# ── Private helpers ────────────────────────────────────────────────────────────

def _build_prompt(
    risk_score, decision, severity, reason_codes, reasons,
    fraud_probability, scoring_mode, rule_score, rf_score
) -> str:
    reason_text = "\n".join(
        f"  - [{r.get('code', '')}] {r.get('label', '')}"
        for r in reasons[:6]
    ) or "  - No specific risk factors identified."

    rf_line = f"  ML Risk Score (RF): {rf_score:.1f}/100" if rf_score is not None else ""

    return f"""You are a fraud analyst assistant. A transaction has been evaluated by a hybrid AI fraud detection system.

FRAUD DETECTION RESULT:
  Risk Score: {risk_score}/100
  Decision: {decision}
  Severity: {severity}
  Fraud Probability: {fraud_probability:.1%}
  Scoring Mode: {scoring_mode}
  Rule Engine Score: {rule_score}/100
{rf_line}

RISK FACTORS IDENTIFIED:
{reason_text}

TASK:
Write a concise (2-4 sentences), professional analyst summary explaining:
1. Why this transaction received this risk score
2. What the key risk factors are
3. What the recommended analyst action is

RULES:
- Do NOT decide whether the system's decision is correct or incorrect
- Do NOT suggest changing the decision
- Do NOT include specific amounts, customer IDs, or card numbers
- Write in clear, professional fraud analyst language
- Keep it under 100 words
"""


def _call_gemini(prompt: str) -> dict:
    """Call Google Gemini API."""
    try:
        genai.configure(api_key=_AI_API_KEY)
        model = genai.GenerativeModel(_LLM_MODEL_GEMINI)
        response = model.generate_content(prompt)
        text = response.text.strip()
        return {
            "explanation": text,
            "source": "gemini",
            "available": True,
        }
    except Exception as e:
        logger.warning("Gemini LLM call failed: %s", e)
        return {"explanation": "", "source": "gemini", "available": False}


def _call_openai(prompt: str) -> dict:
    """Call OpenAI API."""
    try:
        client = _OpenAI(api_key=_AI_API_KEY)
        response = client.chat.completions.create(
            model=_LLM_MODEL_OPENAI,
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional fraud analyst assistant. Be concise and factual.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=150,
            temperature=0.3,
        )
        text = response.choices[0].message.content.strip()
        return {
            "explanation": text,
            "source": "openai",
            "available": True,
        }
    except Exception as e:
        logger.warning("OpenAI LLM call failed: %s", e)
        return {"explanation": "", "source": "openai", "available": False}


def _template_explanation(
    risk_score: int,
    decision: str,
    severity: str,
    reasons: list,
    fraud_probability: float,
) -> dict:
    """
    Generate a template-based explanation when no LLM is available.
    Always works as a fallback.
    """
    decision_text = {
        "BLOCK": "This transaction has been blocked due to high fraud risk.",
        "REVIEW": "This transaction has been flagged for manual review.",
        "APPROVE": "This transaction appears legitimate and has been approved.",
    }.get(decision, f"Decision: {decision}.")

    reason_labels = [r.get("label", "") for r in reasons[:3] if r.get("label")]
    reason_text = (
        " Key risk factors: " + "; ".join(reason_labels) + "."
        if reason_labels
        else ""
    )

    explanation = (
        f"{decision_text}"
        f" Risk score: {risk_score}/100 with {fraud_probability:.1%} fraud probability."
        f"{reason_text}"
    )

    return {
        "explanation": explanation,
        "source": "template",
        "available": False,
    }
