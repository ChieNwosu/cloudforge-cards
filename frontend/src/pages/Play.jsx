import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, RotateCcw, Send, Trophy } from "lucide-react";
import { dealRound, scoreRound, submitLeaderboard } from "@/lib/api";
import ServiceCard from "@/components/ServiceCard";
import ConstraintChip from "@/components/ConstraintChip";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { toast } from "sonner";

const TOTAL_ROUNDS = 3;
const MAX_SELECT = 6;
const MIN_SELECT = 3;

export default function Play() {
  const [round, setRound] = useState(1);
  const [data, setData] = useState(null);          // {scenario, constraints, hand}
  const [selected, setSelected] = useState([]);    // service ids
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);      // current round result
  const [history, setHistory] = useState([]);      // [{round, total, scenario}]
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const sessionDone = round > TOTAL_ROUNDS;
  const sessionTotal = history.reduce((sum, h) => sum + h.total, 0);

  async function deal() {
    setLoading(true);
    setResult(null);
    setSelected([]);
    setExplanation("");
    try {
      const d = await dealRound(null, 10, 2);
      setData(d);
    } catch (e) {
      toast.error("Failed to deal a round. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionDone) deal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  function toggleCard(id) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_SELECT) {
        toast.warning(`Max ${MAX_SELECT} services per round.`);
        return prev;
      }
      return [...prev, id];
    });
  }

  async function submitRound() {
    if (selected.length < MIN_SELECT) {
      toast.warning(`Pick at least ${MIN_SELECT} services.`);
      return;
    }
    setScoring(true);
    try {
      const res = await scoreRound({
        scenario_id: data.scenario.id,
        constraint_ids: data.constraints.map(c => c.id),
        selected_service_ids: selected,
        explanation,
      });
      setResult(res);
      setHistory(h => [...h, { round, total: res.total, scenario: data.scenario.title }]);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Scoring failed.");
    } finally {
      setScoring(false);
    }
  }

  function nextRound() {
    setRound(r => r + 1);
  }

  function resetSession() {
    setRound(1);
    setHistory([]);
    setResult(null);
    setSubmitted(false);
    setName("");
  }

  async function saveScore() {
    if (!name.trim()) {
      toast.warning("Enter a name to save your score.");
      return;
    }
    try {
      await submitLeaderboard({
        name: name.trim(),
        total_score: sessionTotal,
        rounds: TOTAL_ROUNDS,
      });
      setSubmitted(true);
      toast.success("Saved to leaderboard!");
    } catch (e) {
      toast.error("Could not save score.");
    }
  }

  if (sessionDone) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-8 cf-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-[#FFD500]" />
            <h1 className="text-3xl font-bold">Session complete</h1>
          </div>
          <p className="text-zinc-400 mb-8">Best-of-{TOTAL_ROUNDS} finished. Here's your tally:</p>

          <div className="grid sm:grid-cols-3 gap-3 mb-6" data-testid="session-history">
            {history.map(h => (
              <div key={h.round} className="border border-white/10 rounded-lg p-4 bg-[#121417]">
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">Round {h.round}</div>
                <div className="text-2xl font-bold font-mono">{h.total}</div>
                <div className="text-xs text-zinc-400 mt-1 truncate">{h.scenario}</div>
              </div>
            ))}
          </div>

          <div className="border border-[#0055FF]/40 cf-glow rounded-lg p-6 mb-8">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-400 mb-1">Session total</div>
            <div className="text-5xl font-bold font-mono" data-testid="session-total">{sessionTotal.toFixed(1)}</div>
          </div>

          {!submitted && (
            <div className="flex gap-3 mb-4">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name for the leaderboard"
                data-testid="leaderboard-name-input"
                className="flex-1 bg-[#121417] border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0055FF]"
                maxLength={32}
              />
              <button
                onClick={saveScore}
                data-testid="save-score-button"
                className="bg-[#0055FF] hover:bg-[#3377FF] text-white px-5 py-3 rounded-md font-semibold inline-flex items-center gap-2"
              >
                <Send size={16} /> Save score
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={resetSession}
              data-testid="play-again-button"
              className="bg-[#0055FF] hover:bg-[#3377FF] text-white px-5 py-3 rounded-md font-semibold inline-flex items-center gap-2"
            >
              <RotateCcw size={16} /> Play again
            </button>
            <Link
              to="/leaderboard"
              data-testid="view-leaderboard-link"
              className="border border-white/15 hover:border-white/30 hover:bg-white/5 text-white px-5 py-3 rounded-md font-semibold"
            >
              View leaderboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8" data-testid="play-page">
      {/* Top bar: round progress */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500">
            Best of {TOTAL_ROUNDS}
          </div>
          <h2 className="text-2xl font-semibold mt-1" data-testid="round-title">Round {round} / {TOTAL_ROUNDS}</h2>
        </div>
        <div className="flex gap-1.5" data-testid="round-progress">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
            const past = history.find(h => h.round === i + 1);
            return (
              <div
                key={i}
                className={`px-3 py-1.5 rounded-md text-xs font-mono ${
                  past ? "bg-[#0055FF]/15 border border-[#0055FF]/40 text-[#5C8CFF]"
                  : i + 1 === round ? "bg-white/10 border border-white/15 text-white"
                  : "bg-white/[0.02] border border-white/10 text-zinc-600"
                }`}
              >
                R{i + 1}{past ? ` · ${past.total}` : ""}
              </div>
            );
          })}
        </div>
      </div>

      {loading || !data ? (
        <div className="grid place-items-center h-64 text-zinc-500">
          <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Dealing cards…</div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Side panel: scenario + constraints */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-6 cf-fade-up" data-testid="scenario-card">
              <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#FFD500] mb-2">Scenario</div>
              <h3 className="text-xl font-bold mb-3">{data.scenario.title}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">{data.scenario.prompt}</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-500 border-t border-white/5 pt-3">
                <div>min: <span className="text-white">{data.scenario.min_services}</span></div>
                <div>max: <span className="text-white">{data.scenario.max_services}</span></div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-6 cf-fade-up">
              <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">Constraints</div>
              <div className="flex flex-wrap gap-2">
                {data.constraints.map(c => <ConstraintChip key={c.id} constraint={c} />)}
              </div>
            </div>

            {!result ? (
              <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-6 cf-fade-up">
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">
                  Selected · {selected.length}/{MAX_SELECT}
                </div>
                <textarea
                  value={explanation}
                  onChange={e => setExplanation(e.target.value)}
                  placeholder="(optional) Briefly explain why this architecture solves the scenario…"
                  rows={4}
                  data-testid="explanation-input"
                  className="w-full bg-[#121417] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0055FF] resize-none"
                />
                <button
                  onClick={submitRound}
                  disabled={scoring || selected.length < MIN_SELECT}
                  data-testid="submit-round-button"
                  className="w-full mt-3 bg-[#0055FF] hover:bg-[#3377FF] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-md font-semibold inline-flex items-center justify-center gap-2"
                >
                  {scoring ? <><Loader2 className="animate-spin" size={16} /> Scoring…</> : <>Submit design</>}
                </button>
              </div>
            ) : (
              <button
                onClick={nextRound}
                data-testid="next-round-button"
                className="w-full bg-[#FFD500] hover:bg-yellow-300 text-black px-5 py-3 rounded-md font-semibold"
              >
                {round === TOTAL_ROUNDS ? "See final results →" : "Next round →"}
              </button>
            )}
          </aside>

          {/* Main: hand or result */}
          <main className="lg:col-span-8">
            {!result ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3" data-testid="card-hand">
                {data.hand.map((card, i) => (
                  <div key={card.id} style={{ animationDelay: `${i * 35}ms` }} className="cf-fade-up">
                    <ServiceCard
                      card={card}
                      selected={selected.includes(card.id)}
                      onClick={() => toggleCard(card.id)}
                      disabled={selected.length >= MAX_SELECT}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="cf-fade-up">
                <ScoreBreakdown result={result} />
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
