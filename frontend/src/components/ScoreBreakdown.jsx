import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

const CAT_ICONS = {
  Compute: "▣", Storage: "◧", Database: "◉", Network: "◈",
  Security: "✦", Analytics: "≡", Integration: "⇆", Monitoring: "◐", AI: "✺",
};

function ratingColor(rating) {
  switch (rating) {
    case "Well-Architected":     return "bg-[#00E676]/15 border-[#00E676]/40 text-[#00E676]";
    case "Production Candidate": return "bg-[#7E1818]/15 border-[#7E1818]/40 text-[#D89090]";
    case "Partial Fit":          return "bg-[#D32F2F]/15 border-[#D32F2F]/40 text-[#D32F2F]";
    case "Needs Refactor":       return "bg-[#FF8A33]/15 border-[#FF8A33]/40 text-[#FF8A33]";
    default:                     return "bg-[#FF3333]/15 border-[#FF3333]/40 text-[#FF6666]";
  }
}

// Pill styling for ideal-combo match status.
const PILL = {
  full:    { cls: "bg-[#00E676]/15 border-[#00E676]/40 text-[#00E676]", label: "Full Match" },
  partial: { cls: "bg-[#FF8A33]/15 border-[#FF8A33]/40 text-[#FF8A33]", label: "Partial Match" },
  miss:    { cls: "bg-white/5 border-white/15 text-zinc-500",           label: "Miss" },
};

// One short verdict line that is always consistent with the numeric rating.
function verdictLine(rating) {
  switch (rating) {
    case "Well-Architected":     return "Excellent round, this is a well-architected design.";
    case "Production Candidate": return "Strong round, this design is close to production-ready.";
    case "Partial Fit":          return "Workable, but this design has clear gaps to close.";
    case "Needs Refactor":       return "This design needs a rethink, several picks miss the mark.";
    default:                     return "This architecture is broken for the scenario, start from the ideal patterns.";
  }
}

function SubScoreBar({ b }) {
  const fill = b.max > 0 ? Math.min(100, Math.max(2, (b.score / b.max) * 100)) : 0;
  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
      <div className="h-full bg-[#7E1818]" style={{ width: `${fill}%` }} />
    </div>
  );
}

function MiniCard({ card }) {
  return (
    <div className="border border-white/10 bg-[#121417] rounded-md px-2 py-1.5 flex items-center gap-2 text-xs"
         title={card.tooltip}>
      <span className="text-[#7E1818]">{CAT_ICONS[card.category] || "◆"}</span>
      <span className="font-medium truncate">{card.title}</span>
    </div>
  );
}

