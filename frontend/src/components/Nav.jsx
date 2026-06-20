import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Cloud, Menu, X } from "lucide-react";

const navItems = [
  { to: "/play", label: "Play", id: "nav-play" },
  { to: "/leaderboard", label: "Leaderboard", id: "nav-leaderboard" },
  { to: "/how-to-play", label: "How to Play", id: "nav-how" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl bg-[#090A0B]/80 border-b border-white/10"
      data-testid="app-nav"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="nav-home" onClick={() => setOpen(false)}>
          <span className="grid place-items-center w-8 h-8 rounded-md bg-[#7E1818] text-white">
            <Cloud size={18} strokeWidth={2.4} />
          </span>
          <span className="font-bold tracking-tight text-base sm:text-lg whitespace-nowrap">
            CloudForge<span className="text-[#D32F2F]"> Cards</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={n.id}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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

        {/* Mobile burger */}
        <button
          onClick={() => setOpen((o) => !o)}
          data-testid="nav-burger"
          aria-label="Toggle navigation"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-white/10 hover:bg-white/5"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#090A0B]/95 backdrop-blur-xl" data-testid="nav-mobile-menu">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`${n.id}-mobile`}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-300 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
