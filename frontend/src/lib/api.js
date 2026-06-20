import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, timeout: 30000 });

export const dealRound = (scenarioId, handSize = 10, constraintCount = 2) =>
  api.get("/game/deal", {
    params: { hand_size: handSize, constraint_count: constraintCount, scenario_id: scenarioId },
  }).then(r => r.data);

export const scoreRound = (payload) =>
  api.post("/game/score", payload).then(r => r.data);

export const getLeaderboard = () =>
  api.get("/leaderboard").then(r => r.data.entries);

export const submitLeaderboard = (entry) =>
  api.post("/leaderboard", entry).then(r => r.data);

export const getScenarios = () =>
  api.get("/cards/scenarios").then(r => r.data.scenarios);
