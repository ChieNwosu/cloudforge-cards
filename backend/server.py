from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import logging
import secrets
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from seed_data import SERVICE_CARDS, SCENARIOS, CONSTRAINTS
from game_engine import score_round
from commentary import generate_commentary

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="AWS CloudForge Cards")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class ScoreRequest(BaseModel):
    scenario_id: str
    constraint_ids: List[str] = []
    selected_service_ids: List[str]
    explanation: Optional[str] = ""


class LeaderboardEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    total_score: float
    rounds: int = 3
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LeaderboardCreate(BaseModel):
    name: str
    total_score: float
    rounds: int = 3
    mode: str = "official"          # "official" | "guest"
    owner_token: Optional[str] = None


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "AWS CloudForge Cards API", "status": "ok"}


@api_router.get("/cards/services")
async def get_services():
    return {"services": SERVICE_CARDS}


@api_router.get("/cards/scenarios")
async def get_scenarios():
    return {"scenarios": SCENARIOS}


@api_router.get("/cards/constraints")
async def get_constraints():
    return {"constraints": CONSTRAINTS}


@api_router.get("/game/deal")
async def deal_round(hand_size: int = 10, scenario_id: Optional[str] = None,
                    constraint_count: int = 2):
    """Deal a randomized round: 1 scenario, N constraint chips, M service cards.
    Hand is guaranteed to contain every service from one ideal combo for the scenario,
    so the post-round 'Ideal Architecture' recommendation is always reachable."""
    hand_size = max(6, min(14, hand_size))
    constraint_count = max(1, min(4, constraint_count))
    rng = secrets.SystemRandom()

    if scenario_id:
        scenario = next((s for s in SCENARIOS if s["id"] == scenario_id), None)
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
    else:
        scenario = rng.choice(SCENARIOS)

    constraints = rng.sample(CONSTRAINTS, k=min(constraint_count, len(CONSTRAINTS)))

    # Guarantee one ideal combo is in the hand (no duplicates).
    combos = scenario.get("ideal_combos") or []
    required_ids = set(rng.choice(combos)) if combos else set()
    required = [s for s in SERVICE_CARDS if s["id"] in required_ids]
    pool = [s for s in SERVICE_CARDS if s["id"] not in required_ids]
    filler_n = max(0, min(hand_size, len(SERVICE_CARDS)) - len(required))
    filler = rng.sample(pool, k=min(filler_n, len(pool)))
    hand = required + filler
    rng.shuffle(hand)
    return {"scenario": scenario, "constraints": constraints, "hand": hand}


@api_router.get("/game/session")
async def session_scenarios(rounds: int = 3):
    """Pre-pick N unique scenarios for a session so rounds never repeat."""
    rng = secrets.SystemRandom()
    n = max(1, min(rounds, len(SCENARIOS)))
    picks = rng.sample(SCENARIOS, k=n)
    return {"scenario_ids": [s["id"] for s in picks]}


@api_router.post("/game/score")
async def score_endpoint(req: ScoreRequest):
    if not (3 <= len(req.selected_service_ids) <= 6):
        raise HTTPException(status_code=400,
                            detail="Select between 3 and 6 service cards.")
    score = None
    try:
        score = score_round(req.scenario_id, req.constraint_ids,
                            req.selected_service_ids, req.explanation or "")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    commentary = await generate_commentary(score, req.explanation or "")
    return {**score, "commentary": commentary, "explanation": req.explanation or ""}


GUEST_TTL_DAYS = 7


def _normalize_name(name: str) -> str:
    return re.sub(r"\s+", " ", (name or "").strip())


def _name_key(name: str) -> str:
    return _normalize_name(name).lower()


def _name_suggestions(name: str) -> List[str]:
    n = _normalize_name(name)
    compact = n.replace(" ", "")
    return [f"{n}_01", f"{compact}Cloud", f"{n}_Forge"]


def _sanitize(doc: dict) -> dict:
    """Public-safe view of a leaderboard doc (no owner_token / internal keys)."""
    return {
        "id": doc.get("id"),
        "name": doc.get("name"),
        "total_score": doc.get("total_score"),
        "rounds": doc.get("rounds", 3),
        "mode": doc.get("mode", "official"),
        "created_at": doc.get("created_at"),
    }


@api_router.get("/leaderboard")
async def get_leaderboard(limit: int = 20):
    now_iso = datetime.now(timezone.utc).isoformat()
    # Hide expired guest scores; official/legacy rows have no expires_at.
    query = {"$or": [
        {"expires_at": {"$exists": False}},
        {"expires_at": None},
        {"expires_at": {"$gt": now_iso}},
    ]}
    docs = await db.leaderboard.find(query, {"_id": 0}).sort("total_score", -1).to_list(limit)
    return {"entries": [_sanitize(d) for d in docs]}


