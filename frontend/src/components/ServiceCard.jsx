import { Star } from "lucide-react";

const CAT_ICONS = {
  Compute: "▣",
  Storage: "◧",
  Database: "◉",
  Network: "◈",
  Security: "✦",
  Analytics: "≡",
  Integration: "⇆",
  Monitoring: "◐",
};

export default function ServiceCard({ card, selected, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      data-testid={`service-card-${card.id}`}
      className={`relative text-left bg-[#121417] border border-white/10 rounded-lg p-4 h-full flex flex-col cf-card-hover ${
        selected ? "cf-card-selected" : ""
      } ${disabled && !selected ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[#7E1818] text-lg leading-none">{CAT_ICONS[card.category] || "◆"}</span>
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">
            {card.category}
          </span>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={`star-${i + 1}`}
              size={10}
              className={i < card.difficulty ? "text-[#D32F2F] fill-[#D32F2F]" : "text-zinc-700"}
            />
          ))}
        </div>
      </div>

      <div className="font-bold text-lg leading-tight mb-1">{card.title}</div>
      <p className="text-xs text-zinc-400 leading-relaxed mb-3 line-clamp-3">{card.description}</p>

      <div className="mt-auto">
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span>$ {"$".repeat(card.cost)}</span>
          <span>SEC {card.security}</span>
          <span>SCL {card.scalability}</span>
        </div>
      </div>

      {selected && (
        <div className="absolute -top-2 -right-2 bg-[#7E1818] text-white text-[10px] font-bold rounded-full w-6 h-6 grid place-items-center">
          ✓
        </div>
      )}
    </button>
  );
}
