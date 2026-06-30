import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const API_TIMEOUT_MS = 30000;
export const CACHE_DURATION_MS = 60000;

export const api = axios.create({ baseURL: API, timeout: API_TIMEOUT_MS });

export const dealRound = (scenarioId, handSize = 10, constraintCount = 2) =>
  api.get("/game/deal", {
    params: { hand_size: handSize, constraint_count: constraintCount, scenario_id: scenarioId },
  }).then(r => r.data);

export const getSessionScenarios = (rounds = 3) =>
  api.get("/game/session", { params: { rounds } }).then(r => r.data.scenario_ids);

export const scoreRound = (payload) =>
  api.post("/game/score", payload).then(r => r.data);

export const getLeaderboard = () =>
  api.get("/leaderboard").then(r => r.data.entries);

export const submitLeaderboard = (entry) =>
  api.post("/leaderboard", entry).then(r => r.data);

export const deleteLeaderboardEntry = (entryId, ownerToken) =>
  api.delete(`/leaderboard/${encodeURIComponent(entryId)}`, {
    params: ownerToken ? { owner_token: ownerToken } : {},
  }).then(r => r.data);

export const adminDeleteEntry = (entryId, adminToken) =>
  api.delete(`/admin/leaderboard/${encodeURIComponent(entryId)}`, {
    headers: { "X-Admin-Token": adminToken },
  }).then(r => r.data);

export function getOwnerToken() {
  let token = localStorage.getItem("cf_owner_token");
  if (!token) {
    token = (window.crypto?.randomUUID?.() || `o-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem("cf_owner_token", token);
  }
  return token;
}

export const getScenarios = () =>
  api.get("/cards/scenarios").then(r => r.data.scenarios);

export const getLearnCards = () =>
  api.get("/learn/cards").then(r => r.data);

export const getTestSession = (track) =>
  api.get("/learn/test/session", { params: { track } }).then(r => r.data);

export const gradeTest = (track, answers) =>
  api.post("/learn/test/grade", { track, answers }).then(r => r.data);
