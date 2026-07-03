import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2, CheckCircle2, XCircle, ArrowRight, RotateCcw, Workflow,
  Trophy, BookOpen, AlertTriangle, CircleSlash,
} from "lucide-react";
import { getMatchSession, gradeMatch } from "@/lib/api";
import { getLearnTrack } from "@/pages/LearnHub";
import { FlockAvatar } from "@/components/FlockAvatar";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { ShareResultCard } from "@/components/ShareResultCard";
import { toast } from "sonner";

const TRACK_LABEL = { CLF_SAA: "CLF / SAA", AIF: "AIF", MLA: "MLA", MIXED: "Mixed" };
const CONFETTI_COLORS = ["#7E1818", "#D4AF37", "#D32F2F", "#00E676", "#E6C75A"];
const CAT_ICONS = {
  Compute: "▣", Storage: "◧", Database: "◉", Network: "◈",
  Security: "✦", Analytics: "≡", Integration: "⇆", Monitoring: "◐", AI: "✺",
};

const SLOT_STATUS = {
  correct:  { cls: "border-[#00E676]/50 bg-[#00E676]/[0.06]", text: "text-[#00E676]", label: "Correct", Icon: CheckCircle2 },
  misplaced:{ cls: "border-[#D4AF37]/50 bg-[#D4AF37]/[0.06]", text: "text-[#E6C75A]", label: "Right service, wrong slot", Icon: AlertTriangle },
  wrong:    { cls: "border-[#FF6666]/50 bg-[#FF3333]/[0.06]", text: "text-[#FF6666]", label: "Not in this pipeline", Icon: XCircle },
  missing:  { cls: "border-white/15 bg-white/[0.02]",          text: "text-zinc-500", label: "Left empty", Icon: CircleSlash },
};

function readMatchProgress() {
  try { return JSON.parse(localStorage.getItem("cf_match_progress") || "{}"); }
  catch { return {}; }
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 0.5,
    dur: 1.8 + Math.random() * 1.4, color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  })), []);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50" aria-hidden="true" data-testid="match-confetti">
      {pieces.map((p) => (
        <span key={p.id} className="cf-confetti-piece"
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
      ))}
    </div>
  );
}

function useCountUp(target, run) {
  const [val, setVal] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!run) { setVal(target); return undefined; }
    const start = performance.now();
    const dur = 900;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      setVal(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, run]);
  return val;
}

function FlockSays({ children, size = 36 }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <FlockAvatar size={size} className="shrink-0" />
      <p className="text-sm text-zinc-200 leading-relaxed min-w-0 break-words">
        <span className="font-semibold">Professor Flock says:</span> {children}
      </p>
    </div>
  );
}

