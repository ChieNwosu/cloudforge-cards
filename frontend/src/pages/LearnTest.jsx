import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, BookOpen, Trophy } from "lucide-react";
import { getTestSession, gradeTest } from "@/lib/api";
import { getLearnTrack } from "@/pages/LearnHub";
import { FlockAvatar } from "@/components/FlockAvatar";
import { toast } from "sonner";

const TRACK_LABEL = { CLF_SAA: "CLF / SAA", AIF: "AIF", MLA: "MLA", MIXED: "Mixed" };
const CONFETTI_COLORS = ["#7E1818", "#D4AF37", "#D32F2F", "#00E676", "#E6C75A"];

function readTestProgress() {
  try { return JSON.parse(localStorage.getItem("cf_test_progress") || "{}"); }
  catch { return {}; }
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    dur: 1.8 + Math.random() * 1.4,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  })), []);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50" aria-hidden="true" data-testid="confetti">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="cf-confetti-piece"
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
        />
      ))}
    </div>
  );
}

function useCountUp(target, run) {
  const [val, setVal] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!run) { setVal(target); return; }
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

export default function LearnTest() {
  const [phase, setPhase] = useState("start"); // start | quiz | results
  const [track] = useState(getLearnTrack);
  const [questions, setQuestions] = useState([]);
  const [beta, setBeta] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [grading, setGrading] = useState(false);

  async function startQuiz() {
    setLoading(true);
    try {
      const d = await getTestSession(track);
      setQuestions(d.questions || []);
      setBeta(d.beta);
      setAnswers({});
      setIdx(0);
      setResult(null);
      setPhase("quiz");
    } catch {
      toast.error("Could not load the quiz. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function pick(qid, optId, multi) {
    setAnswers((prev) => {
      if (!multi) return { ...prev, [qid]: optId };
      const cur = Array.isArray(prev[qid]) ? prev[qid] : [];
      const next = cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId];
      return { ...prev, [qid]: next };
    });
  }

  async function submit() {
    setGrading(true);
    try {
      const payload = questions.map((q) => ({ question_id: q.question_id, selected: answers[q.question_id] ?? null }));
      const r = await gradeTest(track, payload);
      setResult(r);
      // Save local best per track.
      const prog = readTestProgress();
      const prev = prog[track] || {};
      prog[track] = {
        last: r.score,
        best: Math.max(prev.best || 0, r.score),
        lastDate: new Date().toISOString(),
      };
      localStorage.setItem("cf_test_progress", JSON.stringify(prog));
      setPhase("results");
      window.scrollTo(0, 0);
    } catch {
      toast.error("Could not grade the quiz. Try again.");
    } finally {
      setGrading(false);
    }
  }

  if (phase === "start") {
    const prog = readTestProgress()[track];
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 min-w-0" data-testid="test-start">
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#D32F2F] mb-2">Perpetual Learning</div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight break-words">Test Mode</h1>
        <p className="text-sm font-mono uppercase tracking-[0.16em] text-[#D4AF37] mt-2 mb-5">Forge Your Cloud Mastery</p>

        <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400">Selected track</span>
            <span className="text-sm font-semibold px-3 py-1 rounded-md bg-[#7E1818]/15 border border-[#7E1818]/40 text-[#D89090]" data-testid="test-track-label">
              {TRACK_LABEL[track] || track}
            </span>
          </div>
          <p className="text-sm text-zinc-300 break-words">
            A 15-question quiz across multiple choice, true or false, and scenario service selection.
            Your answers are graded on the server, then you get explanations and review areas.
          </p>
          {prog && (
            <p className="text-xs text-zinc-500 mt-3" data-testid="test-best">
              Best on this track: <span className="text-[#D4AF37] font-mono">{prog.best}</span> percent. Last: <span className="font-mono">{prog.last}</span> percent.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-[#7E1818]/30 bg-[#7E1818]/[0.05] p-4 mb-6">
          <FlockSays>Pick your track and test your cloud instincts. Read each scenario and eliminate weak fits.</FlockSays>
        </div>

        <button
          onClick={startQuiz}
          disabled={loading}
          data-testid="start-quiz-button"
          className="w-full sm:w-auto bg-[#7E1818] hover:bg-[#A02828] disabled:opacity-60 text-white px-6 py-3 rounded-md font-semibold inline-flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />} Start quiz
        </button>
      </div>
    );
  }

  if (phase === "quiz") {
    const q = questions[idx];
    if (!q) return null;
    const multi = q.question_type === "scenario_select";
    const sel = answers[q.question_id];
    const isLast = idx === questions.length - 1;
    const answeredCount = questions.filter((x) => {
      const a = answers[x.question_id];
      return Array.isArray(a) ? a.length > 0 : !!a;
    }).length;

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-w-0" data-testid="test-quiz">
        {/* Progress */}
        <div className="flex items-center justify-between mb-2 text-xs text-zinc-400">
          <span data-testid="quiz-progress-label">Question {idx + 1} of {questions.length}</span>
          <span className="font-mono">{answeredCount} answered</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-5" data-testid="quiz-progress-bar">
          <div className="h-full bg-[#7E1818] transition-all duration-300" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 sm:p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] px-2 py-0.5 rounded border border-white/15 text-zinc-400">
              {q.question_type === "mcq" ? "Multiple choice" : q.question_type === "truefalse" ? "True / False" : "Select all that fit"}
            </span>
          </div>
          <p className="text-base sm:text-lg font-medium leading-relaxed break-words mb-4" data-testid="quiz-prompt">{q.prompt}</p>

          <div className="space-y-2" data-testid="quiz-options">
            {q.answer_options.map((opt) => {
              const chosen = multi ? (Array.isArray(sel) && sel.includes(opt.id)) : sel === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => pick(q.question_id, opt.id, multi)}
                  data-testid={`quiz-option-${opt.id}`}
                  className={`w-full text-left px-4 py-3 rounded-md border text-sm transition-colors break-words ${
                    chosen ? "bg-[#7E1818]/15 border-[#7E1818]/60 text-white" : "bg-white/[0.02] border-white/10 text-zinc-300 hover:border-white/25"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className={`grid place-items-center w-4 h-4 ${multi ? "rounded-sm" : "rounded-full"} border ${chosen ? "border-[#D89090] bg-[#7E1818]" : "border-white/30"}`}>
                      {chosen && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {q.professor_flock_hint && (
            <details className="mt-4 group" data-testid="quiz-hint">
              <summary className="cursor-pointer text-xs text-[#D4AF37] select-none">Need a hint from Professor Flock?</summary>
              <div className="mt-2"><FlockSays size={28}>{q.professor_flock_hint}</FlockSays></div>
            </details>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            data-testid="quiz-prev"
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-md border border-white/15 text-zinc-300 disabled:opacity-40 hover:bg-white/5 text-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
          {isLast ? (
            <button
              onClick={submit}
              disabled={grading}
              data-testid="quiz-submit"
              className="inline-flex items-center gap-2 bg-[#7E1818] hover:bg-[#A02828] disabled:opacity-60 text-white px-6 py-2.5 rounded-md font-semibold text-sm"
            >
              {grading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Submit quiz
            </button>
          ) : (
            <button
              onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}
              data-testid="quiz-next"
              className="inline-flex items-center gap-1 bg-[#7E1818] hover:bg-[#A02828] text-white px-5 py-2.5 rounded-md font-semibold text-sm"
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // results
  return <Results result={result} track={track} beta={beta} onRetake={() => setPhase("start")} />;
}

function Results({ result, track, beta, onRetake }) {
  const strong = result.score >= 80;
  const count = useCountUp(result.score, true);
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 min-w-0" data-testid="test-results">
      {strong && <Confetti />}

      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-6 mb-5 text-center relative overflow-hidden">
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">Your score, {TRACK_LABEL[track] || track}</div>
        <div className="text-6xl font-bold font-mono tracking-tighter" data-testid="results-score">{count}<span className="text-2xl text-zinc-500">%</span></div>
        <div className="text-sm text-zinc-300 mt-2" data-testid="results-correct">
          {result.correct_count} of {result.total} correct
        </div>
        <div className="mt-4 flex justify-center">
          <FlockAvatar size={44} />
        </div>
        <p className="text-sm text-zinc-300 mt-2 break-words">
          {strong ? "Professor Flock says: Sharp instincts. You are forging real cloud mastery."
                  : "Professor Flock says: Review the misses, then reinforce them in Learn Flashcards."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="rounded-lg border border-[#00E676]/20 bg-[#00E676]/[0.04] p-4" data-testid="results-strengths">
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-[#00E676] mb-2">Strengths</div>
          {result.strengths.length ? (
            <ul className="text-sm text-zinc-200 space-y-1">{result.strengths.map((s) => <li key={s} className="break-words">· {s}</li>)}</ul>
          ) : <p className="text-sm text-zinc-500">Keep practicing to build clear strengths.</p>}
        </div>
        <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/[0.05] p-4" data-testid="results-review">
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-[#E6C75A] mb-2">Recommended review</div>
          {result.review_areas.length ? (
            <ul className="text-sm text-zinc-200 space-y-1">{result.review_areas.map((s) => <li key={s} className="break-words">· {s}</li>)}</ul>
          ) : <p className="text-sm text-zinc-500">Nothing flagged. Excellent coverage.</p>}
        </div>
      </div>

      {beta && (
        <div className="rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06] px-4 py-2.5 mb-5 text-xs text-[#E6C75A]">
          This track is early beta. More questions are coming soon.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <button onClick={onRetake} data-testid="retake-button" className="inline-flex items-center justify-center gap-2 bg-[#7E1818] hover:bg-[#A02828] text-white px-5 py-3 rounded-md font-semibold text-sm">
          <RotateCcw size={16} /> Retake quiz
        </button>
        <Link to="/learn/cards" data-testid="to-flashcards" className="inline-flex items-center justify-center gap-2 border border-white/15 hover:bg-white/5 text-zinc-200 px-5 py-3 rounded-md font-semibold text-sm">
          <BookOpen size={16} /> Reinforce in Flashcards
        </Link>
      </div>

      {/* Review */}
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Trophy size={18} className="text-[#D4AF37]" /> Review</h2>
      <div className="space-y-3" data-testid="results-review-list">
        {result.per_question.map((p, i) => {
          const optText = (id) => (p.answer_options.find((o) => o.id === id) || {}).text || id;
          return (
            <div key={p.question_id} className="rounded-lg border border-white/10 bg-[#0C0E11] p-4" data-testid={`review-${p.question_id}`}>
              <div className="flex items-start gap-2 mb-2">
                {p.is_correct ? <CheckCircle2 size={16} className="text-[#00E676] shrink-0 mt-0.5" /> : <XCircle size={16} className="text-[#FF6666] shrink-0 mt-0.5" />}
                <p className="text-sm font-medium break-words">{i + 1}. {p.prompt}</p>
              </div>
              <div className="text-xs text-zinc-400 space-y-1 pl-6">
                <div>Your answer: <span className={p.is_correct ? "text-[#00E676]" : "text-[#FF6666]"}>{p.selected.length ? p.selected.map(optText).join(", ") : "No answer"}</span></div>
                {!p.is_correct && <div>Correct: <span className="text-[#00E676]">{p.correct.map(optText).join(", ")}</span></div>}
                <div className="text-zinc-300 break-words pt-1">{p.explanation}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
