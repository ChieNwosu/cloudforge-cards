import { GraduationCap } from "lucide-react";
import { isSpeechSupported } from "@/utils/speech";
import { useVoiceStyle } from "@/hooks/useAudioPreference";

// Small voice style cycler shown next to the audio toggle.
// Cycles Professor, then Calm, then Default. Hidden when speech is unsupported.
export function VoiceStyleToggle({ className = "" }) {
  const supported = isSpeechSupported();
  const { style, cycle } = useVoiceStyle();

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Voice: ${style}`}
      title={`Voice: ${style}. Click to change.`}
      data-testid="voice-style-toggle"
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors ${className}`}
    >
      <GraduationCap size={16} />
      <span className="whitespace-nowrap">Voice: {style}</span>
    </button>
  );
}
