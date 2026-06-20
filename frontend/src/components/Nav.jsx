import { NavLink, Link } from "react-router-dom";
import { Cloud } from "lucide-react";

const navItems = [
  { to: "/play", label: "Play", id: "nav-play" },
  { to: "/leaderboard", label: "Leaderboard", id: "nav-leaderboard" },
  { to: "/how-to-play", label: "How to Play", id: "nav-how" },
];

export default function Nav() {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl bg-[#090A0B]/70 border-b border-white/10"
      data-testid="app-nav"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" data-testid="nav-home">
          <span className="grid place-items-center w-8 h-8 rounded-md bg-[#0055FF] text-white">
            <Cloud size={18} strokeWidth={2.4} />
          </span>
          <span className="font-bold tracking-tight text-lg">
            CloudForge<span className="text-[#FFD500]"> Cards</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={n.id}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
