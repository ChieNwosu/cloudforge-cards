import { useCallback, useEffect, useState } from "react";

// Persisted global audio preference for read-aloud.
// key: cloudforge_audio_muted, values: "true" | "false", default: false (not muted).
const KEY = "cloudforge_audio_muted";
const EVENT = "cf-audio-pref-change";

function readMuted() {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch (e) {
    return false;
  }
}

export function useAudioPreference() {
  const [muted, setMutedState] = useState(readMuted);

  useEffect(() => {
    const sync = () => setMutedState(readMuted());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setMuted = useCallback((value) => {
    try {
      localStorage.setItem(KEY, value ? "true" : "false");
    } catch (e) {
      /* ignore storage errors, keep in-memory state */
    }
    setMutedState(value);
    try {
      window.dispatchEvent(new Event(EVENT));
    } catch (e) {
      /* ignore event errors */
    }
  }, []);

  const toggle = useCallback(() => {
    setMuted(!readMuted());
  }, [setMuted]);

  return { muted, setMuted, toggle };
}
