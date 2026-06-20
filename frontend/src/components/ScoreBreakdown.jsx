export default function ScoreBreakdown({ result }) {
  if (!result) return null;
  const { total, rating, breakdown, commentary } = result;

  return (
    <div className="space-y-6" data-testid="score-breakdown">
      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(circle at 90% 10%, rgba(0,85,255,0.18), transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">Final score</div>
          <div className="flex items-end gap-4 mb-3">
            <div className="text-6xl font-bold tracking-tighter font-mono" data-testid="round-total-score">
              {total}
            </div>
            <div className="text-2xl text-zinc-500 mb-2">/ 100</div>
          </div>
          <div className="inline-block text-sm font-mono uppercase tracking-[0.12em] px-3 py-1 rounded bg-[#0055FF]/15 border border-[#0055FF]/40 text-[#5C8CFF]">
            {rating}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-6">
        <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-4">
          /// score breakdown
        </h4>
        <div className="space-y-4">
          {breakdown.map((b) => {
            const range = b.max - (b.min ?? 0);
            const pct = range > 0 ? ((b.score - (b.min ?? 0)) / range) * 100 : 50;
            const isNegative = b.score < 0;
            return (
              <div key={b.label} data-testid={`subscore-${b.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="font-medium">{b.label}</div>
                  <div className={`font-mono font-bold ${isNegative ? "text-[#FF6666]" : "text-white"}`}>
                    {b.score > 0 ? "+" : ""}{b.score}
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${isNegative ? "bg-[#FF3333]" : "bg-[#0055FF]"}`}
                    style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
                  />
                </div>
                <ul className="text-xs text-zinc-400 space-y-1">
                  {b.reasons.map((r, i) => (<li key={i}>· {r}</li>))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {commentary && (
        <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-6">
          <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">
            /// architect's review
          </h4>
          <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line" data-testid="commentary-text">
            {commentary}
          </p>
        </div>
      )}
    </div>
  );
}
