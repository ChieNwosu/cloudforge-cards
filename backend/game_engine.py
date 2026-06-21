"""
Transparent, rule-based scoring engine (v0.2.5).
Total max score: 100, built from six pure sub-scores:

  A. Correct Service Selection   0..30   are the chosen services right for the scenario
  B. Ideal Architecture Match    0..25   how close to a known ideal combo
  C. Constraint Alignment        0..20   how well the design satisfies active constraints
  D. Synergy Bonus               0..15   bonus for known good AWS service pairings
  E. Simplicity / Overengineering 0..10  right number of services, no bloat
  F. Explanation Bonus           0..5    clear written design rationale

Guardrails (applied after summing):
  - A full ideal match with no distractors scores at least 85.
  - A full ideal match plus reasonable supporting services scores at least 78.

Each sub-score carries a `reasons` list surfaced verbatim to the player.
"""

from typing import List, Dict, Any
from seed_data import SERVICE_CARDS, SCENARIOS, CONSTRAINTS, SYNERGIES

SERVICES_BY_ID = {s["id"]: s for s in SERVICE_CARDS}
SCENARIOS_BY_ID = {s["id"]: s for s in SCENARIOS}
CONSTRAINTS_BY_ID = {c["id"]: c for c in CONSTRAINTS}
SYNERGY_SET = {tuple(sorted(p)) for p in SYNERGIES}


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def _avg(selected, key):
    return sum(s[key] for s in selected) / max(1, len(selected))


def _names(ids):
    return [SERVICES_BY_ID[i]["title"] for i in ids if i in SERVICES_BY_ID]


# ---------- A. Correct Service Selection (0..30) ----------
def _correct_service(selected: List[dict], scenario: dict) -> Dict[str, Any]:
    good = set(scenario.get("core_service_ids", [])) | set(scenario.get("supporting_service_ids", []))
    distractor_set = set(scenario.get("distractor_service_ids", []))
    n = len(selected)
    sel_ids = [s["id"] for s in selected]

    in_good = sum(1 for i in sel_ids if i in good)
    distractors = [i for i in sel_ids if i in distractor_set]
    off_topic = [i for i in sel_ids if i not in good and i not in distractor_set]

    score = 30 * (in_good / n)

    reasons = []
    if in_good == n:
        reasons.append("Every service you picked is a sensible fit for this scenario.")
    else:
        reasons.append(f"{in_good}/{n} of your services fit this scenario well.")
    if distractors:
        reasons.append(f"Off-target for this brief: {', '.join(_names(distractors))}.")
    if off_topic:
        reasons.append(f"Not core to the scenario: {', '.join(_names(off_topic))}.")

    return {"label": "Correct Service Selection", "score": round(_clamp(score, 0, 30), 1),
            "max": 30, "reasons": reasons}


# ---------- B. Ideal Architecture Match (0..25) ----------
def _combo_status(matched: int, total: int) -> str:
    if total > 0 and matched == total:
        return "full"
    if total > 0 and (matched / total) >= 0.5:
        return "partial"
    return "miss"


def _ideal_match(selected: List[dict], scenario: dict) -> Dict[str, Any]:
    sel_ids = {s["id"] for s in selected}
    combos = scenario.get("ideal_combos", [])

    combo_statuses = []
    best = {"combo_ids": [], "matched_count": 0, "total": 0, "coverage": 0.0, "status": "miss"}
    for combo in combos:
        cset = set(combo)
        matched = len(sel_ids & cset)
        total = len(cset)
        coverage = matched / max(1, total)
        status = _combo_status(matched, total)
        entry = {"combo_ids": list(combo), "matched_count": matched,
                 "total": total, "status": status}
        combo_statuses.append(entry)
        if coverage > best["coverage"]:
            best = {**entry, "coverage": coverage}

    # No overlap with any combo: compare against the shortest ideal combo so the
    # UI never shows "0 of 0". matched_count stays 0, status stays miss.
    if best["total"] == 0 and combos:
        shortest = min(combos, key=len)
        best = {"combo_ids": list(shortest), "matched_count": 0,
                "total": len(shortest), "coverage": 0.0, "status": "miss"}

    score = 25 * best["coverage"]

    reasons = []
    if best["status"] == "full":
        reasons.append("Spot on, this matches a textbook ideal architecture for the scenario.")
    elif best["status"] == "partial":
        missing = [i for i in best["combo_ids"] if i not in sel_ids]
        reasons.append(f"Close to an ideal pattern, {best['matched_count']}/{best['total']} services matched.")
        if missing:
            reasons.append(f"Add {', '.join(_names(missing))} to complete the best-matching architecture.")
    else:
        reasons.append("This selection does not line up with any known ideal pattern yet.")

    matched_ideal = {"combo_ids": best["combo_ids"], "matched_count": best["matched_count"],
                     "total": best["total"], "status": best["status"]}

    return ({"label": "Ideal Architecture Match", "score": round(_clamp(score, 0, 25), 1),
             "max": 25, "reasons": reasons},
            matched_ideal, combo_statuses)


