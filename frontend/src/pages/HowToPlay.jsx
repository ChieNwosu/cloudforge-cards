import { Link } from "react-router-dom";
import { ArrowRight, Volume2 } from "lucide-react";

const steps = [
  { n: "01", t: "Read the scenario", d: "Each round shows a unique AWS architecture problem plus two constraint chips, such as Low Cost or Secure." },
  { n: "02", t: "Pick 3 to 6 service cards", d: "Build the simplest design that fits the scenario and constraints. Overengineering can cost you points." },
  { n: "03", t: "Optional: explain your architecture", d: "Write a short justification for your design. A relevant explanation earns up to 5 bonus points. Your round score is capped at 100, but if the bonus pushes you past 100, the extra points are banked as an overflow bonus and added to your final session total." },
  { n: "04", t: "Submit and read the review", d: "Six explainable sub-scores plus an architect critique tell you what worked, what missed, and how your design matched the scenario." },
  { n: "05", t: "Finish your selected session", d: "Complete 3, 5, or 10 rounds depending on your mode. A final session summary appears after the last round, then you can save your total to the matching leaderboard." },
];

const scores = [
  ["Correct Service Selection", "+0 to +30", "How well your chosen services fit the scenario. Distractor picks lower this."],
  ["Ideal Architecture Match", "+0 to +25", "Closeness to a known ideal combo. Exact matches score full, partial matches earn partial credit."],
  ["Constraint Alignment", "+0 to +20", "How well the design satisfies the round's active constraints. With no constraints, this is judged on general best-practice fit."],
  ["Synergy Bonus", "+0 to +15", "Known good AWS pairings (e.g. Lambda + API Gateway). Two or more strong pairings earn the full bonus."],
  ["Simplicity / Overengineering", "+0 to +10", "Right-sized designs earn the full +10 credit. Too many or too few services apply a penalty and you lose points from the 10."],
  ["Explanation Bonus", "+0 to +5", "A relevant written justification. The round stays capped at 100, and any bonus beyond 100 carries over as an overflow bonus to your session total."],
];

export default function HowToPlay() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12" data-testid="how-to-page">
      <div>
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#7E1818] mb-3">/// how to play</div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">The rules in 60 seconds.</h1>
        <p className="text-zinc-400 max-w-xl">Choose a 3-round, 5-round, or 10-round CloudForge session. No memorization, just reasoning about AWS architecture trade-offs.</p>
      </div>

      <div className="rounded-lg border border-[#7E1818]/30 bg-[#7E1818]/[0.05] p-4 flex items-start gap-3" data-testid="accessibility-note">
        <Volume2 size={18} className="text-[#D89090] shrink-0 mt-0.5" />
        <p className="text-sm text-zinc-300 leading-relaxed">
          Use the Audio and Voice controls to have Professor Flock read scenarios, questions, flashcards, prompts, and explanations aloud.
        </p>
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
