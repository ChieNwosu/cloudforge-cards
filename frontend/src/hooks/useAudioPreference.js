import { useCallback, useEffect, useState } from "react";

// Persisted global audio preferences for read-aloud.
// Mute:  key cloudforge_audio_muted, values "true" | "false", default false.
// Voice: key cloudforge_voice_style, values Professor | Calm | Default, default Professor.
const MUTE_KEY = "cloudforge_audio_muted";
const MUTE_EVENT = "cf-audio-pref-change";

const STYLE_KEY = "cloudforge_voice_style";
const STYLE_EVENT = "cf-voice-style-change";
const DEFAULT_STYLE = "Professor";
const VALID_STYLES = ["Professor", "Calm", "Default"];

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "true";
  } catch (e) {
    console.warn("CloudForge audio: could not read mute preference", e);
    return false;
  }
}

function readStyle() {
  try {
    const value = localStorage.getItem(STYLE_KEY);
    return VALID_STYLES.includes(value) ? value : DEFAULT_STYLE;
  } catch (e) {
    console.warn("CloudForge audio: could not read voice style", e);
    return DEFAULT_STYLE;
  }
}

export function useAudioPreference() {
  const [muted, setMutedState] = useState(readMuted);

  useEffect(() => {
    const sync = () => setMutedState(readMuted());
    window.addEventListener(MUTE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(MUTE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setMuted = useCallback((value) => {
    try {
      localStorage.setItem(MUTE_KEY, value ? "true" : "false");
    } catch (e) {
      console.warn("CloudForge audio: could not save mute preference", e);
    }
    setMutedState(value);
    try {
      window.dispatchEvent(new Event(MUTE_EVENT));
    } catch (e) {
      console.warn("CloudForge audio: could not broadcast mute change", e);
    }
  }, []);

  const toggle = useCallback(() => {
    setMuted(!readMuted());
  }, [setMuted]);

  return { muted, setMuted, toggle };
}

export function useVoiceStyle() {
  const [style, setStyleState] = useState(readStyle);

  useEffect(() => {
    const sync = () => setStyleState(readStyle());
    window.addEventListener(STYLE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STYLE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setStyle = useCallback((value) => {
    const next = VALID_STYLES.includes(value) ? value : DEFAULT_STYLE;
    try {
      localStorage.setItem(STYLE_KEY, next);
    } catch (e) {
      console.warn("CloudForge audio: could not save voice style", e);
    }
    setStyleState(next);
    try {
      window.dispatchEvent(new Event(STYLE_EVENT));
    } catch (e) {
      console.warn("CloudForge audio: could not broadcast voice style", e);
    }
  }, []);

  const cycle = useCallback(() => {
    const current = readStyle();
    const idx = VALID_STYLES.indexOf(current);
    setStyle(VALID_STYLES[(idx + 1) % VALID_STYLES.length]);
  }, [setStyle]);

  return { style, setStyle, cycle, styles: VALID_STYLES };
}
