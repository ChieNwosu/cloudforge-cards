import { useEffect, useState, useCallback } from "react";
import { Trophy, Loader2, Trash2, ShieldAlert } from "lucide-react";
import { getLeaderboard, deleteLeaderboardEntry, adminDeleteEntry, getOwnerToken } from "@/lib/api";
import { toast } from "sonner";

const MODES = [3, 5, 10];
const RANK_COLOR = { 0: "text-[#D32F2F]", 1: "text-zinc-300", 2: "text-[#CD7F32]" };

function rankLabel(idx) {
  return String(idx + 1).padStart(2, "0");
}

function readMyScores() {
  let map = {};
  try { map = JSON.parse(localStorage.getItem("cf_my_scores") || "{}"); } catch { map = {}; }
  // Migrate a legacy single saved score into the per-mode map.
  if (Object.keys(map).length === 0) {
    try {
      const legacy = JSON.parse(localStorage.getItem("cf_my_score") || "null");
      if (legacy?.id) map[String(legacy.rounds || 3)] = legacy;
    } catch (err) {
      console.debug("cf_my_score legacy migration skipped:", err);
    }
  }
  return map;
}

function aggregate(entries) {
  const official = entries.filter((e) => e.mode !== "guest");
  const guests = entries.filter((e) => e.mode === "guest");
  const byName = new Map();
  for (const e of official) {
    const key = (e.name || "").trim().toLowerCase();
    if (!byName.has(key)) byName.set(key, { name: e.name, scores: {} });
    const row = byName.get(key);
    const r = String(e.rounds);
    if (!row.scores[r] || e.total_score > row.scores[r].total_score) row.scores[r] = e;
  }
  const rows = [...byName.values()].map((row) => ({
    ...row,
    best: Math.max(0, ...MODES.map((n) => row.scores[String(n)]?.total_score || 0)),
  }));
  rows.sort((a, b) => b.best - a.best);
  return { rows, guests };
}

function ScoreCell({ entry, mine, adminToken, onAdminDelete }) {
  if (!entry) return <span className="text-zinc-700">—</span>;
  return (
    <span className="inline-flex items-center justify-end gap-1.5">
      <span className={`font-mono font-bold ${mine ? "text-[#D89090]" : ""}`}>{entry.total_score}</span>
      {adminToken && (
        <button
          onClick={() => onAdminDelete(entry.id)}
          data-testid={`admin-delete-${entry.id}`}
          title="Admin delete"
          className="text-[#FF6666] hover:text-[#FF3333]"
        >
          <Trash2 size={13} />
        </button>
      )}
    </span>
  );
}

