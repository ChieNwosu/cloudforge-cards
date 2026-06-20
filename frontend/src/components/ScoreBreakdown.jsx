import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

const CAT_ICONS = {
  Compute: "▣", Storage: "◧", Database: "◉", Network: "◈",
  Security: "✦", Analytics: "≡", Integration: "⇆", Monitoring: "◐", AI: "✺",
};

function ratingColor(rating) {
  switch (rating) {
    case "Well-Architected":     return "bg-[#00E676]/15 border-[#00E676]/40 text-[#00E676]";
    case "Production Candidate": return "bg-[#0055FF]/15 border-[#0055FF]/40 text-[#5C8CFF]";
    case "Partial Fit":          return "bg-[#FFD500]/15 border-[#FFD500]/40 text-[#FFD500]";
    case "Needs Refactor":       return "bg-[#FF8A33]/15 border-[#FF8A33]/40 text-[#FF8A33]";
    default:                     return "bg-[#FF3333]/15 border-[#FF3333]/40 text-[#FF6666]";
  }
}

function SubScoreBar({ b }) {
  const isPenalty = (b.min ?? 0) < 0 && b.max <= 0;
  const isNegative = b.score < 0;

  if (isPenalty) {
    // Penalty bar: empty when score=0, fills red from left as score gets more negative
    const fill = Math.min(100, (Math.abs(b.score) / Math.abs(b.min)) * 100);
    return (
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-[#FF3333]" style={{ width: `${fill}%` }} />
      </div>
    );
  }

  // Regular sub-score: range can include negatives (e.g. -10..15)
  const min = b.min ?? 0;
  const range = b.max - min;
  const zeroPct = range > 0 ? ((0 - min) / range) * 100 : 0;
  const scorePct = range > 0 ? ((b.score - min) / range) * 100 : 50;
  const startPct = Math.min(zeroPct, scorePct);
  const widthPct = Math.abs(scorePct - zeroPct);

  return (
    <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
      {min < 0 && (
        <div
          className="absolute top-0 bottom-0 w-px bg-white/20"
          style={{ left: `${zeroPct}%` }}
        />
      )}
      <div
        className={`absolute top-0 bottom-0 ${isNegative ? "bg-[#FF3333]" : "bg-[#0055FF]"}`}
        style={{ left: `${startPct}%`, width: `${Math.max(1.5, widthPct)}%` }}
      />
    </div>
  );
}

function MiniCard({ card }) {
  return (
    <div className="border border-white/10 bg-[#121417] rounded-md px-2 py-1.5 flex items-center gap-2 text-xs"
         title={card.tooltip}>
      <span className="text-[#0055FF]">{CAT_ICONS[card.category] || "◆"}</span>
      <span className="font-medium truncate">{card.title}</span>
    </div>
  );
}

export default function ScoreBreakdown({ result }) {
  if (!result) return null;
  const { total, rating, breakdown, commentary, ideal_combos = [] } = result;

  // Derive "got right" (positive subscores with reasons) vs "to improve" (negative or low)
  const gotRight = [];
  const toImprove = [];
  for (const b of breakdown) {
    const isPenalty = (b.min ?? 0) < 0 && b.max <= 0;
    if (isPenalty) {
      if (b.score >= -1) gotRight.push({ label: b.label, text: b.reasons[0] || "No penalty incurred." });
      else b.reasons.forEach((r) => toImprove.push({ label: b.label, text: r }));
    } else {
      // For mixed-range bars, "positive" = > 60% of max
      const norm = b.score / b.max;
      if (norm >= 0.6) {
        b.reasons.forEach((r) => gotRight.push({ label: b.label, text: r }));
      } else if (norm <= 0.2 || b.score < 0) {
        b.reasons.forEach((r) => toImprove.push({ label: b.label, text: r }));
      }
    }
  }

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
        </div>
      </div>

      {/* Got right / To improve */}
      {(gotRight.length > 0 || toImprove.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-lg border border-[#00E676]/20 bg-[#00E676]/[0.04] p-5" data-testid="got-right">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-[#00E676]" />
              <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-[#00E676]">What you got right</h4>
            </div>
            {gotRight.length === 0 ? (
              <p className="text-sm text-zinc-500">Nothing stood out. Try again.</p>
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

          <div className="rounded-lg border border-[#FFD500]/20 bg-[#FFD500]/[0.04] p-5" data-testid="to-improve">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-[#FFD500]" />
              <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-[#FFD500]">What to improve</h4>
            </div>
            {toImprove.length === 0 ? (
              <p className="text-sm text-zinc-500">Solid round — nothing major to flag.</p>
            ) : (
              <ul className="space-y-2 text-sm text-zinc-200">
                {toImprove.slice(0, 4).map((r) => (
                  <li key={`ti-${r.label}-${r.text}`} className="flex gap-2">
                    <span className="text-[#FFD500] mt-0.5">·</span>
                    <span><span className="text-zinc-500 font-mono text-xs mr-1">{r.label}:</span>{r.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Score breakdown */}
      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-5 sm:p-6">
        <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-4">/// score breakdown</h4>
        <div className="space-y-4">
          {breakdown.map((b) => {
            const isPenalty = (b.min ?? 0) < 0 && b.max <= 0;
            const isNegative = b.score < 0;
            return (
              <div key={b.label} data-testid={`subscore-${b.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="flex items-baseline justify-between mb-1.5 gap-2">
                  <div className="font-medium text-sm sm:text-base">{b.label}</div>
                  <div className={`font-mono font-bold tabular-nums ${isNegative ? "text-[#FF6666]" : "text-white"}`}>
                    {b.score > 0 ? "+" : ""}{b.score}
                    <span className="text-zinc-500 text-xs ml-1">
                      / {isPenalty ? b.min : b.max}
                    </span>
                  </div>
                </div>
                <SubScoreBar b={b} />
                <ul className="text-xs text-zinc-400 space-y-1 leading-relaxed">
                  {b.reasons.map((r) => (<li key={`${b.label}-${r}`}>· {r}</li>))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ideal architecture */}
      {ideal_combos.length > 0 && (
        <div className="rounded-lg border border-[#0055FF]/30 bg-[#0055FF]/[0.04] p-5 sm:p-6" data-testid="ideal-architecture">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#5C8CFF]" />
            <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-[#5C8CFF]">Ideal architectures</h4>
          </div>
          <p className="text-xs text-zinc-400 mb-4">
            One of these combinations would score very highly for this scenario.
          </p>
          <div className="space-y-3">
            {ideal_combos.map((combo, i) => {
              const comboKey = combo.map((c) => c.id).join("-") || `combo-${i}`;
              return (
                <div key={comboKey} className="border border-white/5 bg-[#0C0E11] rounded-md p-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">
                    Option {i + 1} · {combo.length} services
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
