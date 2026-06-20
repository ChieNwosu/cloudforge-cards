"""
LLM commentary layer. Uses emergentintegrations + Claude Sonnet 4.6
to turn the deterministic score breakdown into a short, friendly review.
Fails gracefully — if the LLM call errors, we return a rule-based summary
so the game never blocks on the network.
"""

import os
import uuid
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def _rule_based_summary(score: Dict[str, Any]) -> str:
    parts = [f"You scored {score['total']} / 100 — {score['rating']}."]
    for sub in score["breakdown"]:
        if sub["reasons"]:
            parts.append(f"• {sub['label']}: {sub['reasons'][0]}")
    return "\n".join(parts)


async def generate_commentary(score: Dict[str, Any], explanation: str) -> str:
    """Best-effort LLM commentary. Always returns *something*."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        return _rule_based_summary(score)

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except Exception as e:
        logger.warning("emergentintegrations unavailable: %s", e)
        return _rule_based_summary(score)

    scenario = score["scenario"]
    services = ", ".join(s["title"] for s in score["selected_services"])
    constraints = ", ".join(c["name"] for c in score["constraints"]) or "none"
    breakdown_lines = [
        f"- {s['label']}: {s['score']} ({'; '.join(s['reasons'])})"
        for s in score["breakdown"]
    ]

    system_message = (
        "You are a friendly senior cloud architect coaching a student. "
        "Given a student's AWS architecture choice for a scenario, write a "
        "concise 3–4 sentence review. Be specific, mention 1 concrete strength "
        "and 1 concrete suggestion. No emojis. No markdown headings. Plain prose."
    )

    user_prompt = (
        f"Scenario: {scenario['title']} — {scenario['prompt']}\n"
        f"Constraints chosen: {constraints}\n"
        f"Services chosen: {services}\n"
        f"Student's explanation: {explanation or '(none)'}\n\n"
        f"Score: {score['total']} / 100 — {score['rating']}\n"
        f"Breakdown:\n" + "\n".join(breakdown_lines) + "\n\n"
        "Write the review now."
    )

    try:
        chat = (
            LlmChat(
                api_key=api_key,
                session_id=str(uuid.uuid4()),
                system_message=system_message,
            )
            .with_model("anthropic", "claude-sonnet-4-6")
        )
        reply = await chat.send_message(UserMessage(text=user_prompt))
        text = reply if isinstance(reply, str) else getattr(reply, "content", str(reply))
        return text.strip() or _rule_based_summary(score)
    except Exception as e:
        logger.exception("LLM commentary failed: %s", e)
        return _rule_based_summary(score)
