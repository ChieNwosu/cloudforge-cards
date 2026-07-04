import { Link } from "react-router-dom";
import { ArrowRight, Layers, Sparkles, ShieldCheck, Cpu, Zap, BarChart3 } from "lucide-react";

const features = [
  { icon: Layers, title: "30+ AWS service cards", body: "Each with category, cost, security & scale ratings." },
  { icon: Sparkles, title: "Transparent scoring", body: "Six explainable sub-scores, no black box." },
  { icon: ShieldCheck, title: "Constraint chips", body: "Low cost, secure, serverless, scalable, and more." },
  { icon: Cpu, title: "Hybrid AI judging", body: "Rule engine + Claude commentary on every round." },
  { icon: Zap, title: "3, 5, or 10-round sessions", body: "Choose 3, 5, or 10 rounds. Track your best score by mode." },
  { icon: BarChart3, title: "Local leaderboard", body: "Track 3R, 5R, and 10R best scores." },
];

export default function Landing() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 cf-grid-bg opacity-50" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 70% 20%, rgba(0,85,255,0.28), transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(255,213,0,0.10), transparent 55%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 cf-fade-up">
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-1 rounded-full text-xs font-mono uppercase tracking-[0.18em] text-zinc-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" /> Play · Learn · Test
            </div>
            <p className="text-sm font-mono uppercase tracking-[0.16em] text-[#D4AF37] mb-3" data-testid="hero-tagline">Forge Your Cloud Mastery</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[0.95] tracking-tight">
              Design AWS<br />
              architectures.<br />
              <span className="text-[#7E1818]">Card by card.</span>
            </h1>
            <p className="mt-6 text-lg text-zinc-300 max-w-xl leading-relaxed">
              CloudForge Cards is a gamified AWS architecture trainer and study tool.
              Play architecture rounds, study service flashcards, and test your cloud
              knowledge with track-filtered quizzes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/play"
                data-testid="hero-play-button"
                className="group inline-flex items-center gap-2 bg-[#7E1818] hover:bg-[#A02828] text-white px-6 py-3 rounded-md font-semibold transition-colors"
              >
                Start solo run <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/learn/cards"
                data-testid="hero-flashcards-button"
                className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 hover:bg-white/5 text-white px-6 py-3 rounded-md font-semibold transition-colors"
              >
                Study flashcards
              </Link>
              <Link
                to="/learn/test"
                data-testid="hero-test-button"
                className="inline-flex items-center gap-2 border border-[#D4AF37]/40 hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/10 text-[#E6C75A] px-6 py-3 rounded-md font-semibold transition-colors"
              >
                Start test mode
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2" data-testid="hero-round-modes">
              <span className="text-xs font-mono uppercase tracking-[0.14em] text-zinc-500 mr-1">Quick start:</span>
              {[3, 5, 10].map((n) => (
                <Link
                  key={n}
                  to={`/play?rounds=${n}`}
                  data-testid={`hero-round-${n}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-mono border border-white/15 text-zinc-300 hover:border-[#7E1818]/60 hover:text-white transition-colors"
                >
                  {n} rounds
                </Link>
              ))}
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-zinc-400 font-mono">
              <div><span className="text-white font-bold text-lg">30</span> service cards</div>
              <div className="w-px h-6 bg-white/10" />
              <div><span className="text-white font-bold text-lg">10</span> scenarios</div>
              <div className="w-px h-6 bg-white/10" />
              <div><span className="text-white font-bold text-lg">8</span> constraints</div>
            </div>
          </div>

          {/* Sample card stack */}
          <div className="lg:col-span-5 relative h-[420px] hidden lg:block">
            <SampleCard
              title="Lambda" category="Compute" tags={["serverless", "event"]}
              className="absolute top-6 left-4 -rotate-6"
            />
            <SampleCard
              title="DynamoDB" category="Database" tags={["nosql", "scale"]}
              accent
              className="absolute top-12 left-32 rotate-2 z-10"
            />
            <SampleCard
              title="CloudFront" category="Network" tags={["cdn", "edge"]}
              className="absolute top-44 left-12 rotate-3"
            />
            <SampleCard
              title="S3" category="Storage" tags={["object", "durable"]}
              className="absolute top-56 left-44 -rotate-3"
            />
            {/* v0.3 study accent: a small flashcard / quiz element */}
            <div className="absolute bottom-0 left-6 rotate-[-2deg] w-52 bg-[#0C0E11] border border-[#D4AF37]/40 rounded-lg p-4 z-20 cf-glow" data-testid="hero-study-card">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#D4AF37] mb-1">Flashcards · Quiz</div>
              <div className="text-base font-bold mb-1">Test your cloud instincts</div>
              <div className="text-[11px] text-zinc-400">Flip cards, then take a 15-question track quiz.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-24">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#7E1818] mb-3">
                /// what&apos;s in the box
              </div>
              <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight">
                Built for cloud certification learners.
              </h2>
            </div>
            <p className="text-zinc-400 max-w-md">
              No memorization. Just hands-on reasoning about cost, security,
              scalability, and trade-offs, the way real architects think.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden">
            {features.map((f) => (
              <div key={f.title} className="bg-[#0C0E11] p-7 hover:bg-[#10131A] transition-colors">
                <f.icon size={22} className="text-[#7E1818] mb-4" />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
              Ready to ship your first architecture?
            </h2>
            <p className="text-zinc-400 max-w-md">
              Choose a 3, 5, or 10-round run. Your score, critique, and mode-specific
              leaderboard update after the session.
            </p>
          </div>
          <div className="flex lg:justify-end">
            <Link
              to="/play"
              data-testid="cta-play-button"
              className="group inline-flex items-center gap-2 bg-[#D32F2F] hover:bg-yellow-300 text-black px-7 py-4 rounded-md font-semibold transition-colors"
            >
              Deal me in <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-500 font-mono">
          <span data-testid="footer-disclaimer">
            Unofficial educational project. Not affiliated with Amazon Web Services.
          </span>
          <span data-testid="footer-version">v0.4.1 Study Progress, XP Lite, Mastery, and Spaced Review</span>
        </div>
      </footer>
    </div>
  );
}

function SampleCard({ title, category, tags, className = "", accent = false }) {
  return (
    <div
      className={`w-56 h-72 bg-[#121417] border ${accent ? "border-[#7E1818] cf-glow" : "border-white/10"} rounded-lg p-5 flex flex-col ${className}`}
    >
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">{category}</div>
      <div className="text-xl font-bold">{title}</div>
      <div className="mt-auto flex flex-wrap gap-1.5">
        {tags.map(t => (
          <span key={t} className="text-[10px] font-mono px-2 py-1 bg-white/5 border border-white/10 rounded">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
