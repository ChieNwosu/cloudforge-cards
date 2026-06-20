"""
Transparent, rule-based scoring engine.
Total max score: 100  (six sub-scores below clamp to their ranges).

  service_fit            0..25   how well selected services match ideal categories & tags
  cost_alignment        -10..15   matches "low_cost" intent
  security_alignment    -10..15   matches "secure" intent and overall security posture
  scalability_alignment -10..15   matches "scalable" / "high_availability"
  synergy_bonus           0..20   bonus for known good service pairs
  overengineering        -20..0   penalty for too many services / unjustified complexity

Each sub-score carries a `reasons` list — these are surfaced to the user verbatim.
"""

from typing import List, Dict, Any
from seed_data import SERVICE_CARDS, SCENARIOS, CONSTRAINTS, SYNERGIES

SERVICES_BY_ID = {s["id"]: s for s in SERVICE_CARDS}
SCENARIOS_BY_ID = {s["id"]: s for s in SCENARIOS}
CONSTRAINTS_BY_ID = {c["id"]: c for c in CONSTRAINTS}
SYNERGY_SET = {tuple(sorted(p)) for p in SYNERGIES}


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def _service_fit(selected: List[dict], scenario: dict) -> Dict[str, Any]:
    ideal_categories = set(scenario["ideal_categories"])
    ideal_tags = set(scenario["ideal_tags"])

    cat_hits = sum(1 for s in selected if s["category"] in ideal_categories)
    tag_hits = 0
    for s in selected:
        if ideal_tags & set(s["tags"]):
            tag_hits += 1

    cat_score = (cat_hits / max(1, len(selected))) * 12  # 0..12
    tag_score = (tag_hits / max(1, len(selected))) * 13  # 0..13
    raw = cat_score + tag_score

    reasons = []
    if cat_hits == len(selected):
        reasons.append("Every chosen service sits in a category the scenario actually needs.")
    elif cat_hits >= len(selected) - 1:
        reasons.append("Most categories match the scenario well.")
    else:
        reasons.append(f"Only {cat_hits}/{len(selected)} services fit the scenario's core categories.")
    if tag_hits == len(selected):
        reasons.append("Tags line up tightly with the scenario's needs.")
    elif tag_hits < len(selected) / 2:
        reasons.append("Several services don't carry tags the scenario calls for.")

    return {"label": "Service Fit", "score": round(_clamp(raw, 0, 25), 1),
            "max": 25, "reasons": reasons}


def _avg(selected, key):
    return sum(s[key] for s in selected) / max(1, len(selected))


def _cost(selected: List[dict], constraints: List[str]) -> Dict[str, Any]:
    avg_cost = _avg(selected, "cost")   # 1 cheap..5 expensive
    wants_cheap = "low_cost" in constraints
    reasons = []

    if wants_cheap:
        # ideal avg_cost <= 2
        score = (3.0 - avg_cost) * 5   # avg 1 -> 10, avg 2 -> 5, avg 3 -> 0, avg 4 -> -5
        score = _clamp(score, -10, 15)
        if avg_cost <= 1.8:
            reasons.append("Lean, mostly serverless / pay-per-use picks — cost looks great.")
        elif avg_cost <= 2.5:
            reasons.append("Moderate cost. Some picks still carry fixed overhead.")
        else:
            reasons.append("Expensive choices for a 'low cost' brief — consider serverless equivalents.")
    else:
        # neutral: reward sensible cost overall
        score = (3.5 - avg_cost) * 3
        score = _clamp(score, -5, 8)
        if avg_cost <= 2.2:
            reasons.append("Cost-efficient lineup overall.")
        elif avg_cost >= 4:
            reasons.append("Lineup is on the expensive side — only worth it if the workload justifies it.")

    return {"label": "Cost Alignment", "score": round(score, 1),
            "max": 15, "reasons": reasons}


def _security(selected: List[dict], constraints: List[str]) -> Dict[str, Any]:
    avg_sec = _avg(selected, "security")  # 1..5
    wants_secure = "secure" in constraints
    has_iam = any(s["category"] == "Security" for s in selected)
    reasons = []

    if wants_secure:
        score = (avg_sec - 3) * 5  # avg 4 -> 5; avg 5 -> 10
        if has_iam:
            score += 5
            reasons.append("Includes an explicit security service — good defense-in-depth.")
        else:
            reasons.append("No explicit security service (IAM, KMS, WAF, Cognito, Secrets Manager).")
        score = _clamp(score, -10, 15)
        if avg_sec >= 4.2:
            reasons.append("Selected services carry strong default security postures.")
    else:
        score = (avg_sec - 3.5) * 2
        score = _clamp(score, -3, 6)
        if has_iam:
            reasons.append("Bonus: thoughtful inclusion of a security service.")

    return {"label": "Security Alignment", "score": round(score, 1),
            "max": 15, "reasons": reasons}


