// Browser-native text to speech helper for CloudForge Cards read-aloud.
// No external APIs, no audio files, no microphone, no speech recognition.
// A tiny pub/sub tracks which button is currently speaking so only one
// button shows the Stop state at a time.

let subscribers = new Set();
let activeId = null;

function notify() {
  for (const fn of subscribers) {
    try { fn(activeId); } catch (e) { /* ignore subscriber errors */ }
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

export function stopSpeech() {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    /* ignore cancel errors */
  }
  if (activeId !== null) {
    activeId = null;
    notify();
  }
}

// Speak the given text. Stops any current speech first. Ignores empty or
// whitespace-only text. Never throws; returns true only if speech started.
export function speak(text, { id = null, onend, onerror } = {}) {
  if (!isSpeechSupported()) return false;
  const clean = (text || "").trim();
  if (!clean) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(clean);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      if (activeId === id) { activeId = null; notify(); }
      if (onend) onend();
    };
    utterance.onerror = (event) => {
      if (activeId === id) { activeId = null; notify(); }
      if (onerror) onerror(event);
    };
    activeId = id;
    notify();
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    activeId = null;
    notify();
    if (onerror) onerror(e);
    return false;
  }
}
