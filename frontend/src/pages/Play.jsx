import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, RotateCcw, Send, Trophy, X } from "lucide-react";
import { dealRound, scoreRound, submitLeaderboard, getSessionScenarios, getOwnerToken } from "@/lib/api";
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
  if (past) return `${base} bg-[#7E1818]/15 border border-[#7E1818]/40 text-[#D89090]`;
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
  const [name, setName] = useState(() => localStorage.getItem("cf_player_name") || "");
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState("All");
  const [sessionIds, setSessionIds] = useState([]);
  const [saveMode, setSaveMode] = useState("official");
  const [suggestions, setSuggestions] = useState([]);
  const playerName = (localStorage.getItem("cf_player_name") || "").trim();

  // Pick 3 unique scenario IDs once per session so rounds never repeat.
  useEffect(() => {
    let cancelled = false;
    getSessionScenarios(TOTAL_ROUNDS)
      .then((ids) => { if (!cancelled) setSessionIds(ids); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const sessionDone = round > TOTAL_ROUNDS;
  const sessionTotal = history.reduce((s, h) => s + h.total, 0);

  const minServices = data?.scenario?.min_services ?? 3;
  const maxServices = data?.scenario?.max_services ?? 6;
  const canSubmit = selected.length >= minServices && selected.length <= maxServices;

  const visibleHand = getVisibleHand(data, filter);
  const selectedCards = getSelectedCards(selected, data);

  useEffect(() => {
    if (sessionDone) return undefined;
    if (sessionIds.length === 0) return undefined;
    const scenarioId = sessionIds[round - 1];
    let cancelled = false;
    setLoading(true);
    setResult(null);
    setSelected([]);
    setExplanation("");
    setFilter("All");
    dealRound(scenarioId, 12, 2)
      .then((dealt) => { if (!cancelled) setData(dealt); })
      .catch(() => {
        if (!cancelled) toast.error("Failed to deal a round. Is the backend running?");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [round, sessionDone, sessionIds]);

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
    setSubmitted(false); setName(localStorage.getItem("cf_player_name") || "");
    setSuggestions([]); setSaveMode("official");
    getSessionScenarios(TOTAL_ROUNDS).then(setSessionIds).catch(() => {});
  }

  async function saveScore() {
    const trimmed = name.trim();
    if (!trimmed) { toast.warning("Enter a name to save your score."); return; }
    setSuggestions([]);
    try {
      const res = await submitLeaderboard({
        name: trimmed, total_score: sessionTotal, rounds: TOTAL_ROUNDS,
        mode: saveMode, owner_token: getOwnerToken(),
      });
      if (res.status === "conflict") {
        setSuggestions(res.suggestions || []);
        toast.warning(res.message || "That name is already taken.");
        return;
      }
      localStorage.setItem("cf_player_name", trimmed);
      if (res.entry?.id) {
        localStorage.setItem("cf_my_score", JSON.stringify({
          id: res.entry.id, name: res.entry.name,
          total_score: res.entry.total_score, mode: res.entry.mode,
        }));
      }
      setSubmitted(true);
      if (res.status === "kept") toast.message(res.message);
      else toast.success(res.message || "Saved to leaderboard!");
    } catch {
      toast.error("Could not save score.");
    }
  }

  if (sessionDone) {
    const totals = history.map((h) => h.total);
    const avg = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
    const best = totals.length ? Math.max(...totals) : 0;
    const lowest = totals.length ? Math.min(...totals) : 0;
    const overallGrade =
      avg >= 86 ? "Well-Architected" :
      avg >= 71 ? "Production Candidate" :
      avg >= 51 ? "Partial Fit" :
      avg >= 31 ? "Needs Refactor" : "Broken Architecture";
    const finalReview =
      avg >= 86 ? "Outstanding session. You consistently picked the right services, kept architectures lean, and respected the scenario constraints. You are operating at a Solutions Architect Associate level."
      : avg >= 71 ? "Strong session. Your designs are production-ready in most cases. Focus on tightening service synergy and cutting any service that does not justify its complexity."
      : avg >= 51 ? "Solid foundations. You picked workable services but missed some classic AWS pairings. Review the Ideal Architectures shown after each round."
      : avg >= 31 ? "Promising but inconsistent. Several rounds had category mismatches or unnecessary services. Re-read each scenario carefully and lean on serverless defaults."
      : "Time to revisit AWS service categories. Start with the static blog and photo sharing scenarios, and study why S3 + CloudFront keeps showing up.";

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-6 sm:p-8 cf-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-[#D32F2F]" />
            <h1 className="text-2xl sm:text-3xl font-bold">Final game summary</h1>
          </div>
          <p className="text-zinc-400 mb-6 text-sm sm:text-base">Best-of-{TOTAL_ROUNDS} finished. Here is your tally.</p>

          <div className="border border-[#7E1818]/50 cf-glow rounded-lg p-5 sm:p-6 mb-5">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-400 mb-1">Final game score</div>
            <div className="flex items-end gap-3 mb-3">
              <div className="text-5xl sm:text-6xl font-bold font-mono" data-testid="session-total">{sessionTotal.toFixed(1)}</div>
              <div className="text-zinc-500 text-xl mb-1">/ 300</div>
            </div>
            <div className="inline-block text-xs sm:text-sm font-mono uppercase tracking-[0.12em] px-3 py-1 rounded border bg-[#7E1818]/15 border-[#7E1818]/50 text-[#D89090]"
                 data-testid="final-overall-grade">{overallGrade}</div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5" data-testid="final-stats">
            <div className="border border-white/10 rounded-lg p-3 sm:p-4 bg-[#121417]">
              <div className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">Average</div>
              <div className="text-xl sm:text-2xl font-bold font-mono">{avg.toFixed(1)}</div>
            </div>
            <div className="border border-white/10 rounded-lg p-3 sm:p-4 bg-[#121417]">
              <div className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">Best round</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#D89090]">{best.toFixed(1)}</div>
            </div>
            <div className="border border-white/10 rounded-lg p-3 sm:p-4 bg-[#121417]">
              <div className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">Lowest</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-400">{lowest.toFixed(1)}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5" data-testid="session-history">
            {history.map((h) => (
              <div key={h.round} className="border border-white/10 rounded-lg p-3 sm:p-4 bg-[#121417]">
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">Round {h.round}</div>
                <div className="text-lg sm:text-2xl font-bold font-mono">{h.total}</div>
                <div className="text-[11px] sm:text-xs text-zinc-400 mt-1 truncate">{h.scenario}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-white/10 bg-[#121417] p-5 mb-6" data-testid="final-architect-review">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">/// final architect&apos;s review</div>
            <p className="text-sm text-zinc-200 leading-relaxed">{finalReview}</p>
          </div>

          {!submitted && (
            <div className="mb-4" data-testid="save-section">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">Save mode</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3" data-testid="save-mode-choice">
                <button
                  type="button"
                  onClick={() => setSaveMode("official")}
                  data-testid="save-mode-official"
                  className={`text-left px-4 py-3 rounded-md border text-sm transition-colors ${
                    saveMode === "official"
                      ? "bg-[#7E1818]/15 border-[#7E1818]/60 text-white"
                      : "bg-white/[0.02] border-white/10 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  <div className="font-semibold">Save as official personal best</div>
                  <div className="text-xs text-zinc-500 mt-0.5">One public score per name. Updates only if higher.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSaveMode("guest")}
                  data-testid="save-mode-guest"
                  className={`text-left px-4 py-3 rounded-md border text-sm transition-colors ${
                    saveMode === "guest"
                      ? "bg-[#7E1818]/15 border-[#7E1818]/60 text-white"
                      : "bg-white/[0.02] border-white/10 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  <div className="font-semibold">Save as temporary guest score</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Expires after 7 days. Will not overwrite a personal best.</div>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name for the leaderboard"
                  data-testid="leaderboard-name-input"
                  className="flex-1 min-w-0 bg-[#121417] border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#7E1818]"
                  maxLength={32}
                />
                <button
                  onClick={saveScore}
                  data-testid="save-score-button"
                  className="bg-[#7E1818] hover:bg-[#A02828] text-white px-5 py-3 rounded-md font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Save Score
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="mt-3 border border-[#FF8A33]/30 bg-[#FF8A33]/[0.06] rounded-md p-3" data-testid="name-suggestions">
                  <div className="text-xs text-[#FF8A33] mb-2">That name is already taken. Try one of these instead:</div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setName(s); setSuggestions([]); }}
                        data-testid={`name-suggestion-${s}`}
                        className="px-3 py-1.5 rounded-md text-sm bg-white/[0.03] border border-white/15 hover:border-white/30 hover:bg-white/5 text-white"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={resetSession}
              data-testid="play-again-button"
              className="bg-[#7E1818] hover:bg-[#A02828] text-white px-5 py-3 rounded-md font-semibold inline-flex items-center gap-2"
            >
              <RotateCcw size={16} /> Play Again
            </button>
            <Link
              to="/leaderboard"
              data-testid="view-leaderboard-link"
              className="border border-white/15 hover:border-white/30 hover:bg-white/5 text-white px-5 py-3 rounded-md font-semibold"
            >
              View Leaderboard
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
          <aside className="lg:col-span-4 space-y-4 min-w-0">
            <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 sm:p-6 cf-fade-up" data-testid="scenario-card">
              <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#D32F2F] mb-2">Scenario</div>
              <h3 className="text-lg sm:text-xl font-bold mb-3">{data.scenario.title}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">{data.scenario.prompt}</p>
              {data.scenario.hint && (
                <div className="border-t border-white/5 pt-3 mb-3" data-testid="mentor-hint">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl leading-none shrink-0" aria-hidden="true">🦅</span>
                    <div className="text-xs text-zinc-300 leading-relaxed min-w-0">
                      {playerName && (
                        <p className="mb-1.5 text-zinc-200" data-testid="flock-greeting">
                          Welcome back, {playerName}. Ready to forge another architecture?
                        </p>
                      )}
                      <span className="font-semibold text-zinc-200">Professor Flock says: </span>
                      <span>{data.scenario.hint.text}</span>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {data.scenario.hint.kw.map((k) => (
                          <span key={k} className="text-[10px] font-mono uppercase tracking-[0.1em] px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E6C75A]">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                className="w-full bg-[#D32F2F] hover:bg-yellow-300 text-black px-5 py-3 rounded-md font-semibold"
              >
                {round === TOTAL_ROUNDS ? "See final results →" : "Next round →"}
              </button>
            )}
          </aside>

          {/* Main */}
          <main className="lg:col-span-8 min-w-0">
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
                          ? "bg-[#7E1818] border-[#7E1818] text-white"
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
                    className="w-full bg-[#121417] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#7E1818] resize-none"
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
                      className="shrink-0 inline-flex items-center gap-1.5 bg-[#121417] border border-[#7E1818]/50 px-2 py-1 rounded text-xs hover:border-[#FF3333]/60 transition-colors group"
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
              className="shrink-0 bg-[#7E1818] hover:bg-[#A02828] disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 sm:px-5 py-2.5 rounded-md font-semibold inline-flex items-center gap-2 text-sm"
            >
              {scoring ? <><Loader2 className="animate-spin" size={16} /> Scoring…</> : <>Submit Design</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