def _scalability(selected: List[dict], constraints: List[str]) -> Dict[str, Any]:
    avg_scale = _avg(selected, "scalability")  # 1..5
    wants_scale = "scalable" in constraints or "high_availability" in constraints
    serverless_ratio = sum(1 for s in selected if s["serverless"]) / max(1, len(selected))
    reasons = []

    if wants_scale:
        score = (avg_scale - 3) * 5
        if serverless_ratio >= 0.6:
            score += 3
            reasons.append("Mostly serverless — scales without manual intervention.")
        score = _clamp(score, -10, 15)
        if avg_scale >= 4.3:
            reasons.append("Components selected can absorb sudden traffic bursts.")
        elif avg_scale < 3.5:
            reasons.append("Some bottlenecks here — these services don't scale on their own.")
    else:
        score = (avg_scale - 3.5) * 2
        score = _clamp(score, -3, 6)

    return {"label": "Scalability Alignment", "score": round(score, 1),
            "max": 15, "reasons": reasons}


def _synergy(selected: List[dict]) -> Dict[str, Any]:
    ids = [s["id"] for s in selected]
    pairs_found = []
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            pair = tuple(sorted([ids[i], ids[j]]))
            if pair in SYNERGY_SET:
                pairs_found.append(pair)

    score = _clamp(len(pairs_found) * 4, 0, 20)
    reasons = []
    if pairs_found:
        sample = ", ".join(f"{a}+{b}" for a, b in pairs_found[:3])
        reasons.append(f"Strong service synergies detected ({len(pairs_found)}): {sample}.")
    else:
        reasons.append("No classic AWS pairing detected in this selection.")

    return {"label": "Synergy Bonus", "score": round(score, 1),
            "max": 20, "reasons": reasons,
            "pairs": [list(p) for p in pairs_found]}


def _overengineering(selected: List[dict], scenario: dict, constraints: List[str]) -> Dict[str, Any]:
    n = len(selected)
    max_ideal = scenario["max_services"]
    min_ideal = scenario["min_services"]
    avg_complexity = _avg(selected, "complexity")
    wants_beginner = "beginner_friendly" in constraints
    reasons = []
    penalty = 0.0

    if n > max_ideal:
        penalty -= (n - max_ideal) * 4
        reasons.append(f"Selection has {n} services — scenario expects at most {max_ideal}.")
    if n < min_ideal:
        penalty -= (min_ideal - n) * 4
        reasons.append(f"Selection has only {n} services — scenario needs at least {min_ideal}.")
    if avg_complexity >= 3.5:
        penalty -= (avg_complexity - 3) * 3
        reasons.append("High overall operational complexity for this brief.")
    if wants_beginner and avg_complexity > 2.5:
        penalty -= 4
        reasons.append("'Beginner friendly' was requested but selection is heavy on advanced services.")
    if not reasons:
        reasons.append("Selection sized & shaped reasonably for the scenario.")

    return {"label": "Overengineering", "score": round(_clamp(penalty, -20, 0), 1),
            "max": 0, "min": -20, "reasons": reasons}


def score_round(scenario_id: str, constraint_ids: List[str],
                selected_ids: List[str]) -> Dict[str, Any]:
    scenario = SCENARIOS_BY_ID.get(scenario_id)
    if not scenario:
        raise ValueError(f"Unknown scenario: {scenario_id}")
    selected = [SERVICES_BY_ID[i] for i in selected_ids if i in SERVICES_BY_ID]
    if not selected:
        raise ValueError("No valid services selected")

    sub_scores = [
        _service_fit(selected, scenario),
        _cost(selected, constraint_ids),
        _security(selected, constraint_ids),
        _scalability(selected, constraint_ids),
        _synergy(selected),
        _overengineering(selected, scenario, constraint_ids),
    ]
    total = sum(s["score"] for s in sub_scores)
    total = round(_clamp(total, 0, 100), 1)

    rating = (
        "S-Tier Architect" if total >= 85 else
        "Solid Design" if total >= 70 else
        "Workable" if total >= 55 else
        "Needs Rework" if total >= 35 else
        "Back to the drawing board"
    )

    return {
        "total": total,
        "rating": rating,
        "breakdown": sub_scores,
        "scenario": scenario,
        "constraints": [CONSTRAINTS_BY_ID[c] for c in constraint_ids if c in CONSTRAINTS_BY_ID],
        "selected_services": selected,
    }
