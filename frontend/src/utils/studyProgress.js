// Local-only study progress engine for CloudForge Cards.
// No login, no backend, no database. Everything lives in one localStorage object.
// Never throws: all reads and writes are guarded.

const KEY = "cloudforge_learning_progress";

const XP = {
  play3: 30, play5: 50, play10: 100,
  test: 40, match: 35,
  known: 5, review: 3, dueBonus: 8,
};

const DUE_DAYS = { review: 1, known: 3, mastered: 7 };

const MASTERY_ORDER = ["new", "review", "known", "mastered"];

function defaults() {
  return {
    currentStreak: 0, longestStreak: 0, lastStudyDate: null, totalStudyDays: 0,
    totalXP: 0, sessionsCompleted: 0,
    mastery: {}, due: {}, awarded: {},
  };
}

export function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysStr(days, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return todayStr(d);
}

function daysBetween(a, b) {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db - da) / 86400000);
}

export function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && typeof raw === "object") return { ...defaults(), ...raw };
  } catch (e) {
    console.warn("CloudForge progress: could not read, starting fresh", e);
  }
  return defaults();
}

function save(p) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new Event("cf-progress-change"));
  } catch (e) {
    console.warn("CloudForge progress: could not save", e);
  }
  return p;
}

export function levelForXp(xp) {
  return Math.floor((xp || 0) / 250) + 1;
}

// Count today as a study day at most once. Update current and longest streaks.
function markStudyDay(p) {
  const today = todayStr();
  if (p.lastStudyDate === today) return;
  if (p.lastStudyDate && daysBetween(p.lastStudyDate, today) === 1) {
    p.currentStreak += 1;
  } else {
    p.currentStreak = 1;
  }
  p.lastStudyDate = today;
  p.totalStudyDays = (p.totalStudyDays || 0) + 1;
  if (p.currentStreak > (p.longestStreak || 0)) p.longestStreak = p.currentStreak;
}

// Record a completed Play, Test, or Match session. Returns XP earned this call.
export function recordSession(kind, opts = {}) {
  const p = loadProgress();
  let earned = 0;
  if (kind === "play") {
    earned = opts.rounds === 10 ? XP.play10 : opts.rounds === 5 ? XP.play5 : XP.play3;
  } else if (kind === "test") {
    earned = XP.test;
  } else if (kind === "match") {
    earned = XP.match;
  }
  p.totalXP += earned;
  p.sessionsCompleted = (p.sessionsCompleted || 0) + 1;
  markStudyDay(p);
  save(p);
  return { xpEarned: earned, level: levelForXp(p.totalXP), progress: p };
}

// Record a flashcard mark. Awards XP only the first time a card reaches a state.
// Marking a card that is currently due adds a one-per-day due-review bonus.
export function recordCardMark(cardId, requested) {
  const p = loadProgress();
  const today = todayStr();
  const prev = p.mastery[cardId] || "new";
  const wasDue = p.due[cardId] && daysBetween(p.due[cardId], today) >= 0;

  // Toggling the same mark off returns the card to new (no XP change).
  if (prev === requested) {
    p.mastery[cardId] = "new";
    delete p.due[cardId];
    save(p);
    return { xpEarned: 0, cleared: true, state: "new", progress: p };
  }

  // Marking Known on an already-known or mastered card promotes to Mastered.
  let nextState = requested;
  if (requested === "known" && (prev === "known" || prev === "mastered")) {
    nextState = "mastered";
  }

  let earned = 0;
  const awardKey = `${cardId}:${nextState}`;
  const baseXp = nextState === "known" ? XP.known : nextState === "review" ? XP.review : 0;
  if (baseXp > 0 && !p.awarded[awardKey]) {
    earned += baseXp;
    p.awarded[awardKey] = true;
  }

  // Due-review bonus, once per card per calendar day.
  const dueKey = `due:${cardId}:${today}`;
  if (wasDue && !p.awarded[dueKey]) {
    earned += XP.dueBonus;
    p.awarded[dueKey] = true;
  }

  p.mastery[cardId] = nextState;
  const dueDays = DUE_DAYS[nextState] || DUE_DAYS.known;
  p.due[cardId] = addDaysStr(dueDays);
  p.totalXP += earned;
  markStudyDay(p);
  save(p);
  return { xpEarned: earned, state: nextState, progress: p };
}

export function getMastery(cardId) {
  return loadProgress().mastery[cardId] || "new";
}

export function isDueToday(cardId, p = loadProgress()) {
  const due = p.due[cardId];
  if (!due) return false;
  return daysBetween(due, todayStr()) >= 0;
}

export function getSummary() {
  const p = loadProgress();
  const states = Object.values(p.mastery);
  const dueToday = Object.keys(p.due).filter((id) => isDueToday(id, p)).length;
  return {
    currentStreak: p.currentStreak || 0,
    longestStreak: p.longestStreak || 0,
    totalXP: p.totalXP || 0,
    level: levelForXp(p.totalXP),
    known: states.filter((s) => s === "known").length,
    review: states.filter((s) => s === "review").length,
    mastered: states.filter((s) => s === "mastered").length,
    dueToday,
    sessionsCompleted: p.sessionsCompleted || 0,
  };
}

export function resetProgress() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("cf-progress-change"));
  } catch (e) {
    console.warn("CloudForge progress: could not reset", e);
  }
}

export { MASTERY_ORDER };
