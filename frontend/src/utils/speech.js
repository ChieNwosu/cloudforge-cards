// Browser-native text to speech helper for CloudForge Cards read-aloud.
// No external APIs, no audio files, no microphone, no speech recognition.
// A tiny pub/sub tracks which button is currently speaking so only one
// button shows the Stop state at a time.

let subscribers = new Set();
let activeId = null;

// Professor Flock voice style profiles. Professor is brisk, articulate, and
// slightly higher for a scholarly, lecturing tone. Calm is slower, lower, and
// softer for relaxed review. Both stay fully browser-native.
export const VOICE_STYLES = ["Professor", "Calm", "Default"];
const STYLE_PROFILES = {
  Professor: { rate: 0.97, pitch: 1.08, volume: 1 },
  Calm: { rate: 0.82, pitch: 0.9, volume: 0.9 },
  Default: { rate: 1, pitch: 1, volume: 1 },
};

// Per-style voice name preferences. Professor leans toward firmer, more
// authoritative voices; Calm leans toward warmer, softer ones. Matched
// case-insensitively by name, English voices only.
const STYLE_VOICE_PREF = {
  Professor: ["guy", "alex", "microsoft guy", "daniel", "matthew", "google uk english male"],
  Calm: ["samantha", "aria", "jenny", "microsoft aria", "ava", "karen", "google us english"],
  Default: [],
};

// Preferred natural-sounding voices, matched case-insensitively by name.
const PREFERRED_VOICE_NAMES = [
  "google us english",
  "microsoft aria",
  "microsoft jenny",
  "aria",
  "jenny",
  "guy",
  "samantha",
  "ava",
  "allison",
  "susan",
  "alex",
  "karen",
  "google uk english female",
  "google uk english male",
];

let cachedVoices = [];

function notify() {
  for (const fn of subscribers) {
    try { fn(activeId); } catch (e) { /* one bad subscriber must not break others */ }
  }
}

export function subscribeSpeaking(fn) {
  subscribers.add(fn);
  return () => { subscribers.delete(fn); };
}

export function getActiveSpeakingId() {
  return activeId;
}

export function isSpeechSupported() {
  return typeof window !== "undefined"
    && "speechSynthesis" in window
    && typeof window.SpeechSynthesisUtterance !== "undefined";
}

function loadVoices() {
  if (!isSpeechSupported()) return [];
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    if (voices.length) cachedVoices = voices;
  } catch (e) {
    console.warn("CloudForge read-aloud: could not load voices", e);
  }
  return cachedVoices;
}

// Voices often load asynchronously. Prime the cache and listen for updates.
if (isSpeechSupported()) {
  try {
    loadVoices();
    if (typeof window.speechSynthesis.addEventListener === "function") {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  } catch (e) {
    console.warn("CloudForge read-aloud: voice loading setup failed", e);
  }
}

function pickVoice(style = "Professor") {
  const voices = (cachedVoices && cachedVoices.length) ? cachedVoices : loadVoices();
  if (!voices.length) return null;

  const isEnglish = (v) => v.lang && v.lang.toLowerCase().startsWith("en");
  const byNeedle = (needle) =>
    voices.find((v) => v.name && v.name.toLowerCase().includes(needle));

  // 0. Style-specific preferred voices come first so Professor and Calm sound distinct.
  const stylePrefs = STYLE_VOICE_PREF[style] || [];
  for (const name of stylePrefs) {
    const found = byNeedle(name);
    if (found && isEnglish(found)) return found;
  }

  // 1. Any English Natural or Neural voice reads the smoothest.
  const naturalNeural = voices.find(
    (v) => isEnglish(v) && /natural|neural/i.test(v.name || "")
  );
  if (naturalNeural) return naturalNeural;

  // 2. Preferred voices by name.
  for (const name of PREFERRED_VOICE_NAMES) {
    const found = byNeedle(name);
    if (found) return found;
  }

  // 3. An en-US local service voice.
  const enUsLocal = voices.find(
    (v) => v.lang && v.lang.toLowerCase() === "en-us" && v.localService
  );
  if (enUsLocal) return enUsLocal;

  // 4. First en-US voice, then first English voice.
  const enUs = voices.find((v) => v.lang && v.lang.toLowerCase() === "en-us");
  if (enUs) return enUs;
  const en = voices.find(isEnglish);
  if (en) return en;

  // 5. Fall back to the browser default.
  return null;
}

// Transform ONLY the text passed to speech synthesis. The visible UI text,
// grading, content, and stored data are never changed.
export function cleanForSpeech(text) {
  let t = String(text || "");

  // Remove markdown symbols that would sound awkward.
  t = t.replace(/\/{2,}/g, " ");              // heading markers like ///
  t = t.replace(/[*_`#>]+/g, " ");            // emphasis, code, headings, quotes
  t = t.replace(/(^|\s)[•·▪◦]\s*/g, "$1");    // bullet glyphs

  // Read common exam codes more clearly.
  t = t.replace(/\bAIF-?C01\b/gi, "A I F C zero one");
  t = t.replace(/\bMLA-?C01\b/gi, "M L A C zero one");
  t = t.replace(/\bCLF-?C02\b/gi, "C L F C zero two");
  t = t.replace(/\bSAA-?C03\b/gi, "S A A C zero three");

  // Slash-heavy phrases read better as words.
  t = t.replace(/\bCLF\s*\/\s*SAA\b/gi, "CLF, SAA");
  t = t.replace(/([A-Za-z0-9])\s*\/\s*([A-Za-z0-9])/g, "$1 or $2");

  // Light pauses after common labels and headings.
  t = t.replace(/\b(Scenario|Question|Prompt|Hint|Correct|Your answer|Answer|Review|Explanation|Pipeline score)\s*:/gi, "$1. ");

  // Collapse repeated whitespace.
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

export function stopSpeech() {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    console.warn("CloudForge read-aloud: could not cancel speech", e);
  }
  if (activeId !== null) {
    activeId = null;
    notify();
  }
}

// Speak the given text. Stops any current speech first. Ignores empty or
// whitespace-only text. Never throws; returns true only if speech started.
export function speak(text, { id = null, style = "Professor", onend, onerror } = {}) {
  if (!isSpeechSupported()) return false;
  const clean = cleanForSpeech(text);
  if (!clean) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(clean);
    const profile = STYLE_PROFILES[style] || STYLE_PROFILES.Professor;
    utterance.lang = "en-US";
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = profile.volume;

    const voice = pickVoice(style);
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (activeId === id) { activeId = null; notify(); }
      if (onend) onend();
    };
    utterance.onerror = (event) => {
      // "interrupted" and "canceled" are expected when we stop before speaking again.
      const reason = event && event.error;
      if (reason && reason !== "interrupted" && reason !== "canceled") {
        console.warn("CloudForge read-aloud: speech error", reason);
      }
      if (activeId === id) { activeId = null; notify(); }
      if (onerror) onerror(event);
    };

    activeId = id;
    notify();
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.warn("CloudForge read-aloud: failed to speak", e);
    activeId = null;
    notify();
    if (onerror) onerror(e);
    return false;
  }
}
