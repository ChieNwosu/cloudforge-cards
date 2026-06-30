import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, Workflow, GraduationCap, ArrowRight } from "lucide-react";
import { FlockAvatar } from "@/components/FlockAvatar";

const TRACKS = [
  { id: "CLF_SAA", label: "CLF / SAA" },
  { id: "AIF", label: "AIF" },
  { id: "MLA", label: "MLA" },
  { id: "MIXED", label: "Mixed" },
];

export function getLearnTrack() {
  return localStorage.getItem("cf_learn_track") || "CLF_SAA";
}

export default function LearnHub() {
  const [track, setTrack] = useState(getLearnTrack);

  function pickTrack(id) {
    setTrack(id);
    localStorage.setItem("cf_learn_track", id);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 min-w-0" data-testid="learn-hub">
      {/* Hero */}
      <div className="flex items-start gap-4 mb-6">
        <FlockAvatar size={64} className="shrink-0 hidden sm:block" testid="learn-hero-flock" />
        <div className="min-w-0">
          <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#D32F2F] mb-2">Perpetual Learning</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight break-words">Forge Your Cloud Mastery</h1>
          <p className="text-zinc-400 mt-3 max-w-2xl break-words">
            Study AWS service cards at your own pace, outside the 3-round game. Flip cards, learn
            pairings, and mark what to review. No score, no pressure.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[#7E1818]/30 bg-[#7E1818]/[0.05] p-4 mb-8">
        <div className="flex items-start gap-3">
          <FlockAvatar size={40} className="shrink-0" testid="learn-onboard-flock" />
          <p className="text-sm text-zinc-200 leading-relaxed min-w-0 break-words" data-testid="learn-onboard-copy">
            <span className="font-semibold">Professor Flock says:</span> Pick a track, then build your study deck.
          </p>
        </div>
      </div>

      {/* Exam track selector */}
      <div className="mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">Exam track</div>
        <div className="flex flex-wrap gap-2" data-testid="track-selector">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              onClick={() => pickTrack(t.id)}
              data-testid={`track-${t.id}`}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                track === t.id
                  ? "bg-[#7E1818] border-[#7E1818] text-white"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Certification Prep is a filter across learning modes, not a separate engine. Your track choice scopes the cards you study.
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="mode-cards">
        <Link
          to="/learn/cards"
          data-testid="mode-learn-cards"
          className="group rounded-lg border border-white/10 bg-[#0C0E11] p-5 hover:border-[#7E1818]/60 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="text-[#D32F2F]" size={22} />
            <ArrowRight className="text-zinc-600 group-hover:text-white transition-colors" size={18} />
          </div>
          <h3 className="font-bold text-lg mb-1">Learn Flashcards</h3>
          <p className="text-sm text-zinc-400 break-words">Flip through AWS service cards, study use cases, pairings, and anti-patterns.</p>
        </Link>

        <Link
          to="/learn/test"
          data-testid="mode-test"
          className="group rounded-lg border border-white/10 bg-[#0C0E11] p-5 hover:border-[#7E1818]/60 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <ClipboardList className="text-[#D32F2F]" size={22} />
            <ArrowRight className="text-zinc-600 group-hover:text-white transition-colors" size={18} />
          </div>
          <h3 className="font-bold text-lg mb-1">Test Mode</h3>
          <p className="text-sm text-zinc-400 break-words">A 15-question quiz with server-graded scoring, explanations, and review areas.</p>
        </Link>
        <Link
          to="/learn/match"
          data-testid="mode-match"
          className="group rounded-lg border border-white/10 bg-[#0C0E11] p-5 hover:border-[#7E1818]/60 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <Workflow className="text-[#D32F2F]" size={22} />
            <ArrowRight className="text-zinc-600 group-hover:text-white transition-colors" size={18} />
          </div>
          <h3 className="font-bold text-lg mb-1">Match / Fill in the Blank</h3>
          <p className="text-sm text-zinc-400 break-words">Assemble AWS architecture pipelines slot by slot. Server-graded with partial credit.</p>
        </Link>

        <Link
          to="/learn/cards"
          data-testid="mode-cert-prep"
          className="group rounded-lg border border-white/10 bg-[#0C0E11] p-5 hover:border-[#D4AF37]/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <GraduationCap className="text-[#D4AF37]" size={22} />
            <ArrowRight className="text-zinc-600 group-hover:text-white transition-colors" size={18} />
          </div>
          <h3 className="font-bold text-lg mb-1">Certification Prep</h3>
          <p className="text-sm text-zinc-400 break-words">
            Open track-filtered flashcards for CLF/SAA, AIF, MLA, or Mixed study. Your selected track above scopes the deck.
          </p>
        </Link>
      </div>
    </div>
  );
}