@api_router.post("/leaderboard")
async def add_leaderboard(entry: LeaderboardCreate):
    name = _normalize_name(entry.name)[:32]
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    key = name.lower()
    score = round(entry.total_score, 1)
    now = datetime.now(timezone.utc)
    mode = "guest" if entry.mode == "guest" else "official"
    owner = entry.owner_token or secrets.token_urlsafe(16)

    # ----- Temporary guest score: always a fresh entry, expires in 7 days -----
    if mode == "guest":
        doc = {
            "id": str(uuid.uuid4()), "name": name, "name_key": key,
            "total_score": score, "rounds": entry.rounds, "mode": "guest",
            "owner_token": owner, "created_at": now.isoformat(),
            "expires_at": (now + timedelta(days=GUEST_TTL_DAYS)).isoformat(),
        }
        await db.leaderboard.insert_one(doc)
        return {"status": "created", "message": f"Guest score saved for {name}.",
                "entry": _sanitize(doc), "suggestions": []}

    # ----- Official personal best -----
    all_rows = await db.leaderboard.find({}, {"_id": 0}).to_list(1000)
    matches = [r for r in all_rows
               if r.get("mode", "official") != "guest" and _name_key(r.get("name", "")) == key]

    if not matches:
        doc = {
            "id": str(uuid.uuid4()), "name": name, "name_key": key,
            "total_score": score, "rounds": entry.rounds, "mode": "official",
            "owner_token": owner, "created_at": now.isoformat(), "expires_at": None,
        }
        await db.leaderboard.insert_one(doc)
        return {"status": "created", "message": f"New personal best saved for {name}.",
                "entry": _sanitize(doc), "suggestions": []}

    # Collapse any pre-existing duplicate official rows: keep the highest as canonical.
    matches.sort(key=lambda r: r.get("total_score", 0), reverse=True)
    canonical = matches[0]
    for dup in matches[1:]:
        await db.leaderboard.delete_one({"id": dup["id"]})

    canon_owner = canonical.get("owner_token")
    # Name is owned by someone else -> cannot update, suggest alternatives.
    if canon_owner and entry.owner_token and entry.owner_token != canon_owner:
        return {"status": "conflict",
                "message": "That name is already taken. Try one of these instead.",
                "entry": None, "suggestions": _name_suggestions(name)}
    if canon_owner and not entry.owner_token:
        return {"status": "conflict",
                "message": "That name is already taken. Try one of these instead.",
                "entry": None, "suggestions": _name_suggestions(name)}

    # Owner matches, or canonical was an unowned legacy row (claim it now).
    new_owner = canon_owner or owner
    if score > canonical.get("total_score", 0):
        await db.leaderboard.update_one(
            {"id": canonical["id"]},
            {"$set": {"name": name, "name_key": key, "total_score": score,
                      "rounds": entry.rounds, "mode": "official",
                      "owner_token": new_owner, "expires_at": None}},
        )
        updated = {**canonical, "name": name, "total_score": score,
                   "rounds": entry.rounds, "mode": "official"}
        return {"status": "updated", "message": f"New personal best saved for {name}.",
                "entry": _sanitize(updated), "suggestions": []}

    if not canon_owner:
        await db.leaderboard.update_one({"id": canonical["id"]},
                                        {"$set": {"owner_token": new_owner}})
    return {"status": "kept",
            "message": f"Your saved best for {name} is still {canonical.get('total_score')}.",
            "entry": _sanitize(canonical), "suggestions": []}


@api_router.delete("/leaderboard/{entry_id}")
async def delete_leaderboard(entry_id: str, owner_token: Optional[str] = None):
    """Delete a single entry by id. If the entry has an owner_token, the caller
    must present the matching token. There is no bulk/delete-all endpoint."""
    doc = await db.leaderboard.find_one({"id": entry_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Score not found")
    token = doc.get("owner_token")
    if token and owner_token != token:
        raise HTTPException(status_code=403, detail="You can only delete your own score.")
    await db.leaderboard.delete_one({"id": entry_id})
    return {"deleted": True, "id": entry_id}


@api_router.delete("/admin/leaderboard/{entry_id}")
async def admin_delete_leaderboard(entry_id: str,
                                   x_admin_token: Optional[str] = Header(default=None)):
    """Protected single-entry delete for moderation. Disabled unless ADMIN_TOKEN is set."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    if not admin_token:
        raise HTTPException(status_code=503, detail="Admin delete is disabled.")
    if not x_admin_token or not secrets.compare_digest(x_admin_token, admin_token):
        raise HTTPException(status_code=403, detail="Invalid admin token.")
    result = await db.leaderboard.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Score not found")
    return {"deleted": True, "id": entry_id}


# Keep the original status endpoints for compatibility
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