# ---------- C. Constraint Alignment (0..20) ----------
def _constraint_satisfaction(cid: str, selected: List[dict]) -> float:
    n = len(selected)
    avg_cost = _avg(selected, "cost")
    avg_sec = _avg(selected, "security")
    avg_scale = _avg(selected, "scalability")
    avg_cx = _avg(selected, "complexity")
    serverless_ratio = sum(1 for s in selected if s["serverless"]) / max(1, n)
    has_security = any(s["category"] == "Security" for s in selected)
    has_monitoring = any(s["category"] == "Monitoring" for s in selected)
    ha_ids = {"route53", "cloudfront", "alb", "aurora_serverless", "dynamodb"}
    has_ha = any(s["id"] in ha_ids for s in selected)
    ll_ids = {"cloudfront", "elasticache", "dynamodb", "api_gateway"}
    ll_count = sum(1 for s in selected if s["id"] in ll_ids)

    if cid == "low_cost":
        return _clamp((3.5 - avg_cost) / 2.5, 0, 1)
    if cid == "high_availability":
        return _clamp(avg_scale / 5 + (0.2 if has_ha else -0.1), 0, 1)
    if cid == "serverless":
        return _clamp(serverless_ratio, 0, 1)
    if cid == "secure":
        return _clamp(avg_sec / 5 + (0.15 if has_security else -0.15), 0, 1)
    if cid == "scalable":
        return _clamp(avg_scale / 5, 0, 1)
    if cid == "beginner_friendly":
        return _clamp((4 - avg_cx) / 3, 0, 1)
    if cid == "low_latency":
        return _clamp(ll_count / max(1, n) + (0.3 if ll_count else 0), 0, 1)
    if cid == "observability":
        return 1.0 if has_monitoring else 0.25
    return 0.5


def _constraints(selected: List[dict], scenario: dict, constraints: List[str]) -> Dict[str, Any]:
    good = set(scenario.get("core_service_ids", [])) | set(scenario.get("supporting_service_ids", []))
    ratio = sum(1 for s in selected if s["id"] in good) / max(1, len(selected))
    reasons = []

    if not constraints:
        score = 10 * ratio
        reasons.append("No special constraints this round, judged on general best-practice fit.")
        return {"label": "Constraint Alignment", "score": round(_clamp(score, 0, 20), 1),
                "max": 20, "reasons": reasons}

    sats = []
    for cid in constraints:
        sat = _constraint_satisfaction(cid, selected)
        sats.append(sat)
        name = CONSTRAINTS_BY_ID.get(cid, {}).get("name", cid)
        if sat >= 0.75:
            reasons.append(f"'{name}' constraint handled well.")
        elif sat >= 0.45:
            reasons.append(f"'{name}' constraint partly met, room to tighten.")
        else:
            reasons.append(f"'{name}' constraint not really satisfied by this design.")

    score = 20 * (sum(sats) / len(sats))
    return {"label": "Constraint Alignment", "score": round(_clamp(score, 0, 20), 1),
            "max": 20, "reasons": reasons}


# ---------- D. Synergy Bonus (0..15) ----------
def _synergy(selected: List[dict]) -> Dict[str, Any]:
    ids = [s["id"] for s in selected]
    pairs_found = []
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            pair = tuple(sorted([ids[i], ids[j]]))
            if pair in SYNERGY_SET:
                pairs_found.append(pair)

    score = 15.0 if len(pairs_found) >= 2 else 7.0 * len(pairs_found)
    reasons = []
    if pairs_found:
        sample = ", ".join(f"{SERVICES_BY_ID[a]['title']}+{SERVICES_BY_ID[b]['title']}"
                           for a, b in pairs_found[:3])
        reasons.append(f"Strong AWS pairings detected ({len(pairs_found)}): {sample}.")
    else:
        reasons.append("No classic AWS pairing detected, services feel disconnected.")

    return {"label": "Synergy Bonus", "score": round(_clamp(score, 0, 15), 1),
            "max": 15, "reasons": reasons, "pairs": [list(p) for p in pairs_found]}


