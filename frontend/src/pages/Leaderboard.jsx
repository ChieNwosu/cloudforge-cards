import { useEffect, useState, useCallback } from "react";
import { Trophy, Loader2, Trash2 } from "lucide-react";
import { getLeaderboard, deleteLeaderboardEntry } from "@/lib/api";
import { toast } from "sonner";

const RANK_COLOR = {
  0: "text-[#D32F2F]",
  1: "text-zinc-300",
  2: "text-[#CD7F32]",
};

function rankLabel(idx) {
  return String(idx + 1).padStart(2, "0");
}

function readMyScore() {
  try {
    const raw = localStorage.getItem("cf_my_score");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function LeaderboardBody({ loading, entries, myId }) {
  if (loading) {
    return (
      <div className="grid place-items-center h-40 text-zinc-500">
        <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>
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
            <th className="text-left px-4 sm:px-5 py-4 w-12 sm:w-16">#</th>
            <th className="text-left px-4 sm:px-5 py-4">Player</th>
            <th className="text-right px-4 sm:px-5 py-4">Score</th>
            <th className="text-right px-5 py-4 hidden sm:table-cell">Rounds</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const mine = myId && e.id === myId;
            return (
              <tr
                key={e.id}
                data-testid={mine ? "leaderboard-row-mine" : undefined}
                className={`border-b border-white/5 last:border-0 ${mine ? "bg-[#7E1818]/10" : "hover:bg-white/[0.02]"}`}
              >
                <td className="px-4 sm:px-5 py-4 font-mono text-zinc-500">
                  <span className={RANK_COLOR[i] || ""}>{rankLabel(i)}</span>
                </td>
                <td className="px-4 sm:px-5 py-4 font-medium">
                  <span className="break-words">{e.name}</span>
                  {mine && <span className="ml-2 text-[10px] font-mono uppercase tracking-[0.12em] text-[#D89090]">you</span>}
                </td>
                <td className="px-4 sm:px-5 py-4 text-right font-mono font-bold">{e.total_score}</td>
                <td className="px-5 py-4 text-right text-zinc-500 hidden sm:table-cell font-mono">{e.rounds}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myScore, setMyScore] = useState(() => readMyScore());
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    getLeaderboard()
      .then((rows) => { if (!cancelled) setEntries(rows); })
      .catch(() => { if (!cancelled) setEntries([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => load(), [load]);

  async function handleDelete() {
    if (!myScore?.id) return;
    if (!window.confirm("Delete your saved score from this browser?")) return;
    setDeleting(true);
    try {
      await deleteLeaderboardEntry(myScore.id);
      localStorage.removeItem("cf_my_score");
      setMyScore(null);
      toast.success("Your score was deleted.");
      load();
    } catch (err) {
      if (err?.response?.status === 404) {
        localStorage.removeItem("cf_my_score");
        setMyScore(null);
        toast.message("That score no longer exists. Cleared from this browser.");
        load();
      } else {
        toast.error("Could not delete your score. Try again.");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12 min-w-0" data-testid="leaderboard-page">
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="text-[#D32F2F]" />
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Leaderboard</h1>
      </div>
      <p className="text-zinc-400 mb-6 sm:mb-8">Highest best-of-3 totals from local players.</p>

      {myScore && (
        <div
          className="rounded-lg border border-[#7E1818]/40 bg-[#7E1818]/[0.06] p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          data-testid="my-score-panel"
        >
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#D89090] mb-1">Your saved score</div>
            <div className="text-sm text-zinc-200 break-words">
              <span className="font-semibold">{myScore.name}</span>
              <span className="font-mono text-zinc-400"> · {myScore.total_score} pts</span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            data-testid="delete-my-score-button"
            className="shrink-0 inline-flex items-center justify-center gap-2 border border-[#FF3333]/40 text-[#FF6666] hover:bg-[#FF3333]/10 disabled:opacity-50 px-4 py-2.5 rounded-md text-sm font-semibold"
          >
            {deleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />} Delete my score
          </button>
        </div>
      )}

      <LeaderboardBody loading={loading} entries={entries} myId={myScore?.id} />
    </div>
  );
}