export default function LearnMatch() {
  const [phase, setPhase] = useState("start"); // start | play | results
  const [track] = useState(getLearnTrack);
  const [exercises, setExercises] = useState([]);
  const [beta, setBeta] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);
  const [placements, setPlacements] = useState({});
  const [selectedTray, setSelectedTray] = useState(null);
  const [graded, setGraded] = useState(null);
  const [grading, setGrading] = useState(false);
  const [history, setHistory] = useState([]);

  const exercise = exercises[idx];

  async function startMatch() {
    setLoading(true);
    try {
      const d = await getMatchSession(track);
      if (!d.exercises?.length) { toast.error("No pipelines available for this track yet."); return; }
      setExercises(d.exercises);
      setBeta(d.beta);
      setIdx(0); setPlacements({}); setSelectedTray(null);
      setGraded(null); setHistory([]);
      setPhase("play");
      window.scrollTo(0, 0);
    } catch {
      toast.error("Could not load Match mode. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleTray(id) {
    if (graded) return;
    setSelectedTray((cur) => (cur === id ? null : id));
  }

  function placeInSlot(slotId) {
    if (graded) return;
    setPlacements((prev) => {
      const next = { ...prev };
      if (selectedTray) {
        for (const k of Object.keys(next)) if (next[k] === selectedTray) delete next[k];
        next[slotId] = selectedTray;
      } else if (next[slotId]) {
        delete next[slotId];
      }
      return next;
    });
    setSelectedTray(null);
  }

  async function submitExercise() {
    setGrading(true);
    try {
      const r = await gradeMatch(exercise.exercise_id, placements);
      setGraded(r);
      setHistory((h) => [...h, { exercise_id: r.exercise_id, title: r.title, partial_score: r.partial_score }]);
      window.scrollTo(0, 0);
    } catch {
      toast.error("Could not grade this pipeline. Try again.");
    } finally {
      setGrading(false);
    }
  }

  function nextExercise() {
    if (idx + 1 >= exercises.length) {
      const scores = [...history];
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b.partial_score, 0) / scores.length) : 0;
      const prog = readMatchProgress();
      const prev = prog[track] || {};
      prog[track] = { last: avg, best: Math.max(prev.best || 0, avg), lastDate: new Date().toISOString() };
      localStorage.setItem("cf_match_progress", JSON.stringify(prog));
      setPhase("results");
      window.scrollTo(0, 0);
      return;
    }
    setIdx((i) => i + 1);
    setPlacements({}); setSelectedTray(null); setGraded(null);
    window.scrollTo(0, 0);
  }

  // ---------------- Start screen ----------------
  if (phase === "start") {
    const prog = readMatchProgress()[track];
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 min-w-0" data-testid="match-start">
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#D32F2F] mb-2">Perpetual Learning</div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight break-words">Match / Fill in the Blank</h1>
        <p className="text-sm font-mono uppercase tracking-[0.16em] text-[#D4AF37] mt-2 mb-5">Forge Your Cloud Mastery</p>

        <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400">Selected track</span>
            <span className="text-sm font-semibold px-3 py-1 rounded-md bg-[#7E1818]/15 border border-[#7E1818]/40 text-[#D89090]" data-testid="match-track-label">
              {TRACK_LABEL[track] || track}
            </span>
          </div>
          <p className="text-sm text-zinc-300 break-words">
            Assemble each AWS architecture pipeline by placing service cards into the labeled slots.
            Tap a service in the tray, then tap a slot to drop it in. Your pipeline is graded on the
            server with partial credit, so getting some slots right still scores.
          </p>
          {prog && (
            <p className="text-xs text-zinc-500 mt-3" data-testid="match-best">
              Best on this track: <span className="text-[#D4AF37] font-mono">{prog.best}</span> percent. Last: <span className="font-mono">{prog.last}</span> percent.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-[#7E1818]/30 bg-[#7E1818]/[0.05] p-4 mb-6">
          <FlockSays>Read the prompt, then build the pipeline left to right. Trust the patterns you learned in Flashcards.</FlockSays>
        </div>

        <button
          onClick={startMatch}
          disabled={loading}
          data-testid="start-match-button"
          className="w-full sm:w-auto bg-[#7E1818] hover:bg-[#A02828] disabled:opacity-60 text-white px-6 py-3 rounded-md font-semibold inline-flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Workflow size={18} />} Start building
        </button>
      </div>
    );
  }

  // ---------------- Results screen ----------------
  if (phase === "results") {
    const avg = history.length ? Math.round(history.reduce((a, b) => a + b.partial_score, 0) / history.length) : 0;
    return <MatchResults avg={avg} history={history} track={track} beta={beta} onRetake={() => setPhase("start")} />;
  }

  // ---------------- Play screen ----------------
  if (!exercise) return null;
  const usedIds = new Set(Object.values(placements));
  const allFilled = exercise.slots.every((s) => placements[s.slot_id]);
  const statusBySlot = graded ? Object.fromEntries(graded.per_slot.map((s) => [s.slot_id, s])) : {};

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-w-0" data-testid="match-play">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2 text-xs text-zinc-400">
        <span data-testid="match-progress-label">Pipeline {idx + 1} of {exercises.length}</span>
        <span className="font-mono">{TRACK_LABEL[track] || track}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-5" data-testid="match-progress-bar">
        <div className="h-full bg-[#7E1818] transition-all duration-300" style={{ width: `${((idx + 1) / exercises.length) * 100}%` }} />
      </div>

      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 sm:p-6 mb-4">
        <h2 className="text-lg sm:text-xl font-bold break-words mb-1" data-testid="match-title">{exercise.title}</h2>
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-sm text-zinc-300 leading-relaxed break-words" data-testid="match-prompt">{exercise.prompt}</p>
          <ReadAloudButton
            text={`${exercise.title}. ${exercise.prompt}`}
            compact
            testid="read-aloud-match-prompt"
            className="shrink-0"
          />
        </div>

        {/* Slots */}
        <div className="space-y-2.5 mb-5" data-testid="match-slots">
          {exercise.slots.map((slot, i) => {
            const placedId = placements[slot.slot_id];
            const placedCard = exercise.tray.find((c) => c.id === placedId);
            const fb = statusBySlot[slot.slot_id];
            const style = fb ? SLOT_STATUS[fb.status] : null;
            return (
              <div key={slot.slot_id} className="flex items-stretch gap-2">
                <div className="hidden sm:grid place-items-center w-8 shrink-0 text-zinc-600 font-mono text-sm">{i + 1}</div>
                <button
                  type="button"
                  onClick={() => placeInSlot(slot.slot_id)}
                  disabled={!!graded}
                  data-testid={`match-slot-${slot.slot_id}`}
                  className={`flex-1 min-w-0 text-left rounded-md border px-3 py-3 transition-colors ${
                    style ? style.cls
                    : placedId ? "border-[#7E1818]/60 bg-[#7E1818]/[0.08]"
                    : selectedTray ? "border-dashed border-[#D4AF37]/60 bg-[#D4AF37]/[0.04] hover:bg-[#D4AF37]/[0.08]"
                    : "border-dashed border-white/15 bg-white/[0.02] hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">{slot.label}</div>
                      {placedCard ? (
                        <div className="font-semibold text-sm truncate" data-testid={`match-slot-${slot.slot_id}-value`}>
                          <span className="text-[#D89090] mr-1">{CAT_ICONS[placedCard.category] || "◆"}</span>{placedCard.title}
                        </div>
                      ) : (
                        <div className="text-sm text-zinc-500 italic">{graded ? "Left empty" : "Tap to place a service"}</div>
                      )}
                    </div>
                    {style && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.1em] shrink-0 ${style.text}`}
                            data-testid={`match-slot-${slot.slot_id}-status`}>
                        <style.Icon size={13} /> {style.label}
                      </span>
                    )}
                  </div>
                  {fb && fb.status !== "correct" && (
                    <div className="text-xs text-[#00E676] mt-1">Correct: {fb.correct_title}</div>
                  )}
                  {!graded && slot.hint && (
                    <div className="text-[11px] text-zinc-600 mt-1 break-words">{slot.hint}</div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Tray */}
        {!graded && (
          <>
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">Service tray · tap to select</div>
            <div className="flex flex-wrap gap-2" data-testid="match-tray">
              {exercise.tray.map((card) => {
                const used = usedIds.has(card.id);
                const sel = selectedTray === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => toggleTray(card.id)}
                    disabled={used}
                    data-testid={`match-tray-${card.id}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm transition-colors ${
                      used ? "opacity-30 cursor-not-allowed border-white/10 bg-white/[0.02]"
                      : sel ? "border-[#D4AF37] bg-[#D4AF37]/15 text-white"
                      : "border-white/15 bg-white/[0.03] text-zinc-200 hover:border-white/30"
                    }`}
                  >
                    <span className="text-[#D89090]">{CAT_ICONS[card.category] || "◆"}</span>
                    {card.title}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Feedback after grading */}
        {graded && (
          <div className="mt-2 rounded-md border border-[#7E1818]/30 bg-[#7E1818]/[0.05] p-4" data-testid="match-feedback">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-[0.16em] text-zinc-400">Pipeline score</span>
              <span className="font-mono font-bold text-lg" data-testid="match-exercise-score">{graded.partial_score}<span className="text-zinc-500 text-sm">%</span> · {graded.correct_count}/{graded.total}</span>
            </div>
            <div className="flex items-start justify-end mb-1">
              <ReadAloudButton text={graded.explanation} compact testid="read-aloud-match-explanation" />
            </div>
            <FlockSays size={28}>{graded.explanation}</FlockSays>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {!graded ? (
          <button
            onClick={submitExercise}
            disabled={grading || !allFilled}
            data-testid="match-submit"
            className="inline-flex items-center gap-2 bg-[#7E1818] hover:bg-[#A02828] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-md font-semibold text-sm"
          >
            {grading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            {allFilled ? "Submit pipeline" : "Fill every slot to submit"}
          </button>
        ) : (
          <button
            onClick={nextExercise}
            data-testid="match-next"
            className="inline-flex items-center gap-2 bg-[#D32F2F] hover:bg-[#A02828] text-white px-6 py-2.5 rounded-md font-semibold text-sm"
          >
            {idx + 1 >= exercises.length ? "See results" : "Next pipeline"} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function MatchResults({ avg, history, track, beta, onRetake }) {
  const strong = avg >= 80;
  const count = useCountUp(avg, true);
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 min-w-0" data-testid="match-results">
      {strong && <Confetti />}

      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-6 mb-5 text-center relative overflow-hidden">
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">Your pipelines, {TRACK_LABEL[track] || track}</div>
        <div className="text-6xl font-bold font-mono tracking-tighter" data-testid="match-results-score">{count}<span className="text-2xl text-zinc-500">%</span></div>
        <div className="text-sm text-zinc-300 mt-2" data-testid="match-results-count">Average across {history.length} pipelines</div>
        <div className="mt-4 flex justify-center"><FlockAvatar size={44} /></div>
        <p className="text-sm text-zinc-300 mt-2 break-words">
          {strong ? "Professor Flock says: Clean wiring. You are connecting AWS services like an architect."
                  : "Professor Flock says: Revisit the misplaced services, then rebuild. Pattern memory is everything."}
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 mb-5" data-testid="match-results-list">
        <div className="text-xs font-mono uppercase tracking-[0.16em] text-zinc-500 mb-3">Per pipeline</div>
        <ul className="space-y-2">
          {history.map((h) => (
            <li key={h.exercise_id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-200 break-words min-w-0 truncate">{h.title}</span>
              <span className={`font-mono font-bold shrink-0 ${h.partial_score >= 67 ? "text-[#00E676]" : h.partial_score >= 34 ? "text-[#E6C75A]" : "text-[#FF6666]"}`}>
                {h.partial_score}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      {beta && (
        <div className="rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06] px-4 py-2.5 mb-5 text-xs text-[#E6C75A]">
          This track has a small pipeline pool for now. More are coming soon.
        </div>
      )}

      <div className="mb-5">
        <ShareResultCard
          testid="share-match"
          result={{ kind: "match", percent: avg, total: history.length }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onRetake} data-testid="match-retake" className="inline-flex items-center justify-center gap-2 bg-[#7E1818] hover:bg-[#A02828] text-white px-5 py-3 rounded-md font-semibold text-sm">
          <RotateCcw size={16} /> Build again
        </button>
        <Link to="/learn/cards" data-testid="match-to-flashcards" className="inline-flex items-center justify-center gap-2 border border-white/15 hover:bg-white/5 text-zinc-200 px-5 py-3 rounded-md font-semibold text-sm">
          <BookOpen size={16} /> Reinforce in Flashcards
        </Link>
        <Link to="/learn" data-testid="match-to-hub" className="inline-flex items-center justify-center gap-2 border border-white/15 hover:bg-white/5 text-zinc-200 px-5 py-3 rounded-md font-semibold text-sm">
          <Trophy size={16} /> Back to Learn hub
        </Link>
      </div>
    </div>
  );
}
