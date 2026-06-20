import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, RotateCcw, Send, Trophy, X } from "lucide-react";
import { dealRound, scoreRound, submitLeaderboard } from "@/lib/api";
import ServiceCard from "@/components/ServiceCard";
import ConstraintChip from "@/components/ConstraintChip";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { toast } from "sonner";

const TOTAL_ROUNDS = 3;
const FILTERS = [
  "All", "Compute", "Storage", "Database",
  "Security", "Analytics", "Networking", "Integration", "AI",
];
const FILTER_TO_CATEGORY = { Networking: "Network" };

function roundChipClass(chipRound, currentRound, past) {
  const base = "px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-mono";
  if (past) return `${base} bg-[#0055FF]/15 border border-[#0055FF]/40 text-[#5C8CFF]`;
  if (chipRound === currentRound) return `${base} bg-white/10 border border-white/15 text-white`;
  return `${base} bg-white/[0.02] border border-white/10 text-zinc-600`;
}

// Pure helpers, kept outside the component so static analyzers do not
// inspect their local variables as if they were React dependencies.
function getVisibleHand(data, activeFilter) {
  if (!data?.hand) return [];
  if (activeFilter === "All") return data.hand;
  const category = FILTER_TO_CATEGORY[activeFilter] || activeFilter;
  return data.hand.filter((card) => card.category === category);
}

function getSelectedCards(selected, data) {
  if (!data?.hand) return [];
  return selected
    .map((cardId) => data.hand.find((card) => card.id === cardId))
    .filter(Boolean);
}