function LeaderboardBody({ loading, rows, myIds, adminToken, onAdminDelete }) {
  if (loading) {
    return (
      <div className="grid place-items-center h-40 text-zinc-500">
        <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#0C0E11] p-12 text-center" data-testid="leaderboard-empty">
        <div className="text-zinc-400">No scores yet. Be the first.</div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-white/10 bg-[#0C0E11] overflow-x-auto cf-hscroll">
      <table className="w-full text-sm min-w-[480px]" data-testid="leaderboard-table">
        <thead className="text-xs font-mono uppercase tracking-[0.12em] text-zinc-500 border-b border-white/10">
          <tr>
            <th className="text-left px-3 sm:px-5 py-4 w-10 sm:w-14">#</th>
            <th className="text-left px-3 sm:px-5 py-4">Player</th>
            {MODES.map((n) => (
              <th key={n} className="text-right px-3 sm:px-5 py-4">{n}R Best</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const rowMine = MODES.some((n) => myIds.has(row.scores[String(n)]?.id));
            return (
              <tr
                key={row.name + i}
                data-testid={rowMine ? "leaderboard-row-mine" : undefined}
                className={`border-b border-white/5 last:border-0 ${rowMine ? "bg-[#7E1818]/10" : "hover:bg-white/[0.02]"}`}
              >
                <td className="px-3 sm:px-5 py-4 font-mono text-zinc-500">
                  <span className={RANK_COLOR[i] || ""}>{rankLabel(i)}</span>
                </td>
                <td className="px-3 sm:px-5 py-4 font-medium">
                  <span className="break-words">{row.name}</span>
                  {rowMine && <span className="ml-2 text-[10px] font-mono uppercase tracking-[0.12em] text-[#D89090]">you</span>}
                </td>
                {MODES.map((n) => {
                  const entry = row.scores[String(n)];
                  return (
                    <td key={n} className="px-3 sm:px-5 py-4 text-right" data-testid={`cell-${row.name}-${n}`}>
                      <ScoreCell entry={entry} mine={myIds.has(entry?.id)} adminToken={adminToken} onAdminDelete={onAdminDelete} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GuestList({ guests, adminToken, onAdminDelete }) {
  if (!guests.length) return null;
  return (
    <div className="mt-8" data-testid="guest-scores">
      <div className="text-xs font-mono uppercase tracking-[0.16em] text-zinc-500 mb-3">Guest scores (temporary)</div>
      <div className="rounded-lg border border-white/10 bg-[#0C0E11] divide-y divide-white/5">
        {guests.sort((a, b) => b.total_score - a.total_score).map((g) => (
          <div key={g.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="break-words min-w-0 truncate">
              {g.name}
              <span className="ml-2 text-[10px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 rounded border border-white/15 text-zinc-500">guest · {g.rounds}R</span>
            </span>
            <span className="inline-flex items-center gap-2 shrink-0">
              <span className="font-mono font-bold">{g.total_score}</span>
              {adminToken && (
                <button onClick={() => onAdminDelete(g.id)} data-testid={`admin-delete-${g.id}`} title="Admin delete" className="text-[#FF6666] hover:text-[#FF3333]">
                  <Trash2 size={13} />
                </button>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPanel({ token, onChange }) {
  const [value, setValue] = useState("");
  if (token) {
    return (
      <div className="rounded-lg border border-[#FF8A33]/30 bg-[#FF8A33]/[0.05] p-4 mb-6 flex items-center justify-between gap-3" data-testid="admin-panel-active">
        <div className="flex items-center gap-2 text-sm text-[#FF8A33]">
          <ShieldAlert size={16} /> Admin mode active. Delete controls are shown on each score.
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("cf_admin_token"); onChange(null); }}
          data-testid="admin-exit-button"
          className="shrink-0 text-sm border border-white/15 hover:bg-white/5 px-3 py-1.5 rounded-md text-zinc-300"
        >
          Exit admin
        </button>
      </div>
    );
  }
  return (
    <details className="rounded-lg border border-white/10 bg-[#0C0E11] p-4 mb-6" data-testid="admin-panel">
      <summary className="cursor-pointer text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 select-none">
        Admin cleanup
      </summary>
      <p className="text-xs text-zinc-500 mt-3 mb-2">Paste the admin token to enable moderation controls. Stored only for this tab.</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Admin token"
          data-testid="admin-token-input"
          className="flex-1 min-w-0 bg-[#121417] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#7E1818]"
        />
        <button
          onClick={() => {
            const t = value.trim();
            if (!t) { toast.warning("Enter the admin token."); return; }
            sessionStorage.setItem("cf_admin_token", t);
            onChange(t);
          }}
          data-testid="admin-token-submit"
          className="bg-[#7E1818] hover:bg-[#A02828] text-white px-4 py-2 rounded-md text-sm font-semibold"
        >
          Enable
        </button>
      </div>
    </details>
  );
}

function MyScoresPanel({ myScores, deletingId, onDelete }) {
  const modes = MODES.filter((n) => myScores[String(n)]?.id);
  if (modes.length === 0) return null;
  return (
    <div className="rounded-lg border border-[#7E1818]/40 bg-[#7E1818]/[0.06] p-4 sm:p-5 mb-6" data-testid="my-score-panel">
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#D89090] mb-3">Your saved scores</div>
      <div className="space-y-2">
        {modes.map((n) => {
          const s = myScores[String(n)];
          return (
            <div key={n} className="flex items-center justify-between gap-3" data-testid={`my-score-${n}`}>
              <div className="text-sm text-zinc-200 break-words min-w-0">
                <span className="font-mono text-[#D89090]">{n}R</span>
                <span className="font-semibold ml-2">{s.name}</span>
                <span className="font-mono text-zinc-400"> · {s.total_score} pts</span>
                {s.mode === "guest" && <span className="ml-2 text-[10px] text-zinc-500">(guest)</span>}
              </div>
              <button
                onClick={() => onDelete(s.id, n)}
                disabled={deletingId === s.id}
                data-testid={`delete-my-score-${n}`}
                className="shrink-0 inline-flex items-center justify-center gap-2 border border-[#FF3333]/40 text-[#FF6666] hover:bg-[#FF3333]/10 disabled:opacity-50 px-3 py-2 rounded-md text-xs font-semibold"
              >
                {deletingId === s.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />} Delete {n}R
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myScores, setMyScores] = useState(() => readMyScores());
  const [deletingId, setDeletingId] = useState(null);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem("cf_admin_token") || null);

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

  function persistMyScores(map) {
    setMyScores(map);
    localStorage.setItem("cf_my_scores", JSON.stringify(map));
  }

  async function handleDelete(id, roundsKey) {
    if (!id) return;
    if (!window.confirm(`Delete your saved ${roundsKey}-round score from this browser?`)) return;
    setDeletingId(id);
    try {
      await deleteLeaderboardEntry(id, getOwnerToken());
      const map = { ...myScores }; delete map[String(roundsKey)];
      persistMyScores(map);
      toast.success(`Your ${roundsKey}-round score was deleted.`);
      load();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        const map = { ...myScores }; delete map[String(roundsKey)];
        persistMyScores(map);
        toast.message("That score no longer exists. Cleared from this browser.");
        load();
      } else if (status === 403) {
        toast.error("This score is not owned by this browser.");
      } else {
        toast.error("Could not delete your score. Try again.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAdminDelete(entryId) {
    if (!adminToken) return;
    if (!window.confirm("Admin: delete this leaderboard entry?")) return;
    try {
      await adminDeleteEntry(entryId, adminToken);
      toast.success("Entry deleted.");
      const map = { ...myScores };
      for (const k of Object.keys(map)) if (map[k]?.id === entryId) delete map[k];
      persistMyScores(map);
      load();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) toast.error("Invalid admin token.");
      else if (status === 503) toast.error("Admin delete is disabled on the server.");
      else if (status === 404) { toast.message("Entry already gone."); load(); }
      else toast.error("Could not delete entry.");
    }
  }

  const { rows, guests } = aggregate(entries);
  const myIds = new Set(MODES.map((n) => myScores[String(n)]?.id).filter(Boolean));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12 min-w-0" data-testid="leaderboard-page">
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="text-[#D32F2F]" />
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Leaderboard</h1>
      </div>
      <p className="text-zinc-400 mb-6 sm:mb-8">Best totals per session length. 3, 5, and 10 round runs are ranked separately.</p>

      <MyScoresPanel myScores={myScores} deletingId={deletingId} onDelete={handleDelete} />

      <AdminPanel token={adminToken} onChange={setAdminToken} />

      <LeaderboardBody
        loading={loading}
        rows={rows}
        myIds={myIds}
        adminToken={adminToken}
        onAdminDelete={handleAdminDelete}
      />

      <GuestList guests={guests} adminToken={adminToken} onAdminDelete={handleAdminDelete} />
    </div>
  );
}
