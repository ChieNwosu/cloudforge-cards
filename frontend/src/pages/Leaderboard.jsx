import { useCallback, useEffect, useState } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { getLeaderboard } from "@/lib/api";

const RANK_COLOR = {
  0: "text-[#FFD500]",
  1: "text-zinc-300",
  2: "text-[#CD7F32]",
};

function rankLabel(idx) {
  return String(idx + 1).padStart(2, "0");
}

function LeaderboardBody({ loading, entries }) {
  if (loading) {
    return (
      <div className="grid place-items-center h-40 text-zinc-500">
        <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading…</div>
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-12 text-center" data-testid="leaderboard-empty">
        <div className="text-zinc-400">No scores yet. Be the first.</div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-white/10 bg-[#0C0E11] overflow-hidden">
      <table className="w-full text-sm" data-testid="leaderboard-table">
        <thead className="text-xs font-mono uppercase tracking-[0.12em] text-zinc-500 border-b border-white/10">
          <tr>
            <th className="text-left px-5 py-4 w-16">#</th>
            <th className="text-left px-5 py-4">Player</th>
            <th className="text-right px-5 py-4">Score</th>
            <th className="text-right px-5 py-4 hidden sm:table-cell">Rounds</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
              <td className="px-5 py-4 font-mono text-zinc-500">
                <span className={RANK_COLOR[i] || ""}>{rankLabel(i)}</span>
              </td>
              <td className="px-5 py-4 font-medium">{e.name}</td>
              <td className="px-5 py-4 text-right font-mono font-bold">{e.total_score}</td>
              <td className="px-5 py-4 text-right text-zinc-500 hidden sm:table-cell font-mono">{e.rounds}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    getLeaderboard()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12" data-testid="leaderboard-page">
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="text-[#FFD500]" />
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Leaderboard</h1>
      </div>
      <p className="text-zinc-400 mb-10">Highest best-of-3 totals from local players.</p>
      <LeaderboardBody loading={loading} entries={entries} />
    </div>
  );
}
