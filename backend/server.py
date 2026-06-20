from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

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
    """Deal a randomized round: 1 scenario, N constraint chips, M service cards."""
    hand_size = max(6, min(14, hand_size))
    constraint_count = max(1, min(4, constraint_count))

    if scenario_id:
        scenario = next((s for s in SCENARIOS if s["id"] == scenario_id), None)
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
    else:
        scenario = secrets.choice(SCENARIOS)

    rng = secrets.SystemRandom()
    constraints = rng.sample(CONSTRAINTS, k=min(constraint_count, len(CONSTRAINTS)))
    hand = rng.sample(SERVICE_CARDS, k=min(hand_size, len(SERVICE_CARDS)))
    return {"scenario": scenario, "constraints": constraints, "hand": hand}


@api_router.post("/game/score")
async def score_endpoint(req: ScoreRequest):
    if not (3 <= len(req.selected_service_ids) <= 6):
        raise HTTPException(status_code=400,
                            detail="Select between 3 and 6 service cards.")
    score = None
    try:
        score = score_round(req.scenario_id, req.constraint_ids,
                            req.selected_service_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    commentary = await generate_commentary(score, req.explanation or "")
    return {**score, "commentary": commentary, "explanation": req.explanation or ""}


@api_router.get("/leaderboard")
async def get_leaderboard(limit: int = 20):
    docs = await db.leaderboard.find({}, {"_id": 0}).sort("total_score", -1).to_list(limit)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return {"entries": docs}


@api_router.post("/leaderboard", response_model=LeaderboardEntry)
async def add_leaderboard(entry: LeaderboardCreate):
    if not entry.name or not entry.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    obj = LeaderboardEntry(name=entry.name.strip()[:32],
                           total_score=round(entry.total_score, 1),
                           rounds=entry.rounds)
    doc = obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.leaderboard.insert_one(doc)
    return obj


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
