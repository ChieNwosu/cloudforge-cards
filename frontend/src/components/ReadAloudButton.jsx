import { useEffect, useId, useState } from "react";
import { Volume2, Square, VolumeX } from "lucide-react";
import { isSpeechSupported, speak, stopSpeech, subscribeSpeaking } from "@/utils/speech";
import { useAudioPreference } from "@/hooks/useAudioPreference";

// Reusable read-aloud control. Feels like Professor Flock reading the content.
// Shows a disabled Audio unavailable state when the browser lacks speech
// synthesis, and a disabled Audio muted state when the global toggle is muted.
export function ReadAloudButton({ text, label = "Read aloud", compact = false, className = "", testid = "read-aloud" }) {
  const id = useId();
  const supported = isSpeechSupported();
  const { muted } = useAudioPreference();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const unsub = subscribeSpeaking((activeId) => setSpeaking(activeId === id));
    return () => { unsub(); };
  }, [id]);

  useEffect(() => {
    if (muted && speaking) stopSpeech();
  }, [muted, speaking]);

  const base = "inline-flex items-center gap-1.5 rounded-md border text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7E1818]/70";
  const pad = compact ? "p-1.5" : "px-2.5 py-1.5";

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        aria-label="Audio unavailable"
        title="Audio unavailable"
        data-testid={`${testid}-unavailable`}
        className={`${base} ${pad} border-white/10 text-zinc-600 opacity-60 cursor-not-allowed ${className}`}
      >
        <VolumeX size={14} />{!compact && <span>Audio unavailable</span>}
      </button>
    );
  }

  if (muted) {
    return (
      <button
        type="button"
        disabled
        aria-label="Audio muted"
        title="Audio muted"
        data-testid={`${testid}-muted`}
        className={`${base} ${pad} border-white/10 text-zinc-500 opacity-70 cursor-not-allowed ${className}`}
      >
        <VolumeX size={14} />{!compact && <span>Audio muted</span>}
      </button>
    );
  }

  function handleClick() {
    if (speaking) { stopSpeech(); return; }
    speak(text, { id });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={speaking ? "Stop" : label}
      aria-pressed={speaking}
      title={speaking ? "Stop" : label}
      data-testid={testid}
      className={`${base} ${pad} ${
        speaking
          ? "border-[#7E1818]/60 bg-[#7E1818]/15 text-[#D89090]"
          : "border-white/15 text-zinc-300 hover:border-[#7E1818]/60 hover:text-white"
      } ${className}`}
    >
      {speaking ? <Square size={14} /> : <Volume2 size={14} />}{!compact && <span>{speaking ? "Stop" : label}</span>}
    </button>
  );
}
