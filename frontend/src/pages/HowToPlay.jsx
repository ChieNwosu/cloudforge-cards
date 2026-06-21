import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const steps = [
  { n: "01", t: "Read the scenario", d: "Each round shows an architecture problem and two constraint chips (e.g. 'Low Cost', 'Secure')." },
  { n: "02", t: "Pick 3 to 6 service cards", d: "Build the simplest design that fits the scenario and constraints, overengineering costs you points." },
  { n: "03", t: "(Optional) explain yourself", d: "Write a short justification. It's saved on the scoreboard but does not affect scoring, keep things transparent." },
  { n: "04", t: "Submit & read the review", d: "Six explainable sub-scores plus an AI architect critique tell you what worked and what didn't." },
  { n: "05", t: "Win the best-of-3", d: "Three scenarios per session. Save your total to the leaderboard." },
];

const scores = [
  ["Service Fit", "0 – 25", "How well your services match the scenario's needed categories and tags."],
  ["Cost Alignment", "-10 – 15", "Lean lineup rewarded when 'Low Cost' is in play."],
  ["Security Alignment", "-10 – 15", "Bonus for explicit security services when 'Secure' is requested."],
  ["Scalability Alignment", "-10 – 15", "Higher scores for services that scale on their own."],
  ["Synergy Bonus", "0 – 20", "Known good AWS pairings (e.g. Lambda + API Gateway)."],
  ["Overengineering", "-20 – 0", "Penalty for too many or too complex services."],
];

export default function HowToPlay() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12" data-testid="how-to-page">
      <div>
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#7E1818] mb-3">/// how to play</div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">The rules in 60 seconds.</h1>
        <p className="text-zinc-400 max-w-xl">A round of CloudForge takes about three minutes. No memorisation, just reasoning about trade-offs.</p>
      </div>

      <div className="space-y-3">
        {steps.map(s => (
          <div key={s.n} className="border border-white/10 rounded-lg bg-[#0C0E11] p-5 flex gap-5">
            <div className="text-2xl font-mono font-bold text-[#7E1818] tabular-nums">{s.n}</div>
            <div>
              <div className="font-semibold mb-1">{s.t}</div>
              <p className="text-sm text-zinc-400 leading-relaxed">{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Scoring (max 100)</h2>
        <div className="rounded-lg border border-white/10 bg-[#0C0E11] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs font-mono uppercase tracking-[0.12em] text-zinc-500 border-b border-white/10">
              <tr>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3 w-32">Range</th>
                <th className="text-left px-5 py-3">What it measures</th>
              </tr>
            </thead>
            <tbody>
              {scores.map(([cat, range, desc]) => (
                <tr key={cat} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-4 font-medium">{cat}</td>
                  <td className="px-5 py-4 font-mono text-zinc-400">{range}</td>
                  <td className="px-5 py-4 text-zinc-400">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link
        to="/play"
        data-testid="how-to-play-cta"
        className="inline-flex items-center gap-2 bg-[#7E1818] hover:bg-[#A02828] text-white px-6 py-3 rounded-md font-semibold"
      >
        Start your first round <ArrowRight size={18} />
      </Link>
    </div>
  );
}