# ---------- E. Simplicity / Overengineering (0..10) ----------
def _simplicity(selected: List[dict], scenario: dict) -> Dict[str, Any]:
    n = len(selected)
    min_ideal = scenario["min_services"]
    max_ideal = scenario["max_services"]
    reasons = []

    if n > max_ideal:
        dev = n - max_ideal
        score = 10 - 2 * dev
        reasons.append(f"Overengineered: {n} services, scenario expects at most {max_ideal}.")
    elif n < min_ideal:
        dev = min_ideal - n
        score = 10 - 2 * dev
        reasons.append(f"Too thin: {n} services, scenario needs at least {min_ideal}.")
    else:
        score = 10
        reasons.append("Right-sized, lean and complete for the scenario.")

    return {"label": "Simplicity / Overengineering", "score": round(_clamp(score, 0, 10), 1),
            "max": 10, "reasons": reasons}


# ---------- F. Explanation Bonus (0..5) ----------
def _explanation(explanation: str) -> Dict[str, Any]:
    text = (explanation or "").strip()
    words = len(text.split())
    if words == 0:
        score, reason = 0.0, "No explanation given, add one next round for up to +5."
    elif words < 8:
        score, reason = 2.0, "Brief rationale noted."
    elif words < 20:
        score, reason = 4.0, "Clear design rationale, nice."
    else:
        score, reason = 5.0, "Thorough explanation of your design intent."
    return {"label": "Explanation Bonus", "score": round(score, 1),
            "max": 5, "reasons": [reason]}


def score_round(scenario_id: str, constraint_ids: List[str],
                selected_ids: List[str], explanation: str = "") -> Dict[str, Any]:
    scenario = SCENARIOS_BY_ID.get(scenario_id)
    if not scenario:
        raise ValueError(f"Unknown scenario: {scenario_id}")
    selected = [SERVICES_BY_ID[i] for i in selected_ids if i in SERVICES_BY_ID]
    if not selected:
        raise ValueError("No valid services selected")

    a = _correct_service(selected, scenario)
    b, matched_ideal, combo_statuses = _ideal_match(selected, scenario)
    c = _constraints(selected, scenario, constraint_ids)
    d = _synergy(selected)
    e = _simplicity(selected, scenario)
    f = _explanation(explanation)
    sub_scores = [a, b, c, d, e, f]

    total = round(_clamp(sum(s["score"] for s in sub_scores), 0, 100), 1)

    # ----- Guardrails -----
    distractor_set = set(scenario.get("distractor_service_ids", []))
    distractor_count = sum(1 for s in selected if s["id"] in distractor_set)
    if matched_ideal["status"] == "full" and distractor_count == 0:
        total = max(total, 85.0)
    elif matched_ideal["status"] == "full" and distractor_count <= 1:
        total = max(total, 78.0)
    total = round(_clamp(total, 0, 100), 1)

    rating = (
        "Well-Architected" if total >= 86 else
        "Production Candidate" if total >= 71 else
        "Partial Fit" if total >= 51 else
        "Needs Refactor" if total >= 31 else
        "Broken Architecture"
    )

    ideal_combos = scenario.get("ideal_combos", [])
    ideal_combos_resolved = [
        [SERVICES_BY_ID[s] for s in combo if s in SERVICES_BY_ID]
        for combo in ideal_combos
    ]
    # Per-combo pill status aligned with ideal_combos order.
    sel_ids_set = {s["id"] for s in selected}
    ideal_combos_status = []
    for combo in ideal_combos:
        cset = set(combo)
        matched = len(sel_ids_set & cset)
        ideal_combos_status.append({
            "combo_ids": list(combo),
            "matched_count": matched,
            "total": len(cset),
            "status": _combo_status(matched, len(cset)),
        })

    best_match_service_names = _names(matched_ideal["combo_ids"])

    return {
        "total": total,
        "rating": rating,
        "breakdown": sub_scores,
        "scenario": scenario,
        "constraints": [CONSTRAINTS_BY_ID[c] for c in constraint_ids if c in CONSTRAINTS_BY_ID],
        "selected_services": selected,
        "ideal_combos": ideal_combos_resolved,
        "ideal_combos_status": ideal_combos_status,
        "matched_ideal": matched_ideal,
        "best_match_service_names": best_match_service_names,
    }