export default function ScoreBreakdown({ result }) {
  if (!result) return null;
  const { total, rating, breakdown, commentary, ideal_combos = [],
    ideal_combos_status = [], matched_ideal = null, best_match_service_names = [],
    selected_services = [], scenario, explanation = "" } = result;

  // Derive "got right" vs "to improve" purely from each sub-score ratio,
  // but the headline verdict is driven by the overall rating so copy never contradicts the grade.
  const gotRight = [];
  const toImprove = [];
  for (const b of breakdown) {
    const norm = b.max > 0 ? b.score / b.max : 0;
    if (norm >= 0.6) {
      b.reasons.forEach((r) => gotRight.push({ label: b.label, text: r }));
    } else if (norm <= 0.34) {
      b.reasons.forEach((r) => toImprove.push({ label: b.label, text: r }));
    }
  }

  const statusPill = matched_ideal ? (PILL[matched_ideal.status] || PILL.miss) : null;

  return (
    <div className="space-y-4 sm:space-y-6" data-testid="score-breakdown">
      {/* Final score */}
      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 sm:p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{ background: "radial-gradient(circle at 90% 10%, rgba(0,85,255,0.18), transparent 60%)" }}
        />
        <div className="relative">
          <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">Final score</div>
          <div className="flex items-end gap-3 mb-3">
            <div className="text-5xl sm:text-6xl font-bold tracking-tighter font-mono" data-testid="round-total-score">
              {total}
            </div>
            <div className="text-xl sm:text-2xl text-zinc-500 mb-1 sm:mb-2">/ 100</div>
          </div>
          <div
            data-testid="round-rating-label"
            className={`inline-block text-xs sm:text-sm font-mono uppercase tracking-[0.12em] px-3 py-1 rounded border ${ratingColor(rating)}`}
          >
            {rating}
          </div>
          <p className="text-sm text-zinc-300 mt-3" data-testid="round-verdict">{verdictLine(rating)}</p>
        </div>
      </div>

      {/* Got right / To improve */}
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-lg border border-[#00E676]/20 bg-[#00E676]/[0.04] p-5" data-testid="got-right">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-[#00E676]" />
            <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-[#00E676]">What you got right</h4>
          </div>
          {gotRight.length === 0 ? (
            <p className="text-sm text-zinc-500">Not much landed this round, lean on the ideal architectures below.</p>
          ) : (
            <ul className="space-y-2 text-sm text-zinc-200">
              {gotRight.slice(0, 4).map((r) => (
                <li key={`gr-${r.label}-${r.text}`} className="flex gap-2">
                  <span className="text-[#00E676] mt-0.5">·</span>
                  <span><span className="text-zinc-500 font-mono text-xs mr-1">{r.label}:</span>{r.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-[#D32F2F]/20 bg-[#D32F2F]/[0.04] p-5" data-testid="to-improve">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-[#D32F2F]" />
            <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-[#D32F2F]">What to improve</h4>
          </div>
          {toImprove.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {total >= 86 ? "Nothing major to flag, this is a clean design." : "Tighten synergy and constraint fit to push the score higher."}
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-zinc-200">
              {toImprove.slice(0, 4).map((r) => (
                <li key={`ti-${r.label}-${r.text}`} className="flex gap-2">
                  <span className="text-[#D32F2F] mt-0.5">·</span>
                  <span><span className="text-zinc-500 font-mono text-xs mr-1">{r.label}:</span>{r.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Score breakdown */}
      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 sm:p-6">
        <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-4">/// score breakdown</h4>
        <div className="space-y-4">
          {breakdown.map((b) => (
            <div key={b.label} data-testid={`subscore-${b.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`}>
              <div className="flex items-baseline justify-between mb-1.5 gap-2">
                <div className="font-medium text-sm sm:text-base">{b.label}</div>
                <div className="font-mono font-bold tabular-nums text-white">
                  {b.score}
                  <span className="text-zinc-500 text-xs ml-1">/ {b.max}</span>
                </div>
              </div>
              <SubScoreBar b={b} />
              <ul className="text-xs text-zinc-400 space-y-1 leading-relaxed">
                {b.reasons.map((r) => (<li key={`${b.label}-${r}`}>· {r}</li>))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Your Choices */}
      {selected_services.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 sm:p-6" data-testid="your-choices">
          <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-400 mb-3">/// your choices</h4>
          <p className="text-xs text-zinc-500 mb-4">
            What you selected for {scenario ? `"${scenario.title}"` : "this scenario"}.
            Compare this to the recommended architectures below.
          </p>

          {/* Ideal-match summary */}
          {matched_ideal && (
            <div className="border border-white/10 bg-[#121417] rounded-md p-3 mb-4" data-testid="matched-ideal-summary">
              <div className="flex items-center flex-wrap gap-2 mb-1.5">
                <span className="text-xs font-mono uppercase tracking-[0.14em] text-zinc-400">
                  Matched ideal services: <span className="text-white">{matched_ideal.matched_count} of {matched_ideal.total}</span>
                </span>
                {statusPill && (
                  <span className={`text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded border ${statusPill.cls}`}
                        data-testid="matched-ideal-status-pill">
                    {statusPill.label}
                  </span>
                )}
              </div>
              {best_match_service_names.length > 0 && (
                <div className="text-xs text-zinc-400" data-testid="best-match-architecture">
                  Best matching architecture: <span className="text-zinc-200">{best_match_service_names.join(" + ")}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 mb-4">
            {selected_services.map((s) => (
              <div key={s.id} className="border border-white/5 bg-[#121417] rounded-md p-3">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[#7E1818] text-base">{CAT_ICONS[s.category] || "\u25C6"}</span>
                  <span className="font-semibold text-sm">{s.title}</span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">{s.category}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {s.tags.slice(0, 4).map((t) => (
                    <span key={`${s.id}-${t}`} className="text-[10px] font-mono px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-zinc-400">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {explanation ? (
            <div className="border-t border-white/5 pt-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">Your explanation</div>
              <p className="text-sm text-zinc-300 leading-relaxed">{explanation}</p>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 italic border-t border-white/5 pt-3">
              No explanation provided. Try writing one next round to clarify your design intent.
            </div>
          )}
        </div>
      )}

      {/* Ideal architecture */}
      {ideal_combos.length > 0 && (
        <div className="rounded-lg border border-[#7E1818]/30 bg-[#7E1818]/[0.04] p-5 sm:p-6" data-testid="ideal-architecture">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#D89090]" />
            <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-[#D89090]">Ideal architectures</h4>
          </div>
          <p className="text-xs text-zinc-400 mb-4">
            One of these combinations would score very highly for this scenario.
          </p>
          <div className="space-y-3">
            {ideal_combos.map((combo, i) => {
              const comboKey = combo.map((c) => c.id).join("-") || `combo-${i}`;
              const st = ideal_combos_status[i];
              const pill = st ? (PILL[st.status] || PILL.miss) : null;
              return (
                <div key={comboKey} className="border border-white/5 bg-[#0C0E11] rounded-md p-3"
                     data-testid={`ideal-combo-${i}`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">
                      Option {i + 1} · {combo.length} services
                    </div>
                    {pill && (
                      <span className={`text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded border ${pill.cls}`}
                            data-testid={`ideal-combo-${i}-pill`}>
                        {pill.label}{st && st.status !== "miss" ? ` · ${st.matched_count}/${st.total}` : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {combo.map((c) => <MiniCard key={c.id} card={c} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Architect review */}
      {commentary && (
        <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 sm:p-6">
          <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">/// architect&apos;s review</h4>
          <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line" data-testid="commentary-text">
            {commentary}
          </p>
        </div>
      )}
    </div>
  );
}
