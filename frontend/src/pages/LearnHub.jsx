import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, Workflow, GraduationCap, ArrowRight, Flame, Star, Award, Clock, RotateCcw } from "lucide-react";
import { FlockAvatar } from "@/components/FlockAvatar";
import { getSummary, resetProgress, migrateLegacyProgress } from "@/utils/studyProgress";
import { toast } from "sonner";

const TRACKS = [
  { id: "CLF_SAA", label: "CLF / SAA", status: "Strongest", desc: "Cloud foundations and architecture service selection. Best current coverage." },
  { id: "AIF", label: "AIF", status: "Expanding", desc: "AI, ML, generative AI, responsible AI, and AWS AI service concepts." },
  { id: "MLA", label: "MLA", status: "Expanding", desc: "Machine learning engineering, SageMaker workflows, deployment, monitoring, and MLOps." },
  { id: "DEA", label: "DEA", status: "Expanding", desc: "Data ingestion, transformation, orchestration, data lakes, warehouses, governance, and quality." },
  { id: "MIXED", label: "Mixed", status: "Mixed", desc: "Combined review across all available study tracks." },
];

const STATUS_STYLES = {
  Strongest: "bg-[#00E676]/15 border-[#00E676]/40 text-[#00E676]",
  Expanding: "bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#E6C75A]",
  Mixed: "bg-white/10 border-white/20 text-zinc-300",
};

export function getLearnTrack() {
  return localStorage.getItem("cf_learn_track") || "CLF_SAA";
}

export default function LearnHub() {
  const [track, setTrack] = useState(getLearnTrack);
  const [summary, setSummary] = useState(getSummary);
  const activeTrack = TRACKS.find((t) => t.id === track) || TRACKS[0];

  useEffect(() => {
    migrateLegacyProgress();
    setSummary(getSummary());
    const onChange = () => setSummary(getSummary());
    window.addEventListener("cf-progress-change", onChange);
    return () => window.removeEventListener("cf-progress-change", onChange);
  }, []);

  function handleReset() {
    if (!window.confirm("Reset all local study progress? This clears your XP, streak, and mastery marks, and cannot be undone.")) return;
    resetProgress();
    setSummary(getSummary());
    toast.success("Study progress reset.");
  }

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
          <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#D32F2F] mb-2">Certification Prep</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight break-words">Forge Your Cloud Mastery</h1>
          <p className="text-zinc-400 mt-3 max-w-2xl break-words">
            Your certification prep center for CLF/SAA, AIF, MLA, and DEA. Pick a track, then study
            flashcards, take server-graded Test Mode quizzes, and practice Match Mode pipelines. No
            score, no pressure, just focused review.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-4 mb-8 text-xs text-zinc-500 leading-relaxed" data-testid="cert-disclaimer">
        CloudForge Cards is an unofficial, student-built learning tool. Content is original and
        intended for practice and review, not official AWS exam material.
      </div>

      <div className="rounded-lg border border-[#7E1818]/30 bg-[#7E1818]/[0.05] p-4 mb-8">
        <div className="flex items-start gap-3">
          <FlockAvatar size={40} className="shrink-0" testid="learn-onboard-flock" />
          <p className="text-sm text-zinc-200 leading-relaxed min-w-0 break-words" data-testid="learn-onboard-copy">
            <span className="font-semibold">Professor Flock says:</span> Pick a track, then build your study deck.
          </p>
        </div>
      </div>

      {/* Study progress panel */}
      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 mb-8" data-testid="study-progress-panel">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">Your study progress</div>
          <button
            onClick={handleReset}
            data-testid="reset-progress-button"
            className="inline-flex items-center gap-1.5 text-xs text-[#FF6666] hover:text-[#FF3333] transition-colors"
          >
            <RotateCcw size={13} /> Reset progress
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-md border border-white/10 bg-[#121417] p-3" data-testid="stat-streak">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-500 mb-1"><Flame size={12} className="text-[#FF8A33]" /> Streak</div>
            <div className="text-xl font-bold font-mono">{summary.currentStreak}<span className="text-xs text-zinc-500 ml-1">d</span></div>
            <div className="text-[10px] text-zinc-600 mt-0.5">Best {summary.longestStreak}d</div>
          </div>
          <div className="rounded-md border border-white/10 bg-[#121417] p-3" data-testid="stat-xp">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-500 mb-1"><Star size={12} className="text-[#D4AF37]" /> XP</div>
            <div className="text-xl font-bold font-mono">{summary.totalXP}</div>
          </div>
          <div className="rounded-md border border-white/10 bg-[#121417] p-3" data-testid="stat-level">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-500 mb-1"><Award size={12} className="text-[#00E676]" /> Level</div>
            <div className="text-xl font-bold font-mono">{summary.level}</div>
          </div>
          <div className="rounded-md border border-white/10 bg-[#121417] p-3" data-testid="stat-mastered">
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-500 mb-1">Mastered</div>
            <div className="text-xl font-bold font-mono text-[#00E676]">{summary.mastered}</div>
            <div className="text-[10px] text-zinc-600 mt-0.5">Known {summary.known} · Review {summary.review}</div>
          </div>
          <div className="rounded-md border border-white/10 bg-[#121417] p-3" data-testid="stat-due">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-500 mb-1"><Clock size={12} className="text-[#E6C75A]" /> Due today</div>
            <div className="text-xl font-bold font-mono text-[#E6C75A]">{summary.dueToday}</div>
          </div>
          <div className="rounded-md border border-white/10 bg-[#121417] p-3" data-testid="stat-sessions">
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-500 mb-1">Sessions</div>
            <div className="text-xl font-bold font-mono">{summary.sessionsCompleted}</div>
          </div>
        </div>
        <p className="text-[11px] text-zinc-600 mt-3">Progress is stored only in this browser. There is no account and nothing is uploaded.</p>
      </div>

      {/* Certification track selector */}
      <div className="mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">Certification track</div>
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
        <div className="mt-3 flex items-start gap-2 flex-wrap" data-testid="track-detail">
          <span className={`text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded border shrink-0 ${STATUS_STYLES[activeTrack.status] || STATUS_STYLES.Mixed}`}>
            {activeTrack.status}
          </span>
          <p className="text-sm text-zinc-400 min-w-0 break-words">{activeTrack.desc}</p>
        </div>
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
            Open track-filtered flashcards for CLF/SAA, AIF, MLA, DEA, or Mixed study. Your selected track above scopes the deck.
          </p>
        </Link>
      </div>

      <p className="text-xs text-zinc-500 mt-6 text-center" data-testid="cert-practice-note">
        Content is for practice and review only. It is not official AWS exam material and does not guarantee exam results.
      </p>
    </div>
  );
}