export default function Play() {
  const [round, setRound] = useState(1);
  const [data, setData] = useState(null);          // {scenario, constraints, hand}
  const [selected, setSelected] = useState([]);    // service ids
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState("All");

  const sessionDone = round > TOTAL_ROUNDS;
  const sessionTotal = history.reduce((s, h) => s + h.total, 0);

  const minServices = data?.scenario?.min_services ?? 3;
  const maxServices = data?.scenario?.max_services ?? 6;
  const canSubmit = selected.length >= minServices && selected.length <= maxServices;

  const visibleHand = getVisibleHand(data, filter);
  const selectedCards = getSelectedCards(selected, data);

  useEffect(() => {
    if (sessionDone) return undefined;
    let cancelled = false;
    setLoading(true);
    setResult(null);
    setSelected([]);
    setExplanation("");
    setFilter("All");
    dealRound(null, 12, 2)
      .then((dealt) => { if (!cancelled) setData(dealt); })
      .catch(() => {
        if (!cancelled) toast.error("Failed to deal a round. Is the backend running?");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [round, sessionDone]);

  function toggleCard(id) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxServices) {
        toast.warning(`Max ${maxServices} services for this scenario.`);
        return prev;
      }
      return [...prev, id];
    });
  }

  async function submitRound() {
    if (selected.length < minServices) {
      toast.warning(`Pick at least ${minServices} services.`);
      return;
    }
    setScoring(true);
    try {
      const res = await scoreRound({
        scenario_id: data.scenario.id,
        constraint_ids: data.constraints.map((c) => c.id),
        selected_service_ids: selected,
        explanation,
      });
      setResult(res);
      setHistory((h) => [...h, { round, total: res.total, scenario: data.scenario.title }]);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Scoring failed.");
    } finally {
      setScoring(false);
    }
  }

  function nextRound() { setRound((r) => r + 1); }
  function resetSession() {
    setRound(1); setHistory([]); setResult(null);
    setSubmitted(false); setName("");
  }

  async function saveScore() {
    if (!name.trim()) { toast.warning("Enter a name to save your score."); return; }
    try {
      await submitLeaderboard({ name: name.trim(), total_score: sessionTotal, rounds: TOTAL_ROUNDS });
      setSubmitted(true);
      toast.success("Saved to leaderboard!");
    } catch {
      toast.error("Could not save score.");
    }
  }

  if (sessionDone) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-6 sm:p-8 cf-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-[#FFD500]" />
            <h1 className="text-2xl sm:text-3xl font-bold">Session complete</h1>
          </div>
          <p className="text-zinc-400 mb-8 text-sm sm:text-base">Best-of-{TOTAL_ROUNDS} finished. Here&apos;s your tally:</p>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6" data-testid="session-history">
            {history.map((h) => (
              <div key={h.round} className="border border-white/10 rounded-lg p-3 sm:p-4 bg-[#121417]">
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">Round {h.round}</div>
                <div className="text-xl sm:text-2xl font-bold font-mono">{h.total}</div>
                <div className="text-[11px] sm:text-xs text-zinc-400 mt-1 truncate">{h.scenario}</div>
              </div>
            ))}
          </div>

          <div className="border border-[#0055FF]/40 cf-glow rounded-lg p-5 sm:p-6 mb-6 sm:mb-8">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-400 mb-1">Session total</div>
            <div className="text-4xl sm:text-5xl font-bold font-mono" data-testid="session-total">{sessionTotal.toFixed(1)}</div>
          </div>

          {!submitted && (
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name for the leaderboard"
                data-testid="leaderboard-name-input"
                className="flex-1 bg-[#121417] border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0055FF]"
                maxLength={32}
              />
              <button
                onClick={saveScore}
                data-testid="save-score-button"
                className="bg-[#0055FF] hover:bg-[#3377FF] text-white px-5 py-3 rounded-md font-semibold inline-flex items-center justify-center gap-2"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-32 lg:pb-8" data-testid="play-page">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <div className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-zinc-500">
            Best of {TOTAL_ROUNDS}
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold mt-1" data-testid="round-title">
            Round {round} / {TOTAL_ROUNDS}
          </h2>
        </div>
        <div className="flex gap-1.5" data-testid="round-progress">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
            const past = history.find((h) => h.round === i + 1);
            return (
              <div key={`round-chip-${i + 1}`} className={roundChipClass(i + 1, round, past)}>
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
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Side panel */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 sm:p-6 cf-fade-up" data-testid="scenario-card">
              <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#FFD500] mb-2">Scenario</div>
              <h3 className="text-lg sm:text-xl font-bold mb-3">{data.scenario.title}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">{data.scenario.prompt}</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-500 border-t border-white/5 pt-3">
                <div>min: <span className="text-white">{minServices}</span></div>
                <div>max: <span className="text-white">{maxServices}</span></div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 sm:p-6 cf-fade-up">
              <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">Constraints</div>
              <div className="flex flex-wrap gap-2">
                {data.constraints.map((c) => <ConstraintChip key={c.id} constraint={c} />)}
              </div>
            </div>

            {result && (
              <button
                onClick={nextRound}
                data-testid="next-round-button"
                className="w-full bg-[#FFD500] hover:bg-yellow-300 text-black px-5 py-3 rounded-md font-semibold"
              >
                {round === TOTAL_ROUNDS ? "See final results →" : "Next round →"}
              </button>
            )}
          </aside>

          {/* Main */}
          <main className="lg:col-span-8">
            {!result ? (
              <>
                {/* Category filter */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-1 px-1 scrollbar-thin" data-testid="category-filters">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      data-testid={`filter-${f.toLowerCase()}`}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-[0.1em] whitespace-nowrap border transition-colors ${
                        filter === f
                          ? "bg-[#0055FF] border-[#0055FF] text-white"
                          : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">
                  Selected · <span className="text-white">{selected.length}/{maxServices}</span>
                  <span className="ml-2 text-zinc-600">choose {minServices}–{maxServices} services</span>
                </div>

                {visibleHand.length === 0 ? (
                  <div className="text-sm text-zinc-500 py-12 text-center border border-dashed border-white/10 rounded-lg">
                    No cards in this category for the current hand.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" data-testid="card-hand">
                    {visibleHand.map((card) => (
                      <div key={card.id} className="cf-fade-up">
                        <ServiceCard
                          card={card}
                          selected={selected.includes(card.id)}
                          onClick={() => toggleCard(card.id)}
                          disabled={selected.length >= maxServices}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Explanation field (desktop), sits below cards */}
                <div className="mt-6 rounded-lg border border-white/10 bg-[#0C0E11] p-5">
                  <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">
                    Architecture explanation (optional)
                  </div>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Briefly explain why this architecture solves the scenario…"
                    rows={3}
                    data-testid="explanation-input"
                    className="w-full bg-[#121417] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0055FF] resize-none"
                  />
                </div>
              </>
            ) : (
              <div className="cf-fade-up"><ScoreBreakdown result={result} /></div>
            )}
          </main>
        </div>
      )}

      {/* Sticky bottom tray (only while selecting cards) */}
      {!loading && data && !result && (
        <div
          data-testid="selection-tray"
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#0A0C0F]/95 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">
                Selected · <span className="text-white">{selected.length}/{maxServices}</span>
              </div>
              {selectedCards.length === 0 ? (
                <div className="text-xs text-zinc-500">Pick {minServices}–{maxServices} services.</div>
              ) : (
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {selectedCards.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => toggleCard(c.id)}
                      data-testid={`tray-card-${c.id}`}
                      className="shrink-0 inline-flex items-center gap-1.5 bg-[#121417] border border-[#0055FF]/50 px-2 py-1 rounded text-xs hover:border-[#FF3333]/60 transition-colors group"
                      title="Remove"
                    >
                      <span>{c.title}</span>
                      <X size={12} className="text-zinc-500 group-hover:text-[#FF6666]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={submitRound}
              disabled={scoring || !canSubmit}
              data-testid="submit-round-button"
              className="shrink-0 bg-[#0055FF] hover:bg-[#3377FF] disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 sm:px-5 py-2.5 rounded-md font-semibold inline-flex items-center gap-2 text-sm"
            >
              {scoring ? <><Loader2 className="animate-spin" size={16} /> Scoring…</> : <>Submit Design</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
