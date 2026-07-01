import { Volume2, VolumeX } from "lucide-react";
import { isSpeechSupported, stopSpeech } from "@/utils/speech";
import { useAudioPreference } from "@/hooks/useAudioPreference";

// Global Audio: On / Audio: Muted toggle. Hidden when the browser has no
// speech synthesis, since read-aloud buttons already show Audio unavailable.
export function AudioToggle({ className = "" }) {
  const supported = isSpeechSupported();
  const { muted, toggle } = useAudioPreference();

  if (!supported) return null;

  function handleClick() {
    if (!muted) stopSpeech();
    toggle();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={muted ? "Audio: Muted" : "Audio: On"}
      aria-pressed={muted}
      data-testid="audio-toggle"
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
        muted
          ? "border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
          : "border-[#7E1818]/50 text-[#D89090] hover:bg-[#7E1818]/10"
      } ${className}`}
    >
      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      <span className="whitespace-nowrap">{muted ? "Audio: Muted" : "Audio: On"}</span>
    </button>
  );
}
