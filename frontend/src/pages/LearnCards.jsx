import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, RotateCw, Check, Bookmark, Trash2, Loader2, Award } from "lucide-react";
import { getLearnCards } from "@/lib/api";
import { getLearnTrack } from "@/pages/LearnHub";
import { FlockAvatar } from "@/components/FlockAvatar";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import {
  loadProgress, recordCardMark, resetProgress, isDueToday, migrateLegacyProgress,
} from "@/utils/studyProgress";
import { toast } from "sonner";

const TRACKS = [
  { id: "CLF_SAA", label: "CLF / SAA" },
  { id: "AIF", label: "AIF" },
  { id: "MLA", label: "MLA" },
  { id: "DEA", label: "DEA" },
  { id: "MIXED", label: "Mixed" },
];

const MASTERY_FILTERS = ["All", "Due Today", "New", "Review", "Known", "Mastered"];

const CAT_ICONS = {
  Compute: "▣", Storage: "◧", Database: "◉", Network: "◈",
  Security: "✦", Analytics: "≡", Integration: "⇆", Monitoring: "◐", AI: "✺",
};

export default function LearnCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState(getLearnTrack);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [masteryFilter, setMasteryFilter] = useState("All");
  const [flipped, setFlipped] = useState(() => new Set());
  const [progress, setProgress] = useState(() => migrateLegacyProgress());

  useEffect(() => {
    let cancelled = false;
    getLearnCards()
      .then((d) => { if (!cancelled) setCards(d.cards || []); })
      .catch(() => { if (!cancelled) setCards([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onChange = () => setProgress(loadProgress());
    window.addEventListener("cf-progress-change", onChange);
    return () => window.removeEventListener("cf-progress-change", onChange);
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(cards.map((c) => c.category))).sort()],
    [cards]
  );

  const cardState = useCallback((id) => progress.mastery[id] || "new", [progress]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      const trackOk = track === "MIXED" || (c.exam_tracks || []).includes(track);
      const catOk = category === "All" || c.category === category;
      const qOk = !q || c.title.toLowerCase().includes(q);
      const state = progress.mastery[c.id] || "new";
      let masteryOk = true;
      if (masteryFilter === "Due Today") masteryOk = isDueToday(c.id, progress);
      else if (masteryFilter === "New") masteryOk = state === "new";
      else if (masteryFilter === "Review") masteryOk = state === "review";
      else if (masteryFilter === "Known") masteryOk = state === "known";
      else if (masteryFilter === "Mastered") masteryOk = state === "mastered";
      return trackOk && catOk && qOk && masteryOk;
    });
  }, [cards, track, category, query, masteryFilter, progress]);

  function pickTrack(id) {
    setTrack(id);
    localStorage.setItem("cf_learn_track", id);
  }

  const toggleFlip = useCallback((id) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  function setMark(id, mark) {
    const res = recordCardMark(id, mark);
    setProgress(loadProgress());
    if (res.xpEarned > 0) {
      toast.success(`+${res.xpEarned} XP`, { description: res.state === "mastered" ? "Mastered!" : `Marked ${res.state}.` });
    } else if (res.cleared) {
      toast.message("Mark cleared.");
    } else if (res.state === "mastered") {
      toast.success("Mastered!");
    }
  }

  function clearProgress() {
    if (!window.confirm("Reset all local study progress? This clears your XP, streak, and mastery marks, and cannot be undone.")) return;
    resetProgress();
    setProgress(loadProgress());
    toast.success("Study progress reset.");
  }

  const states = Object.values(progress.mastery);
  const knownCount = states.filter((v) => v === "known").length;
  const reviewCount = states.filter((v) => v === "review").length;
  const masteredCount = states.filter((v) => v === "mastered").length;
  const isBetaTrack = track === "AIF" || track === "MLA" || track === "DEA";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-w-0" data-testid="learn-cards-page">
      <div className="flex items-start gap-3 mb-5">
        <FlockAvatar size={48} className="shrink-0 hidden sm:block" />
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight break-words">Learn Flashcards</h1>
          <p className="text-sm text-zinc-400 mt-1 break-words">
            Tap a card to flip it. Mark cards as known or for review as you study.
          </p>
        </div>
      </div>

      {/* Track selector */}
      <div className="mb-3">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Exam track</div>
        <div className="flex flex-wrap gap-2" data-testid="cards-track-selector">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              onClick={() => pickTrack(t.id)}
              data-testid={`cards-track-${t.id}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                track === t.id
                  ? "bg-[#7E1818] border-[#7E1818] text-white"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search service name"
          data-testid="cards-search"
          className="w-full min-w-0 bg-[#121417] border border-white/10 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#7E1818]"
        />
      </div>

      {/* Category filter (touch-scrollable) */}
      <div className="mb-3">
        <div className="md:hidden flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-600 mb-1.5">
          Swipe categories
        </div>
        <div className="relative">
          <div className="cf-hscroll flex gap-1.5 pb-2" data-testid="cards-category-filters">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                data-testid={`cards-filter-${c.toLowerCase()}`}
                className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-[0.1em] whitespace-nowrap border transition-colors ${
                  category === c
                    ? "bg-[#7E1818] border-[#7E1818] text-white"
                    : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#090A0B] to-transparent" aria-hidden="true" />
        </div>
      </div>

      {/* Mastery filter */}
      <div className="mb-3">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Study filter</div>
        <div className="cf-hscroll flex gap-1.5 pb-1" data-testid="mastery-filters">
          {MASTERY_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setMasteryFilter(f)}
              data-testid={`mastery-filter-${f.toLowerCase().replace(/\s+/g, "-")}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap border transition-colors ${
                masteryFilter === f
                  ? "bg-[#7E1818] border-[#7E1818] text-white"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Progress summary */}
      <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-zinc-400" data-testid="progress-summary">
        <span>Showing <span className="text-white font-mono">{visible.length}</span> cards</span>
        <span className="text-[#00E676]">Known: <span className="font-mono">{knownCount}</span></span>
        <span className="text-[#D4AF37]">Review: <span className="font-mono">{reviewCount}</span></span>
        <span className="text-[#00E676] inline-flex items-center gap-1"><Award size={12} /> Mastered: <span className="font-mono">{masteredCount}</span></span>
        {(knownCount > 0 || reviewCount > 0 || masteredCount > 0) && (
          <button
            onClick={clearProgress}
            data-testid="clear-progress-button"
            className="inline-flex items-center gap-1 text-[#FF6666] hover:text-[#FF3333]"
          >
            <Trash2 size={13} /> Reset progress
          </button>
        )}
      </div>

      {isBetaTrack && (
        <div className="rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06] px-4 py-2.5 mb-5 text-xs text-[#E6C75A]" data-testid="beta-note">
          Early beta content for this track. More {track} cards are coming soon.
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center h-40 text-zinc-500">
          <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading cards...</div>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-10 text-center text-zinc-400" data-testid="no-cards">
          No cards match your filters yet. Try a different track or search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="flashcard-grid">
          {visible.map((card) => (
            <FlashCard
              key={card.id}
              card={card}
              flipped={flipped.has(card.id)}
              onFlip={() => toggleFlip(card.id)}
              state={cardState(card.id)}
              due={isDueToday(card.id, progress)}
              onMark={(m) => setMark(card.id, m)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FlashCard({ card, flipped, onFlip, state, due, onMark }) {
  const readText = flipped ? card.flashcard_back : card.flashcard_front;
  const knownActive = state === "known" || state === "mastered";
  const badge = state === "mastered"
    ? { text: "mastered", cls: "border-[#00E676]/50 text-[#00E676] bg-[#00E676]/10" }
    : state === "known"
    ? { text: "known", cls: "border-[#00E676]/40 text-[#00E676]" }
    : state === "review"
    ? { text: "review", cls: "border-[#D4AF37]/40 text-[#E6C75A]" }
    : null;
  return (
    <div className="relative h-[340px] [perspective:1200px]" data-testid={`flashcard-${card.id}`}>
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
        {due && (
          <span className="text-[9px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 rounded border border-[#E6C75A]/40 text-[#E6C75A] bg-[#0C0E11]/80 backdrop-blur" data-testid={`due-badge-${card.id}`}>
            due
          </span>
        )}
        <ReadAloudButton
          text={readText}
          compact
          testid={`read-aloud-flashcard-${card.id}`}
          className="bg-[#0C0E11]/80 backdrop-blur"
        />
      </div>
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* Front */}
        <button
          type="button"
          onClick={onFlip}
          data-testid={`flashcard-front-${card.id}`}
          className="absolute inset-0 [backface-visibility:hidden] text-left rounded-lg border border-white/10 bg-[#0C0E11] p-5 flex flex-col hover:border-[#7E1818]/60 transition-colors"
        >
          <div className="flex items-center justify-between mb-3 pr-10">
            <span className="text-2xl text-[#7E1818]">{CAT_ICONS[card.category] || "◆"}</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-500">{card.category}</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight break-words">{card.flashcard_front}</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(card.tags || []).slice(0, 4).map((t) => (
              <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-zinc-400">{t}</span>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-1 text-xs text-zinc-500">
            <RotateCw size={13} /> Tap to flip
          </div>
          {badge && (
            <span className={`absolute bottom-4 right-4 text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded border ${badge.cls}`}>
              {badge.text}
            </span>
          )}
        </button>

        {/* Back */}
        <div
          data-testid={`flashcard-back-${card.id}`}
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border border-[#7E1818]/40 bg-[#0C0E11] p-4 flex flex-col"
        >
          <button type="button" onClick={onFlip} className="text-left mb-2 flex items-center justify-between pr-10">
            <span className="font-bold break-words">{card.title}</span>
            <RotateCw size={14} className="text-zinc-500 shrink-0" />
          </button>
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
            <p className="text-zinc-300 leading-relaxed break-words">{card.flashcard_back}</p>
            {card.use_cases?.length > 0 && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 mb-1">Use cases</div>
                <ul className="space-y-0.5 text-zinc-300">
                  {card.use_cases.map((u) => <li key={u} className="break-words">· {u}</li>)}
                </ul>
              </div>
            )}
            {card.common_pairings?.length > 0 && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 mb-1">Common pairings</div>
                <div className="flex flex-wrap gap-1">
                  {card.common_pairings.map((p) => (
                    <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">{p.title}</span>
                  ))}
                </div>
              </div>
            )}
            {card.anti_patterns?.length > 0 && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#FF6666] mb-1">Anti-patterns</div>
                <ul className="space-y-0.5 text-zinc-400">
                  {card.anti_patterns.map((a) => <li key={a} className="break-words">· {a}</li>)}
                </ul>
              </div>
            )}
            {card.study_tip && (
              <div className="border-t border-white/5 pt-2">
                <FlockAvatar size={28} className="float-left mr-2" />
                <p className="text-zinc-300 leading-relaxed break-words">
                  <span className="font-semibold text-zinc-200">Professor Flock says: </span>{card.study_tip}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-3 mt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => onMark("known")}
              data-testid={`mark-known-${card.id}`}
              className={`flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-semibold border transition-colors ${
                knownActive ? "bg-[#00E676]/15 border-[#00E676]/50 text-[#00E676]" : "border-white/15 text-zinc-300 hover:bg-white/5"
              }`}
            >
              <Check size={13} /> {state === "mastered" ? "Mastered" : state === "known" ? "Master" : "Known"}
            </button>
            <button
              type="button"
              onClick={() => onMark("review")}
              data-testid={`mark-review-${card.id}`}
              className={`flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-semibold border transition-colors ${
                state === "review" ? "bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#E6C75A]" : "border-white/15 text-zinc-300 hover:bg-white/5"
              }`}
            >
              <Bookmark size={13} /> Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
